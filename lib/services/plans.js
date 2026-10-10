
import * as repo from "lib/repositories/plans";
import { ApiError } from "lib/server/errors";
import {
  validateCreate,
  validateUpdate,
  checkBudgetAllocations,
} from "lib/validation/plans";
import {
  listBucketItems,
  updateBucketItem,
} from "lib/tripsStore";

export function todayInPlanTimezone() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.PLAN_TIMEZONE || "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function validationError(details) {
  return new ApiError(
    422,
    "validation_failed",
    "Some fields are invalid.",
    details
  );
}

function normalizeDestination(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function dateOnly(value) {
  if (!value) return "";

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

// Complete a trip only after its end date.
function isTripOverdue(plan) {
  return (
    !plan.completedAt &&
    Boolean(plan.endDate) &&
    todayInPlanTimezone() > dateOnly(plan.endDate)
  );
}

// Mark matching Bucket List destinations as completed.
async function syncBucketList(userId, completedPlans) {
  if (!completedPlans.length) return;

  const bucketItems = await listBucketItems(userId);

  for (const item of bucketItems) {
    if (item.completed) continue;

    const isMatch = completedPlans.some(
      (plan) =>
        normalizeDestination(plan.destination) ===
        normalizeDestination(item.name)
    );

    if (isMatch) {
      await updateBucketItem(userId, item.id, {
        completed: true,
      });
    }
  }
}

// Automatically persist completion for overdue plans.
async function completeOverduePlans(userId, plans) {
  const updatedPlans = [];

  for (const plan of plans) {
    if (!isTripOverdue(plan)) {
      updatedPlans.push(plan);
      continue;
    }

    const updated = await repo.update(
      plan.id,
      userId,
      { completedAt: new Date() },
      {}
    );

    updatedPlans.push(updated || plan);
  }

  // Also synchronize previously completed plans in case
  // their Bucket List items were not updated before.
  const completedPlans = updatedPlans.filter(
    (plan) => Boolean(plan.completedAt)
  );

  if (completedPlans.length > 0) {
    try {
      await syncBucketList(userId, completedPlans);
    } catch (error) {
      console.error(
        "[plans] Bucket List synchronization failed:",
        error
      );
    }
  }

  return updatedPlans;
}

// GET /api/plans
export async function listPlans(userId) {
  const plans = await repo.findAllByUser(userId);
  return completeOverduePlans(userId, plans);
}

// GET /api/plans/:id
export async function getPlan(userId, id) {
  const plan = await repo.findByIdForUser(id, userId);

  if (!plan) {
    throw new ApiError(404, "not_found", "Plan not found.");
  }

  const [updated] = await completeOverduePlans(userId, [plan]);

  return updated;
}
// POST /api/plans
export async function createPlan(userId, body) {
  const { value, related, errors } = validateCreate(body);

  if (Object.keys(errors).length > 0) {
    throw validationError(errors);
  }

  return repo.insert(
    {
      ...value,
      userId,
      completedAt: null,
    },
    related
  );
}

// PATCH /api/plans/:id
export async function updatePlan(userId, id, body) {
  const {
    value: patch,
    related,
    errors,
  } = validateUpdate(body);

  if (Object.keys(errors).length > 0) {
    throw validationError(errors);
  }

  if (
    Object.keys(patch).length === 0 &&
    Object.keys(related).length === 0
  ) {
    throw new ApiError(
      422,
      "validation_failed",
      "No updatable fields were provided."
    );
  }

  const existing = await getPlan(userId, id);
  const merged = { ...existing, ...patch };

  if (dateOnly(merged.endDate) < dateOnly(merged.startDate)) {
    throw validationError({
      endDate: "End date can't be before the start date.",
    });
  }

  if (related.budgetAllocations !== undefined) {
    const result = checkBudgetAllocations(
      related.budgetAllocations,
      merged.budget
    );

    if (result.error) {
      throw validationError({
        budgetAllocations: result.error,
      });
    }

    related.budgetAllocations = result.value;
  } else if (patch.budget !== undefined) {
    const result = checkBudgetAllocations(
      existing.budgetAllocations ?? [],
      merged.budget
    );

    if (result.error) {
      throw validationError({
        budget: result.error,
      });
    }
  }

  if (patch.markCompleted) {
    delete patch.markCompleted;

    if (existing.completedAt) {
      throw new ApiError(
        409,
        "already_completed",
        "This plan is already completed."
      );
    }

    if (
      !(todayInPlanTimezone() > dateOnly(merged.endDate))
    ) {
      throw new ApiError(
        409,
        "plan_not_ended",
        "A plan can only be completed after its end date."
      );
    }

    patch.completedAt = new Date();
  }

  const updated = await repo.update(
    id,
    userId,
    patch,
    related
  );

  if (!updated) {
    throw new ApiError(404, "not_found", "Plan not found.");
  }

  if (updated.completedAt) {
    try {
      await syncBucketList(userId, [updated]);
    } catch (error) {
      console.error(
        "[plans] Bucket List synchronization failed:",
        error
      );
    }
  }

  return updated;
}

// DELETE /api/plans/:id
export async function deletePlan(userId, id) {
  const deleted = await repo.remove(id, userId);

  if (!deleted) {
    throw new ApiError(404, "not_found", "Plan not found.");
  }
}

// Journal media functions
export {
  listMedia,
  addMedia,
  deleteMedia,
} from "lib/services/planMedia";
