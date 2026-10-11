import { NextResponse } from "next/server";
import { getAdmin } from "lib/adminAuth";
import { readImage } from "lib/imageUpload";
import { uploadObject, publicUrl } from "lib/supabaseStorage";
import Credit from "db/models/credit";

const fail = (message, status) =>
  NextResponse.json({ error_message: message }, { status });

export async function POST(req) {
  const admin = await getAdmin();
  if (!admin) return fail("Forbidden", 403);

  const form = await req.formData().catch(() => null);
  if (!form) return fail("Invalid form data submission", 400);

  const name = String(form.get("name") ?? "").trim();
  const role = String(form.get("role") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();

  if (!name || !role) return fail("Name and role are required", 400);
  if (name.length > 120)
    return fail("Name is too long (max 120 characters)", 400);
  if (role.length > 1000)
    return fail("Role is too long (max 1000 characters)", 400);
  if (description.length > 1000)
    return fail("Description is too long (max 1000 characters)", 400);

  let photoUrl = null;
  let photoPath = null;

  const fileInput = form.get("file");
  const img = await readImage(fileInput);

  if (img?.error) return fail(img.error, 400);

  if (img && !img.none) {
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

  try {
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
  } catch (dbError) {
    console.error("Database Insert Error:", dbError);
    return fail("Failed to create credit entry", 500);
  }
}
