
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* 1. AUTH — palitan ng totoong auth ninyo (NextAuth, Clerk, JWT...)   */
/* ------------------------------------------------------------------ */
async function getCurrentUser(requirement) {
  // Halimbawa lang. Dapat galing sa session/token ang user.
  // const session = await auth();
  // if (!session) return null;
  // return { id: session.user.id, name: session.user.name };
  return { id: "user_1", name: "Name" };
}

/* ------------------------------------------------------------------ */
/* 2. DATA LAYER — palitan ang laman ng bawat function ng DB query     */
/*    (Prisma, MongoDB, Supabase, atbp.). Ito lang ang babaguhin mo.   */
/* ------------------------------------------------------------------ */
// Mock data para magamit agad habang wala pang database
const mock = {
  trips: [
    { id: "t1", userId: "user_1", title: "Kyoto spring trip", startDate: "2027-03-12", endDate: "2027-03-18", status: "upcoming", color: ["#fb7185", "#fdba74"] },
    { id: "t2", userId: "user_1", title: "Lisbon food trip", startDate: "2027-06-02", endDate: "2027-06-06", status: "upcoming", color: ["#fde047", "#5eead4"] },
    { id: "t3", userId: "user_1", title: "Santorini getaway", startDate: "2026-05-10", endDate: "2026-05-15", status: "completed", color: ["#fde047", "#6ee7b7"], journalEntryId: "j1" },
  ],
  bucketItems: [
    { id: "b1", userId: "user_1", name: "El Nido", done: false, color: ["#6ee7b7", "#14b8a6"] },
    { id: "b2", userId: "user_1", name: "Bali", done: false, color: ["#fb7185", "#fdba74"] },
    { id: "b3", userId: "user_1", name: "Cusco", done: false, color: ["#5eead4", "#818cf8"] },
    { id: "b4", userId: "user_1", name: "Lisbon", done: false, color: ["#fde047", "#5eead4"] },
    { id: "b5", userId: "user_1", name: "Santorini", done: true, color: ["#fde047", "#6ee7b7"] },
    { id: "b6", userId: "user_1", name: "Kyoto", done: true, color: ["#fb7185", "#fdba74"] },
    { id: "b7", userId: "user_1", name: "Banff", done: true, color: ["#5eead4", "#818cf8"] },
    { id: "b8", userId: "user_1", name: "Siargao", done: false, color: ["#6ee7b7", "#14b8a6"] },
  ],
  activities: [
    { id: "a1", userId: "user_1", text: "Added expense to Bali trip", createdAt: "2026-10-03T10:00:00Z" },
    { id: "a2", userId: "user_1", text: "Marked Santorini as done", createdAt: "2026-10-02T09:00:00Z" },
    { id: "a3", userId: "user_1", text: "Created plan from Weekend template", createdAt: "2026-10-01T08:00:00Z" },
  ],
};

async function getTrips(userId) {
  // SQL: SELECT * FROM trips WHERE user_id = $1 ORDER BY start_date
  return mock.trips.filter((t) => t.userId === userId);
}

async function getBucketItems(userId) {
  // SQL: SELECT * FROM bucket_items WHERE user_id = $1
  return mock.bucketItems.filter((b) => b.userId === userId);
}

async function getRecentActivity(userId, limit) {
  // SQL: SELECT * FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2
  return mock.activities
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* 3. ROUTE — GET /api/dashboard                                      */
/* ------------------------------------------------------------------ */
export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const [trips, bucketItems, recentActivity] = await Promise.all([
      getTrips(user.id),
      getBucketItems(user.id),
      getRecentActivity(user.id, 3),
    ]);

    // Upcoming: pinakamalapit na petsa muna
    const upcomingTrips = trips
      .filter((t) => t.status === "upcoming")
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // Completed: pinakabago muna
    const completedTrips = trips
      .filter((t) => t.status === "completed")
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

    const bucketTotal = bucketItems.length;
    const bucketDone = bucketItems.filter((b) => b.done).length;

    return NextResponse.json({
      user: { name: user.name },

      // Apat na stat cards sa taas
      stats: {
        upcomingTrips: upcomingTrips.length,
        bucketListPlaces: bucketTotal,
        bucketListDone: bucketDone,
        completedTrips: completedTrips.length,
      },

      // "Upcoming trips" list (dalawa lang sa design)
      upcomingTrips: upcomingTrips.slice(0, 2).map((t) => ({
        id: t.id,
        title: t.title,
        startDate: t.startDate,
        endDate: t.endDate,
        color: t.color,
      })),

      // "Bucket list progress" card
      bucketProgress: {
        done: bucketDone,
        total: bucketTotal,
        percent: bucketTotal === 0 ? 0 : Math.round((bucketDone / bucketTotal) * 100),
      },

      // "From your bucket list": apat na hindi pa tapos
      bucketPreview: bucketItems
        .filter((b) => !b.done)
        .slice(0, 4)
        .map((b) => ({ id: b.id, name: b.name, color: b.color })),

      // "Recent activity"
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        text: a.text,
        createdAt: a.createdAt,
      })),

      // "Completed trips" (isa lang sa design)
      completedTrips: completedTrips.slice(0, 1).map((t) => ({
        id: t.id,
        title: t.title,
        journalEntryId: t.journalEntryId ?? null,
        color: t.color,
      })),

      // Para sa empty state ng bagong user
      isEmpty: trips.length === 0 && bucketTotal === 0,
    });
  } catch (error) {
    console.error("GET /api/dashboard failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}