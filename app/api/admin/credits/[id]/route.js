import { NextResponse } from "next/server";
import { getAdmin } from "lib/adminAuth";
import { readImage } from "lib/imageUpload";
import { uploadObject, deleteObject, publicUrl } from "lib/supabaseStorage";
import Credit from "db/models/credit";

const fail = (message, status) =>
  NextResponse.json({ error_message: message }, { status });

// I-edit: name, role, file (bagong photo), removePhoto="1"  (lahat optional)
export async function PATCH(req, { params }) {
  const admin = await getAdmin();
  if (!admin) return fail("Forbidden", 403);

  const { id } = await params;
  const row = await Credit.findByPk(id);
  if (!row) return fail("Not found", 404);

  const form = await req.formData().catch(() => null);
  if (!form) return fail("Invalid request", 400);

  const updates = {};
  if (form.has("name")) {
    const name = String(form.get("name")).trim();
    if (!name || name.length > 120) return fail("Invalid name", 400);
    updates.name = name;
  }
  if (form.has("role")) {
    const role = String(form.get("role")).trim();
    if (!role || role.length > 120) return fail("Invalid role", 400);
    updates.role = role;
  }

  if (form.has("description")) {
    const description = String(form.get("description")).trim();
    if (description.length > 300)
      return fail("Description is too long (max 300 characters)", 400);
    updates.description = description || null;
  }

  const oldPath = row.photoPath;
  const img = await readImage(form.get("file"));
  if (img.error) return fail(img.error, 400);

  if (!img.none) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return fail("Storage is not configured (check .env)", 500);
    }
    const path = `credit-${row.id}-${Date.now()}.${img.ext}`;
    try {
      await uploadObject(path, img.buffer, img.type);
    } catch (e) {
      return fail(e.message || "Upload failed", 500);
    }
    updates.photoPath = path;
    updates.photoUrl = publicUrl(path);
  } else if (form.get("removePhoto") === "1") {
    updates.photoPath = null;
    updates.photoUrl = null;
  }

  await row.update(updates);
  if (oldPath && "photoPath" in updates) await deleteObject(oldPath);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const admin = await getAdmin();
  if (!admin) return fail("Forbidden", 403);

  const { id } = await params;
  const row = await Credit.findByPk(id);
  if (row) {
    if (row.photoPath) await deleteObject(row.photoPath);
    await row.destroy();
  }
  return NextResponse.json({ ok: true });
}
