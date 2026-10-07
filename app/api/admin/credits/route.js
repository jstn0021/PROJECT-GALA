import { NextResponse } from "next/server";
import { getAdmin } from "lib/adminAuth";
import { readImage } from "lib/imageUpload";
import { uploadObject, publicUrl } from "lib/supabaseStorage";
import Credit from "db/models/credit";

const fail = (message, status) =>
  NextResponse.json({ error_message: message }, { status });

// Magdagdag ng member. multipart/form-data: name, role, file (optional)
export async function POST(req) {
  const admin = await getAdmin();
  if (!admin) return fail("Forbidden", 403);

  const form = await req.formData().catch(() => null);
  const name = String(form?.get("name") ?? "").trim();
  const role = String(form?.get("role") ?? "").trim();
  const description = String(form?.get("description") ?? "").trim();
  if (!name || !role) return fail("Name and role are required", 400);
  if (description.length > 300)
    return fail("Description is too long (max 300 characters)", 400);
  if (name.length > 120 || role.length > 120)
    return fail("Name or role is too long", 400);

  let photoUrl = null;
  let photoPath = null;
  const img = await readImage(form.get("file"));
  if (img.error) return fail(img.error, 400);
  if (!img.none) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return fail("Storage is not configured (check .env)", 500);
    }
    photoPath = `credit-${Date.now()}.${img.ext}`;
    try {
      await uploadObject(photoPath, img.buffer, img.type);
    } catch (e) {
      return fail(e.message || "Upload failed", 500);
    }
    photoUrl = publicUrl(photoPath);
  }

  const max = (await Credit.max("sortOrder")) ?? 0;
  const row = await Credit.create({
    name,
    role,
    description: description || null,
    photoUrl,
    photoPath,
    sortOrder: max + 1,
  });
  return NextResponse.json({ ok: true, id: row.id });
}
