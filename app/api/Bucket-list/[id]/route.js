import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/currentUser";
import { updateBucketItem, deleteBucketItem } from "../../../../lib/tripsStore";

export const dynamic = "force-dynamic";

// Ang id mula sa URL ay text, kaya ginagawang numero at chine-check
function parseId(raw) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// PATCH /api/bucket-list/3. Body: { "completed": true } at/o { "name": "Kyoto" }
export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const patch = {};

    if (body.completed !== undefined) {
      if (typeof body.completed !== "boolean") {
        return NextResponse.json({ errors: { completed: "Must be true or false." } }, { status: 400 });
      }
      patch.completed = body.completed;
    }

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name || name.length > 150) {
        return NextResponse.json({ errors: { name: "Name must be 1 to 150 characters." } }, { status: 400 });
      }
      patch.name = name;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const place = await updateBucketItem(user.id, id, patch);
    if (!place) return NextResponse.json({ error: "Place not found" }, { status: 404 });

    return NextResponse.json(place);
  } catch (error) {
    if (error.code === "DUPLICATE") {
      return NextResponse.json({ errors: { name: "That place is already on your list." } }, { status: 409 });
    }
    console.error("PATCH /api/bucket-list/[id] failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// DELETE /api/bucket-list/3
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const removed = await deleteBucketItem(user.id, id);
    if (!removed) return NextResponse.json({ error: "Place not found" }, { status: 404 });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/bucket-list/[id] failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}