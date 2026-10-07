import { NextResponse } from "next/server";
import { getAdmin } from "lib/adminAuth";
import { SLOT_KEYS } from "lib/siteSlots";
import { uploadObject, deleteObject, publicUrl } from "lib/supabaseStorage";
import SiteImage from "db/models/siteImage";

const fail = (message, status) =>
  NextResponse.json({ error_message: message }, { status });

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 5 * 1024 * 1024;

async function guard(params) {
  const admin = await getAdmin();
  if (!admin) return { error: fail("Forbidden", 403) };
  const { slot } = await params;
  if (!SLOT_KEYS.includes(slot))
    return { error: fail("Unknown image slot", 400) };
  return { slot };
}

// Upload / palitan ang larawan. multipart/form-data, field: "file"
export async function POST(req, { params }) {
  const { slot, error } = await guard(params);
  if (error) return error;

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fail("Storage is not configured (check .env)", 500);
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return fail("No file uploaded", 400);

  const ext = TYPES[file.type];
  if (!ext) return fail("Only JPG, PNG or WEBP images are allowed", 400);
  if (file.size > MAX_BYTES) return fail("Image is too large (max 5 MB)", 400);

  const path = `${slot}-${Date.now()}.${ext}`;
  try {
    await uploadObject(path, Buffer.from(await file.arrayBuffer()), file.type);
  } catch (e) {
    return fail(e.message || "Upload failed", 500);
  }

  const old = await SiteImage.findByPk(slot);
  const url = publicUrl(path);
  await SiteImage.upsert({ slot, url, path });
  if (old?.path) await deleteObject(old.path);

  return NextResponse.json({ ok: true, url });
}

// Burahin ang custom na larawan (babalik sa default)
export async function DELETE(_req, { params }) {
  const { slot, error } = await guard(params);
  if (error) return error;

  const row = await SiteImage.findByPk(slot);
  if (row) {
    await deleteObject(row.path);
    await row.destroy();
  }
  return NextResponse.json({ ok: true });
}
