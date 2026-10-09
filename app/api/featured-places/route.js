import { NextResponse } from "next/server";
import { getFeaturedPlaces } from "@/lib/destinations";

export const dynamic = "force-dynamic";

/**
 * GET /api/featured-places
 * Query parameters:
 *  - random: "true" | "false" (shuffle destinations for dynamic discovery)
 *  - limit: number (default 12)
 *  - category: "all" | "beaches" | "mountains" | "heritage" | "cities"
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const random = searchParams.get("random") === "true";
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const category = searchParams.get("category") || "all";

    // Kunin ang mga featured / random destinations
    let places = getFeaturedPlaces({
      random,
      limit: Number.isNaN(limit) ? 12 : limit,
      category,
    });

    // Optional: Kung may naka-configure na UNSPLASH_ACCESS_KEY sa env,
    // pwede ring mag-fetch mula sa live Unsplash Search API
    if (process.env.UNSPLASH_ACCESS_KEY && searchParams.get("live_unsplash") === "true") {
      try {
        const query = category === "all" ? "philippines travel landscape" : `${category} travel landscape`;
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`,
          {
            headers: {
              Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            },
            next: { revalidate: 3600 },
          }
        );
        if (res.ok) {
          const unsplashData = await res.json();
          if (unsplashData.results && unsplashData.results.length > 0) {
            // Pag-samahin ang live unsplash images sa curated destinations
            places = places.map((place, idx) => {
              const livePhoto = unsplashData.results[idx];
              if (livePhoto) {
                return {
                  ...place,
                  image: livePhoto.urls?.regular || place.image,
                  photographer: livePhoto.user?.name,
                };
              }
              return place;
            });
          }
        }
      } catch (unsplashErr) {
        console.warn("[featured-places] Unsplash API fallback to curated:", unsplashErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      count: places.length,
      places,
      data: places, // Backwards compatible with lib/server/http
    });
  } catch (error) {
    console.error("GET /api/featured-places error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load featured places",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
