import { NextResponse } from "next/server";
import { getSiteImages } from "lib/siteImages";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getSiteImages(), {
    headers: { "Cache-Control": "no-store" },
  });
}
