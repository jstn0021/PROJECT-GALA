// Kung may DB_HOST sa .env.local, MySQL ang gagamitin.
// Kung wala, gagamit ng memory (mawawala ang data kapag nag-restart ang server).
const useDb = Boolean(process.env.DB_HOST);

// Kulay ng gradient sa dashboard, ayon sa template
const COLORS = {
  Blank: ["#818cf8", "#5eead4"],
  Weekend: ["#fb7185", "#fdba74"],
  Solo: ["#5eead4", "#818cf8"],
  Family: ["#fde047", "#6ee7b7"],
  Adventure: ["#67e8f9", "#10b981"],
};
const colorFor = (template) => COLORS[template] ?? COLORS.Blank;

/* ------------------------------ MEMORY ------------------------------ */
const g = globalThis;
g.__trips ??= [];
g.__nextTripId ??= 1;

async function createTripMemory(userId, data) {
  const [color_from, color_to] = colorFor(data.template);
  const trip = {
    id: g.__nextTripId++,
    userId,
    ...data,
    status: "upcoming",
    spent: 0,
    color: [color_from, color_to],
    createdAt: new Date().toISOString(),
  };
  g.__trips.push(trip);
  return trip;
}

async function listTripsMemory(userId) {
  return g.__trips
    .filter((t) => t.userId === userId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/* ------------------------------ MYSQL ------------------------------- */
async function getDb() {
  // Dynamic import: hindi kailangan ang mysql2 hangga't hindi ginagamit ang DB
  const { db } = await import("./db.js");
  return db;
}

async function createTripMysql(userId, data) {
  const db = await getDb();
  const conn = await db.getConnection();
  const [color_from, color_to] = colorFor(data.template);

  try {
    // Transaction: lahat ng insert ay mase-save, o wala (kapag may pumalpak)
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO trips
         (user_id, title, start_date, end_date, status, notes, budget, template, color_from, color_to)
       VALUES (?, ?, ?, ?, 'upcoming', ?, ?, ?, ?, ?)`,
      [userId, data.title, data.startDate, data.endDate, data.notes, data.budget, data.template, color_from, color_to]
    );
    const tripId = result.insertId;

    if (data.activities.length > 0) {
      await conn.query("INSERT INTO trip_activities (trip_id, position, text) VALUES ?", [
        data.activities.map((text, i) => [tripId, i, text.slice(0, 255)]),
      ]);
    }
    if (data.budgetCategories.length > 0) {
      await conn.query("INSERT INTO trip_budget_categories (trip_id, name) VALUES ?", [
        data.budgetCategories.map((name) => [tripId, name.slice(0, 100)]),
      ]);
    }

    // Para lumabas sa "Recent activity" ng dashboard
    await conn.query("INSERT INTO activities (user_id, text) VALUES (?, ?)", [
      userId,
      data.template === "Blank"
        ? `Created plan for ${data.title}`
        : `Created plan from ${data.template} template`,
    ]);

    await conn.commit();
    return { id: tripId, userId, ...data, status: "upcoming", spent: 0, color: [color_from, color_to] };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function listTripsMysql(userId) {
  const db = await getDb();
  const [trips] = await db.query(
    `SELECT id, title, start_date AS startDate, end_date AS endDate, status, notes,
            budget, spent, template, color_from, color_to, journal_entry_id AS journalEntryId
     FROM trips WHERE user_id = ? ORDER BY start_date`,
    [userId]
  );
  if (trips.length === 0) return [];

  const ids = trips.map((t) => t.id);
  const [acts] = await db.query(
    "SELECT trip_id, text FROM trip_activities WHERE trip_id IN (?) ORDER BY position",
    [ids]
  );
  const [cats] = await db.query(
    "SELECT trip_id, name FROM trip_budget_categories WHERE trip_id IN (?)",
    [ids]
  );

  return trips.map((t) => ({
    ...t,
    destination: t.title,
    budget: Number(t.budget), // DECIMAL ay string sa mysql2
    spent: Number(t.spent),
    color: [t.color_from, t.color_to],
    activities: acts.filter((a) => a.trip_id === t.id).map((a) => a.text),
    budgetCategories: cats.filter((c) => c.trip_id === t.id).map((c) => c.name),
  }));
}

/* ------------------------------ EXPORTS ----------------------------- */
export const createTrip = (userId, data) =>
  useDb ? createTripMysql(userId, data) : createTripMemory(userId, data);

export const listTrips = (userId) =>
  useDb ? listTripsMysql(userId) : listTripsMemory(userId);

/* ==================================================================== */
/*                            BUCKET LIST                               */
/* ==================================================================== */
// Pareho ng trips: MySQL kapag may DB_HOST, memory kung wala.
// Ang frontend ay gumagamit ng color na pangalan ("coral", "lime"...),
// kaya dito ginagawang pares ng hex (at pabalik) para sa bucket_items table.
const BUCKET_COLORS = {
  coral: ["#fb7185", "#fdba74"],
  lime: ["#fde047", "#6ee7b7"],
  blue: ["#67e8f9", "#818cf8"],
  green: ["#6ee7b7", "#14b8a6"],
};
const BUCKET_COLOR_NAMES = Object.keys(BUCKET_COLORS);
const bucketColorName = (from) =>
  BUCKET_COLOR_NAMES.find((n) => BUCKET_COLORS[n][0] === from) ?? "green";

function duplicateError() {
  const e = new Error("Already on your list");
  e.code = "DUPLICATE";
  return e;
}

/* ------------------------------ MEMORY ------------------------------ */
g.__bucket ??= [];
g.__nextBucketId ??= 1;

const toPlace = (b) => ({ id: b.id, name: b.name, completed: b.completed, color: b.color });
const sameName = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

async function listBucketMemory(userId) {
  return g.__bucket.filter((b) => b.userId === userId).map(toPlace);
}

async function createBucketMemory(userId, name) {
  const mine = g.__bucket.filter((b) => b.userId === userId);
  if (mine.some((b) => sameName(b.name, name))) throw duplicateError();
  const item = {
    id: g.__nextBucketId++,
    userId,
    name,
    completed: false,
    color: BUCKET_COLOR_NAMES[mine.length % BUCKET_COLOR_NAMES.length],
  };
  g.__bucket.push(item);
  return toPlace(item);
}

async function updateBucketMemory(userId, id, patch) {
  const item = g.__bucket.find((b) => b.id === id && b.userId === userId);
  if (!item) return null;
  if (patch.name !== undefined) {
    const others = g.__bucket.filter((b) => b.userId === userId && b.id !== id);
    if (others.some((b) => sameName(b.name, patch.name))) throw duplicateError();
    item.name = patch.name;
  }
  if (patch.completed !== undefined) item.completed = patch.completed;
  return toPlace(item);
}

async function deleteBucketMemory(userId, id) {
  const index = g.__bucket.findIndex((b) => b.id === id && b.userId === userId);
  if (index === -1) return false;
  g.__bucket.splice(index, 1);
  return true;
}

/* ------------------------------ MYSQL ------------------------------- */
const rowToPlace = (r) => ({
  id: r.id,
  name: r.name,
  completed: Boolean(r.done), // BOOLEAN ay 0 o 1 sa MySQL
  color: bucketColorName(r.color_from),
});

async function listBucketMysql(userId) {
  const db = await getDb();
  const [rows] = await db.query(
    "SELECT id, name, done, color_from FROM bucket_items WHERE user_id = ? ORDER BY id",
    [userId]
  );
  return rows.map(rowToPlace);
}

async function createBucketMysql(userId, name) {
  const db = await getDb();

  const [dupes] = await db.query(
    "SELECT id FROM bucket_items WHERE user_id = ? AND LOWER(name) = LOWER(?) LIMIT 1",
    [userId, name]
  );
  if (dupes.length > 0) throw duplicateError();

  const [[{ total }]] = await db.query(
    "SELECT COUNT(*) AS total FROM bucket_items WHERE user_id = ?",
    [userId]
  );
  const colorName = BUCKET_COLOR_NAMES[total % BUCKET_COLOR_NAMES.length];
  const [color_from, color_to] = BUCKET_COLORS[colorName];

  const [result] = await db.query(
    "INSERT INTO bucket_items (user_id, name, done, color_from, color_to) VALUES (?, ?, FALSE, ?, ?)",
    [userId, name, color_from, color_to]
  );
  return { id: result.insertId, name, completed: false, color: colorName };
}

async function updateBucketMysql(userId, id, patch) {
  const db = await getDb();

  // Kasama ang user_id sa query: sariling item lang ng user ang mababago
  const [rows] = await db.query(
    "SELECT id, name, done, color_from FROM bucket_items WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  if (rows.length === 0) return null;
  const row = rows[0];

  const newName = patch.name ?? row.name;
  const newDone = patch.completed ?? Boolean(row.done);

  if (patch.name !== undefined) {
    const [dupes] = await db.query(
      "SELECT id FROM bucket_items WHERE user_id = ? AND LOWER(name) = LOWER(?) AND id <> ? LIMIT 1",
      [userId, newName, id]
    );
    if (dupes.length > 0) throw duplicateError();
  }

  await db.query("UPDATE bucket_items SET name = ?, done = ? WHERE id = ? AND user_id = ?", [
    newName,
    newDone,
    id,
    userId,
  ]);

  // Para lumabas sa "Recent activity" ng dashboard
  if (newDone && !row.done) {
    await db.query("INSERT INTO activities (user_id, text) VALUES (?, ?)", [
      userId,
      `Marked ${newName} as done`,
    ]);
  }

  return rowToPlace({ ...row, name: newName, done: newDone });
}

async function deleteBucketMysql(userId, id) {
  const db = await getDb();
  const [result] = await db.query("DELETE FROM bucket_items WHERE id = ? AND user_id = ?", [id, userId]);
  return result.affectedRows > 0;
}

/* ------------------------------ EXPORTS ----------------------------- */
export const listBucketItems = (userId) =>
  useDb ? listBucketMysql(userId) : listBucketMemory(userId);

export const createBucketItem = (userId, name) =>
  useDb ? createBucketMysql(userId, name) : createBucketMemory(userId, name);

// Ibinabalik ang na-update na place, o null kung wala (o hindi sa user)
export const updateBucketItem = (userId, id, patch) =>
  useDb ? updateBucketMysql(userId, id, patch) : updateBucketMemory(userId, id, patch);

// true kung may nabura, false kung wala
export const deleteBucketItem = (userId, id) =>
  useDb ? deleteBucketMysql(userId, id) : deleteBucketMemory(userId, id);