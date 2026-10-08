import { NextResponse } from "next/server";

/* ─────────────────────────────────────────────────────────────────────────────
 * CONSTANTS
 * ───────────────────────────────────────────────────────────────────────────*/

/** Nominatim requires a descriptive User-Agent to avoid 403/ban. */
const UA = "PROJECT-GALA TravelApp/1.0 (contact@project-gala.app)";

/** Maximum results returned to the client. */
const RESULT_LIMIT = 6;

/**
 * Curated local fallback images keyed by lowercase keyword tokens.
 * First match wins.
 */
const LOCAL_FALLBACKS = [
  { tokens: ["el nido", "elnido", "palawan"], img: "/destinations/elnido.jpg" },
  { tokens: ["cebu"], img: "/destinations/cebu.jpg" },
  { tokens: ["siargao"], img: "/destinations/siargao.webp" },
  { tokens: ["baguio"], img: "/destinations/baguio.jpg" },
  { tokens: ["manila", "metro manila", "ncr"], img: "/destinations/baguio.jpg" },
];

/** Ultimate fallback when nothing else matches. */
const DEFAULT_FALLBACK = "/destinations/elnido.jpg";

/* ─────────────────────────────────────────────────────────────────────────────
 * ADDRESS FORMATTER
 * ───────────────────────────────────────────────────────────────────────────*/

/**
 * Builds a human-friendly PH address string:
 *   [City/Town/Municipality], [Province/State], Philippines
 *
 * Repeated tokens (e.g. "Bulacan, Bulacan") are kept intentionally because
 * they reflect real PH naming conventions (municipality == province name).
 *
 * @param {Object} address - Nominatim `address` object
 * @returns {string}
 */
function formatPhAddress(address = {}) {
  const {
    city,
    town,
    municipality,
    village,
    suburb,
    hamlet,
    state,
    province,
    region,
    country = "Philippines",
  } = address;

  const localArea = city || town || municipality || village || suburb || hamlet;
  const adminArea = province || state || region;

  const parts = [localArea, adminArea, country].filter(Boolean);
  return parts.join(", ");
}

/* ─────────────────────────────────────────────────────────────────────────────
 * QUERY CLEANER
 * ───────────────────────────────────────────────────────────────────────────*/

/**
 * Strips trailing "Philippines" duplicates the user may have typed and trims
 * whitespace to prevent Nominatim from getting confused by double-country tokens.
 *
 * @param {string} raw
 * @returns {string}
 */
function cleanQuery(raw = "") {
  return raw
    .trim()
    .replace(/,?\s*philippines\s*$/i, "")
    .trim();
}

/* ─────────────────────────────────────────────────────────────────────────────
 * LOCAL IMAGE FALLBACK
 * ───────────────────────────────────────────────────────────────────────────*/

/**
 * Returns a locally-hosted image path that best matches a place by scanning
 * the display_name for known keyword tokens.
 *
 * @param {string} displayName - raw Nominatim display_name
 * @returns {string} absolute public path
 */
