import * as plans from "lib/services/plans";
import { listBucketItems } from "lib/tripsStore";
import { getFeaturedPlaces } from "lib/destinations";

const DAY_MS = 86_400_000;

// Dates are YYYY-MM-DD strings, so they sort correctly as plain strings.
const dayNumber = (ymd) => Date.parse(`${ymd}T00:00:00Z`) / DAY_MS;

const percent = (part, whole) =>
    whole > 0 ? Math.round((part / whole) * 100) : 0;

/**
 * Nearest non-completed plan that hasn't ended yet.
 * An ongoing plan (started, not ended) counts, with daysToGo = 0.
 */
function pickNextPlan(allPlans, today) {
    return (
        allPlans
            .filter((p) => !p.completedAt && p.startDate && p.endDate && p.endDate >= today)
            .sort(
                (a, b) =>
                    a.startDate.localeCompare(b.startDate) ||
                    a.endDate.localeCompare(b.endDate)
            )[0] ?? null
    );
}

function toNextTrip(plan, today) {
    const daysToGo = Math.max(
        0,
        dayNumber(plan.startDate) - dayNumber(today)
    );
    const budgetItems = (plan.budgetAllocations ?? []).map(
        (item) => ({
            label: item.category,
            amount: Number(item.amount),
        })
    );
    const allocated = budgetItems.reduce(
        (sum, item) => sum + item.amount,
        0
    );
    return {
        id: plan.id,
        title: plan.title,
        startDate: plan.startDate,
        endDate: plan.endDate,
        budget: plan.budget,
        spent: allocated,
        image: plan.image ?? null,
        destinations: plan.destination ? [plan.destination] : [],
        status: plan.startDate <= today ? "ongoing" : "upcoming",
        daysToGo,
        budgetPercent: percent(allocated, plan.budget),
        budgetItems,
    };
}


// ---------------------------------------------------------------------------
// PENDING SECTIONS: no backend source exists yet. Nothing is invented here.
// When a source exists, return real data for that key (and remove it from
// PENDING_SECTIONS). The route, client, and response shape stay the same.
// ---------------------------------------------------------------------------
const PENDING_SECTIONS = [
    "bucketList",
    "recentActivity",
    "budgetBreakdown",
];

// eslint-disable-next-line no-unused-vars

async function loadPendingSections(userId) {
    // Kunin ang mga ni-heart na destinations sa Supabase
    const saved = await listBucketItems(userId);
    const bucketTotal = saved.length;

    const bucketDone = saved.filter(
        (place) => place.completed === true
    ).length;

    const bucketList = {
        done: bucketDone,
        total: bucketTotal,
        percent: bucketTotal > 0
            ? Math.round((bucketDone / bucketTotal) * 100)
            : 0,
    };

    // I-convert para magamit ng Dashboard cards
    const savedDestinations = saved.map((place) => ({
        id: place.id,
        name: place.name,
        location: place.location || "",
        image: place.image || null,
        color: place.color,
    }));

    // Kapag walang saved destinations, featured places ang fallback
    const featuredPlaces =
        savedDestinations.length === 0
            ? getFeaturedPlaces({
                random: false,
                limit: 9,
                category: "all",
            })
            : [];

    return {
        savedDestinations,
        featuredPlaces,
        bucketList,
        recentActivity: null,
        budgetBreakdown: null,
    };
}
function buildRecentActivity(allPlans) {
    const events = [];

    for (const plan of allPlans) {
        if (plan.createdAt) {
            events.push({
                id: `created-${plan.id}`,
                icon: "✈️",
                type: "plan_created",
                title: "Created a trip plan",
                sub: plan.title,
                createdAt: plan.createdAt,
            });
        }
        if (
            plan.updatedAt &&
            plan.createdAt &&
            new Date(plan.updatedAt).getTime() >
            new Date(plan.createdAt).getTime() + 1000
        ) {
            events.push({
                id: `updated-${plan.id}`,
                icon: "✏️",
                type: "plan_updated",
                title: "Updated a trip plan",
                sub: plan.title,
                createdAt: plan.updatedAt,
            });
        }
    }
    return events
        .sort(
            (a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, 5);
}
export async function getDashboard(userId) {
    const allPlans = await plans.listPlans(userId);
    const today = plans.todayInPlanTimezone();

    const next = pickNextPlan(allPlans, today);

    return {
        nextTrip: next ? toNextTrip(next, today) : null,
        ...(await loadPendingSections(userId)),
        recentActivity: buildRecentActivity(allPlans),
        pending: [],
    };
}