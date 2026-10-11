import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/currentUser";
import { listBucketItems, createBucketItem } from "../../../lib/tripsStore";

export const dynamic = "force-dynamic";

// Nililinis at chine-check ang pangalan ng place
function cleanName(value) {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name) return { error: "Place name is required." };
  if (name.length > 150) return { error: "Place name is too long." };
  return { name };
}

// GET /api/bucket-list: listahan ng places ng user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const places = await listBucketItems(user.id);
    return NextResponse.json({ places });
  } catch (error) {
    console.error("GET /api/bucket-list failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// POST /api/bucket-list: magdagdag ng place. Body: { "name": "Kyoto" }
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { name, error } = cleanName(body?.name);
    if (error) return NextResponse.json({ errors: { name: error } }, { status: 400 });

    const place = await createBucketItem(user.id, name, {
      image: typeof body.image === "string" ? body.image : null,
      location: typeof body.location === "string" ? body.location : null,
    });

    return NextResponse.json(place, { status: 201 });
  }
  catch (error) {
    if (error.code === "DUPLICATE") {
      return NextResponse.json({ errors: { name: "That place is already on your list." } }, { status: 409 });
    }
    console.error("POST /api/bucket-list failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}