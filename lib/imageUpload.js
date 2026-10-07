const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 5 * 1024 * 1024;

// Returns { buffer, type, ext } o { error }
export async function readImage(file) {
  if (!file || typeof file === "string" || file.size === 0)
    return { none: true };
  const ext = TYPES[file.type];
  if (!ext) return { error: "Only JPG, PNG or WEBP images are allowed" };
  if (file.size > MAX_BYTES) return { error: "Image is too large (max 5 MB)" };
  return {
    buffer: Buffer.from(await file.arrayBuffer()),
    type: file.type,
    ext,
  };
}
