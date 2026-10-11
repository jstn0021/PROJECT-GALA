import express from "express";
import {
  FEATURED_DESTINATIONS,
  getFeaturedPlaces,
  matchPhotoForPlace,
} from "../lib/destinations.js";

const router = express.Router();

/**
 * Format address parts from Nominatim address object
 */
function formatLocation(address = {}) {
  const parts = [
    address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county,
    address.state || address.province || address.region,
    address.country,
  ].filter(Boolean);

  return [...new Set(parts)].join(", ");
}

/**
 * Helper to build descriptions
 */
function createDescription(place, cleanName, locationStr) {
  const lowerName = cleanName.toLowerCase();
  const matchedCurated = FEATURED_DESTINATIONS.find(
    (f) =>
      lowerName.includes(f.name.toLowerCase()) ||
      f.name.toLowerCase().includes(lowerName),
  );

  if (matchedCurated) {
    return matchedCurated.description;
  }

  const type = place.type || "destination";
  const typeLabels = {
    city: "Isang masiglang lungsod",
    town: "Isang kaakit-akit na bayan",
    village: "Isang payapang pamayanan",
    island: "Isang magandang isla na perpekto para sa island getaway",
    beach:
      "Isang baybayin na may magagandang tanawin at sariwang simoy ng hangin",
    mountain: "Isang bulubundukin na may magandang tanawin at trekking trails",
    attraction: "Isang tanyag na pasyalan at tourist attraction",
    historic: "Isang makasaysayang pook na puno ng kultura at nakaraan",
    nature_reserve: "Isang protektadong kalikasan na sagana sa biodiversity",
    administrative: "Isang tanyag na rehiyon o probinsya",
  };

  const prefix = typeLabels[type] || "Isang tanyag na destinasyon";
  return `${prefix} na matatagpuan sa ${locationStr || "rehiyon na ito"}. Magandang bisitahin para sa paglalakbay at pamamasyal.`;
}

/**
 * GET /api/featured-places
 * Express endpoint for featured/random destinations
 */
router.get("/featured-places", async (req, res) => {
  try {
    const random = req.query.random === "true";
    const limit = parseInt(req.query.limit || "12", 10);
    const category = req.query.category || "all";

    let places = getFeaturedPlaces({
      random,
      limit: Number.isNaN(limit) ? 12 : limit,
      category,
    });

    // Optional Unsplash API integration kung may API key sa process.env
    if (process.env.UNSPLASH_ACCESS_KEY && req.query.live_unsplash === "true") {
      try {
        const query =
          category === "all"
            ? "philippines travel landscape"
            : `${category} travel landscape`;
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`,
          {
            headers: {
              Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            },
          },
        );
        if (response.ok) {
          const unsplashData = await response.json();
          if (unsplashData.results?.length > 0) {
            places = places.map((place, idx) => {
              const livePhoto = unsplashData.results[idx];
              return livePhoto
                ? { ...place, image: livePhoto.urls?.regular || place.image }
                : place;
            });
          }
        }
      } catch (e) {
        console.warn(
          "[express:featured-places] Unsplash fetch fallback:",
          e.message,
        );
      }
    }

    return res.json({
      success: true,
      count: places.length,
      places,
      data: places,
    });
  } catch (error) {
    console.error("GET /featured-places error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to load featured places",
      message: error.message,
    });
  }
});

/**
 * GET /api/search-places
 * Express endpoint connecting to free Nominatim (OpenStreetMap) API
 */
router.get("/search-places", async (req, res) => {
  try {
    const q = (req.query.q || req.query.query || "").trim();

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        query: q,
        count: 0,
        places: [],
        data: [],
      });
    }

    let nominatimResults = [];
    let usedFallback = false;

    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q,
      )}&format=json&addressdetails=1&extratags=1&namedetails=1&limit=12`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const osmRes = await fetch(nominatimUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "ProjectGalaApp/1.0 (travel-planner; contact@projectgala.app)",
          "Accept-Language": "en,fil;q=0.9",
        },
      });

      clearTimeout(timeoutId);

      if (osmRes.ok) {
        nominatimResults = await osmRes.json();
      } else {
        usedFallback = true;
      }
    } catch (fetchErr) {
      usedFallback = true;
    }

    let formattedPlaces = [];

    if (Array.isArray(nominatimResults) && nominatimResults.length > 0) {
      formattedPlaces = nominatimResults.map((item) => {
        const cleanName = item.name || item.display_name.split(",")[0].trim();
        const address = item.address || {};
        const locationStr = formatLocation(address);
        const description = createDescription(item, cleanName, locationStr);
        const image = matchPhotoForPlace(cleanName, item.type, address);

        return {
          id: `osm-${item.place_id}`,
          osmId: item.osm_id,
          name: cleanName,
          location: locationStr || cleanName,
          country: address.country || "",
          displayName: item.display_name,
          category:
            item.type === "beach" || item.type === "island"
              ? "Beaches & Islands"
              : "Destinations",
          rating: (4.5 + (item.place_id % 5) * 0.1).toFixed(1),
          image,
          description,
          tags: [item.type?.replace(/_/g, " "), address.country].filter(
            Boolean,
          ),
          coordinates: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          },
          source: "nominatim",
        };
      });
    }

    // Fallback sa curated list kung walang resulta
    if (formattedPlaces.length === 0 || usedFallback) {
      const qLower = q.toLowerCase();
      const matches = FEATURED_DESTINATIONS.filter((d) => {
        return (
          d.name.toLowerCase().includes(qLower) ||
          d.location.toLowerCase().includes(qLower) ||
          d.tags.some((t) => t.toLowerCase().includes(qLower))
        );
      });
      formattedPlaces = matches.map((m) => ({ ...m, source: "curated" }));
    }

    return res.json({
      success: true,
      query: q,
      count: formattedPlaces.length,
      source: usedFallback ? "fallback-curated" : "nominatim",
      places: formattedPlaces,
      data: formattedPlaces,
    });
  } catch (error) {
    console.error("GET /search-places error:", error);
    return res.status(500).json({
      success: false,
      error: "Search failed",
      message: error.message,
    });
  }
});

export default router;
