import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const BUCKET_COLORS = ["coral", "lime", "blue", "green"];

const TABLE = "bucket_list"; // palitan kung ibang pangalan ang table mo
const COLS = "id, name, done, color, image, location";

const toPlace = (r) => ({
  id: r.id,
  name: r.name,
  completed: r.done,
  color: r.color,
  image: r.image,
  location: r.location,
});

function duplicateError() {
  const e = new Error("Already on your list");
  e.code = "DUPLICATE";
  return e;
}

export async function listBucketItems(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLS)
    .eq("user_id", userId)
    .order("id");
  if (error) throw error;
  return data.map(toPlace);
}

export async function createBucketItem(userId, name, extra = {}) {
  const { count } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const color = BUCKET_COLORS[(count ?? 0) % BUCKET_COLORS.length];

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      name,
      color,
      image: extra.image ?? null,
      location: extra.location ?? null,
    })
    .select(COLS)
    .single();

  if (error) {
    if (error.code === "23505") throw duplicateError();
    throw error;
  }
  return toPlace(data);
}

export async function updateBucketItem(userId, id, patch) {
  const update = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.completed !== undefined) update.done = patch.completed;

  const { data, error } = await supabase
    .from(TABLE)
    .update(update)
    .eq("id", id)
    .eq("user_id", userId)
    .select(COLS)
    .maybeSingle();

  if (error) {
    if (error.code === "23505") throw duplicateError();
    throw error;
  }
  return data ? toPlace(data) : null;
}

export async function deleteBucketItem(userId, id) {
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id");
  if (error) throw error;
  return data.length > 0;
}
