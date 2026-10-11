const base = () => process.env.SUPABASE_URL;
const bucket = () => process.env.SUPABASE_BUCKET || "site-images";
const enc = (p) => p.split("/").map(encodeURIComponent).join("/");

function authHeaders(extra = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const h = { apikey: key, ...extra };
  if (key && key.startsWith("eyJ")) h.Authorization = `Bearer ${key}`;
  return h;
}

export function publicUrl(path) {
  return `${base()}/storage/v1/object/public/${bucket()}/${enc(path)}`;
}

export async function uploadObject(path, buffer, contentType) {
  const res = await fetch(
    `${base()}/storage/v1/object/${bucket()}/${enc(path)}`,
    {
      method: "POST",
      headers: authHeaders({ "Content-Type": contentType, "x-upsert": "true" }),
      body: buffer,
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Storage upload failed (${res.status}) ${text}`);
  }
}

export async function deleteObject(path) {
  try {
    await fetch(`${base()}/storage/v1/object/${bucket()}/${enc(path)}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  } catch {}
}
