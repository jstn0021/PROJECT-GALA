import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/currentUser";
import { listBucketItems, createBucketItem } from "../../../lib/tripsStore";

export const dynamic = "force-dynamic";

// Helper para ma-bypass ang Auth sa local development/testing
async function getAuthenticatedUser() {
  try {
    const user = await getCurrentUser();
    if (user) return user;
  } catch (err) {
    console.warn("Auth check failed, using mock dev user");
  }

  // MOCK DEV USER: Ito ang gagamitin kapag walang nakalogin
  return {
    id: "dev-user-id-123",
    email: "dev@projectgala.ph",
    name: "Developer",
  };
}

// Nililinis at chine-check ang pangalan ng place
function cleanName(value) {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name) return { error: "Place name is required." };
  if (name.length > 150) return { error: "Place name is too long." };
  return { name };
}

function cleanText(value, max) {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v && v.length <= max ? v : null;
}

// Tinatanggap lang ang http(s) link o path sa /public
function cleanImage(value) {
  const v = cleanText(value, 500);
  if (!v) return null;
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  return /^https?:\/\//i.test(v) ? v : null;
}

// GET /api/bucket-list: listahan ng places ng user
export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    const places = await listBucketItems(user.id);
    return NextResponse.json({ places });
  } catch (error) {
    console.error("GET /api/bucket-list failed:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong", code: error?.code },
      { status: 500 },
    );
  }
}

// POST /api/bucket-list: magdagdag ng place.
// Body: { "name": "Kyoto", "image": "https://...", "location": "Japan" }
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { name, error } = cleanName(body?.name);
    if (error)
      return NextResponse.json({ errors: { name: error } }, { status: 400 });

    const place = await createBucketItem(user.id, name, {
      image: cleanImage(body?.image),
      location: cleanText(body?.location, 200),
    });
    return NextResponse.json(place, { status: 201 });
  } catch (error) {
    if (error?.code === "DUPLICATE") {
      return NextResponse.json(
        { errors: { name: "That place is already on your list." } },
        { status: 409 },
      );
    }
    console.error("POST /api/bucket-list failed:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong", code: error?.code },
      { status: 500 },
    );
  }
}