function matchPhotoForPlace(displayName = "") {
  const lower = displayName.toLowerCase();
  for (const { tokens, img } of LOCAL_FALLBACKS) {
    if (tokens.some((t) => lower.includes(t))) return img;
  }
  return DEFAULT_FALLBACK;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * WIKIPEDIA / WIKIMEDIA PHOTO RESOLVER
 * ───────────────────────────────────────────────────────────────────────────*/

/**
 * Attempts to fetch a representative image from Wikipedia/Wikimedia.
 * Resolution order:
 *   1. extratags.wikipedia  → Wikipedia REST API page thumbnail
 *   2. extratags.wikidata   → Wikidata P18 (image) claim via MediaWiki Action API
 *   3. null  (caller falls back to local asset)
 *
 * Both requests share a single 4-second AbortController timeout so slow
 * responses never stall the overall Promise.all fan-out.
 *
 * @param {Object} place - raw Nominatim result object
 * @returns {Promise<string|null>}
 */
async function resolveWikiPhoto(place) {
  const extratags = place.extratags ?? {};
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    // ── 1. Wikipedia article thumbnail ──────────────────────────────────────
    if (extratags.wikipedia) {
      // Value is "en:Article_Title" or just "Article_Title"
      const raw = extratags.wikipedia;
      const colonIdx = raw.indexOf(":");
      const lang = colonIdx > -1 ? raw.slice(0, colonIdx) : "en";
      const title = colonIdx > -1 ? raw.slice(colonIdx + 1) : raw;

      const apiUrl =
        `https://${lang}.wikipedia.org/api/rest_v1/page/summary/` +
        encodeURIComponent(title.replace(/ /g, "_"));

      const res = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { "User-Agent": UA },
      });

      if (res.ok) {
        const data = await res.json();
        const img =
          data?.thumbnail?.source ??
          data?.originalimage?.source ??
          null;
        if (img) return img;
      }
    }

    // ── 2. Wikidata entity image (property P18) ──────────────────────────────
    if (extratags.wikidata) {
      const qid = extratags.wikidata; // e.g. "Q1419"
      const apiUrl =
        `https://www.wikidata.org/w/api.php?action=wbgetclaims` +
        `&entity=${encodeURIComponent(qid)}&property=P18&format=json`;

      const res = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { "User-Agent": UA },
      });

      if (res.ok) {
        const data = await res.json();
        const claims = data?.claims?.P18 ?? [];
        const filename = claims[0]?.mainsnak?.datavalue?.value ?? null;

        if (filename) {
          const encoded = encodeURIComponent(filename.replace(/ /g, "_"));
          return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=800`;
        }
      }
    }
  } catch {
    // AbortError or network failure — silently fall through to local fallback
  } finally {
    clearTimeout(timeout);
  }

  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * NOMINATIM SEARCH
 * ───────────────────────────────────────────────────────────────────────────*/

/**
 * Fetches places from Nominatim restricted to the Philippines.
 *
 * @param {string} q - cleaned search query
 * @returns {Promise<Object[]>} raw Nominatim result array
 */
async function nominatimSearch(q) {
  const params = new URLSearchParams({
    q,
    format: "jsonv2",
    countrycodes: "ph",
    addressdetails: "1",
    extratags: "1",
    limit: String(RESULT_LIMIT),
  });

  const url = `https://nominatim.openstreetmap.org/search?${params}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Nominatim error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/* ─────────────────────────────────────────────────────────────────────────────
 * RESULT MAPPER
 * ───────────────────────────────────────────────────────────────────────────*/

/**
 * Transforms a raw Nominatim result + resolved photo into the client shape:
 *
 * {
 *   id:       string   – unique place_id
 *   name:     string   – primary display name
 *   label:    string   – formatted PH address
 *   location: string   – alias of label (legacy compat for LandingSearchBar)
 *   lat:      number
 *   lng:      number
 *   image:    string   – photo URL or local asset path
 *   type:     string   – Nominatim category (e.g. "tourism")
 * }
 *
 * @param {Object}      place - raw Nominatim result
 * @param {string|null} photo - resolved wiki photo or null
 * @returns {Object}
 */
function mapResult(place, photo) {
  const address = place.address ?? {};

  const name =
    place.name ||
    place.display_name?.split(",")[0]?.trim() ||
    "Unknown Place";

  const label = formatPhAddress(address);
  const image = photo ?? matchPhotoForPlace(place.display_name ?? "");

  return {
    id: String(place.place_id),
    name,
    label,
    location: label,
    lat: parseFloat(place.lat),
    lng: parseFloat(place.lon),
    image,
    type: place.category ?? place.type ?? "place",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * GET HANDLER
 * ───────────────────────────────────────────────────────────────────────────*/

/**
 * GET /api/search-places?q=<query>
 *
 * Query params:
 *   q  {string}  required – search term (auto-cleaned before forwarding)
 *
 * Response shape:
 *   200  { places: MappedPlace[] }
 *   400  { error: string }
 *   500  { error: string }
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("q") ?? "";

  // ── Validate ────────────────────────────────────────────────────────────────
  const q = cleanQuery(raw);
  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters." },
      { status: 400 },
    );
  }

  try {
    // ── 1. Nominatim search (PH-only) ───────────────────────────────────────
    const nominatimResults = await nominatimSearch(q);

    if (!nominatimResults.length) {
      return NextResponse.json({ places: [] });
    }

    // ── 2. Resolve photos in parallel (Promise.all fan-out) ─────────────────
    //    Each resolveWikiPhoto call has its own 4-second timeout so one slow
    //    image lookup can never block the entire response.
    const photos = await Promise.all(
      nominatimResults.map((place) => resolveWikiPhoto(place)),
    );

    // ── 3. Map to client shape ───────────────────────────────────────────────
    const places = nominatimResults.map((place, i) =>
      mapResult(place, photos[i]),
    );

    return NextResponse.json(
      { places },
      {
        status: 200,
        headers: {
          // Browser: 60 s; edge CDN: 5 min with stale-while-revalidate
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    console.error("[search-places] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch places. Please try again." },
      { status: 500 },
    );
  }
}
