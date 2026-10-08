import * as plans from "lib/services/plans";

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
            .filter((p) => !p.completed_at && p.start_date && p.end_date && p.end_date >= today)
            .sort(
                (a, b) =>
                    a.start_date.localeCompare(b.start_date) ||
                    a.end_date.localeCompare(b.end_date)
            )[0] ?? null
    );
}

function toNextTrip(plan, today) {
    const daysToGo = Math.max(0, dayNumber(plan.start_date) - dayNumber(today));
    return {
        id: plan.id,
        title: plan.title,
        startDate: plan.start_date,
        endDate: plan.end_date,
        budget: plan.budget,
        spent: plan.spent,
        // Not stored on plans yet; the UI should show its fallback background.
        image: null,
        // Plans only have a single `destination` string for now.
        destinations: plan.destination ? [plan.destination] : [],
        // Computed, never stored:
        status: plan.start_date <= today ? "ongoing" : "upcoming",
        daysToGo,
        budgetPercent: percent(plan.spent, plan.budget), // not capped, so over-budget (>100) stays visible
    };
}

// ---------------------------------------------------------------------------
// PENDING SECTIONS: no backend source exists yet. Nothing is invented here.
// When a source exists, return real data for that key (and remove it from
// PENDING_SECTIONS). The route, client, and response shape stay the same.
// ---------------------------------------------------------------------------
const PENDING_SECTIONS = [
    "savedDestinations",
    "bucketList",
    "recentActivity",
    "budgetBreakdown",
];

// eslint-disable-next-line no-unused-vars
async function loadPendingSections(userId) {
    return {
        savedDestinations: null, // future: [{ id, name, region }]
        bucketList: null, // future: { done, total, percent }
        recentActivity: null, // future: [{ id, type, title, sub, createdAt }]
        budgetBreakdown: null, // future: [{ label, amount }] from budget_categories
    };
}

export async function getDashboard(userId) {
    const allPlans = await plans.listPlans(userId);
    const today = plans.todayInPlanTimezone();

    const next = pickNextPlan(allPlans, today);

    return {
        nextTrip: next ? toNextTrip(next, today) : null,
        ...(await loadPendingSections(userId)),
        pending: PENDING_SECTIONS,
    };
}