"use client";

/**
 * Bridge hook for the My Plans feature.
 *
 * - NEXT_PUBLIC_PLANS_API !== "true" (default): keeps using the existing
 *   localStorage store (usePlanStore) so the app doesn't break. Plans are
 *   exposed in snake_case so pages only need to be migrated once.
 * - NEXT_PUBLIC_PLANS_API === "true": uses /api/plans. If the DB isn't connected
 *   the API returns 503 and this hook surfaces an error. It never fakes a save.
 *
 * DELETE THE LOCAL BRANCH (and the usePlanStore import) once the DB is live.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useStoredState, PLANS_KEY, SEED_PLANS } from "app/components/usePlanStore";
import * as plansApi from "lib/client/plans";

export const USE_PLANS_API = process.env.NEXT_PUBLIC_PLANS_API === "true";

// UI-only. Mirrors the gradients in NewPlan's TEMPLATES (not stored in the DB).
// "Blank" has no gradient in NewPlan, so the fallback here is a placeholder.
const TEMPLATE_COLORS = {
    Weekend: "from-rose-400 to-orange-300",
    Solo: "from-teal-300 to-indigo-500",
    Family: "from-amber-300 to-emerald-400",
    Adventure: "from-cyan-300 to-emerald-500",
};
const FALLBACK_COLOR = "from-slate-400 to-indigo-500";

function todayString() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
}

// legacy camelCase localStorage shape -> API shape
function fromLocalPlan(p) {
    return {
        id: p.id,
        title: p.title,
        destination: p.destination,
        startDate: p.startDate,
        endDate: p.endDate,
        notes: p.notes ?? "",
        budget: p.budget ?? 0,
        spent: p.spent ?? 0,
        templateType: p.template ?? null,
        completedAt: p.completedAt ?? (p.status === "Completed" ? p.endDate : null),
        activities: p.activities ?? [],
        budgetCategories: p.budgetCategories ?? [],
        color: p.color,
    };
}

// API-shaped create input -> legacy localStorage shape
function toLocalPlan(input) {
    return {
        id: Date.now(),
        title: input.title || input.destination,
        destination: input.destination,
        startDate: input.startDate,
        endDate: input.endDate,
        activities: input.activities ?? [],
        notes: input.notes ?? "",
        budget: Number(input.budget) || 0,
        spent: 0,
        budgetCategories: input.budgetCategories ?? [],
        templateType: input.templateType ?? "Blank",
        color: TEMPLATE_COLORS[input.templateType] ?? FALLBACK_COLOR,
    };
}

export function usePlans() {
    const [localPlans, setLocalPlans] = useStoredState(PLANS_KEY, SEED_PLANS);
    const [apiPlans, setApiPlans] = useState([]);
    const [loading, setLoading] = useState(USE_PLANS_API);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!USE_PLANS_API) return;
        let cancelled = false;
        plansApi
            .listPlans()
            .then((data) => {
                if (!cancelled) {
                    setApiPlans(data);
                    setError(null);
                }
            })
            .catch((e) => !cancelled && setError(e))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, []);

    const plans = useMemo(() => {
        const source = USE_PLANS_API ? apiPlans : localPlans.map(fromLocalPlan);
        return source.map((p) => ({
            ...p,
            color: p.color ?? TEMPLATE_COLORS[p.templateType] ?? FALLBACK_COLOR,
        }));
    }, [apiPlans, localPlans]);

    // Throws on failure so forms (NewPlan) can show field errors.
    const createPlan = useCallback(
        async (input) => {
            if (USE_PLANS_API) {
                const created = await plansApi.createPlan(input);
                setApiPlans((c) => [created, ...c]);
                return created;
            }
            const local = toLocalPlan(input);
            setLocalPlans((c) => [local, ...c]);
            return fromLocalPlan(local);
        },
        [setLocalPlans]
    );

    // Return true on success, false on failure (error is exposed via `error`).
    const removePlan = useCallback(
        async (id) => {
            try {
                if (USE_PLANS_API) {
                    await plansApi.deletePlan(id);
                    setApiPlans((c) => c.filter((p) => p.id !== id));
                } else {
                    setLocalPlans((c) => c.filter((p) => p.id !== id));
                }
                return true;
            } catch (e) {
                setError(e);
                return false;
            }
        },
        [setLocalPlans]
    );

    const completePlan = useCallback(
        async (id) => {
            try {
                if (USE_PLANS_API) {
                    const updated = await plansApi.markPlanCompleted(id);
                    setApiPlans((c) => c.map((p) => (p.id === id ? updated : p)));
                } else {
                    setLocalPlans((c) =>
                        c.map((p) =>
                            p.id === id ? { ...p, status: "Completed", completedAt: todayString() } : p
                        )
                    );
                }
                return true;
            } catch (e) {
                setError(e);
                return false;
            }
        },
        [setLocalPlans]
    );

    const clearError = useCallback(() => setError(null), []);

    return { plans, loading, error, clearError, createPlan, removePlan, completePlan };
}