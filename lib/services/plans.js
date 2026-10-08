import * as repo from "lib/repositories/plans";
import { ApiError } from "lib/server/errors";
import { validateCreate, validateUpdate } from "lib/validation/plans";

// "Today" for the completion rule. The frontend compares against the local date;
// the server uses a fixed timezone so the check doesn't depend on server UTC.
// PLAN_TIMEZONE is an assumed env var; default is Asia/Manila.
export function todayInPlanTimezone() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.PLAN_TIMEZONE || "Asia/Manila",
  }).format(new Date()); // YYYY-MM-DD
}

function validationError(details) {
  return new ApiError(422, "validation_failed", "Some fields are invalid.", details);
}

export async function listPlans(userId) {
  return repo.findAllByUser(userId);
}

export async function getPlan(userId, id) {
  const plan = await repo.findByIdForUser(id, userId);
  if (!plan) throw new ApiError(404, "not_found", "Plan not found.");
  return plan;
}

export async function createPlan(userId, body) {
  const { value, related, errors } = validateCreate(body);
  if (Object.keys(errors).length > 0) throw validationError(errors);
  return repo.insert(
    { ...value, userId: userId, completedAt: null },
    related
  );
}

export async function updatePlan(userId, id, body) {
  const { value: patch, errors } = validateUpdate(body);
  if (Object.keys(errors).length > 0) throw validationError(errors);
  if (Object.keys(patch).length === 0) {
    throw new ApiError(422, "validation_failed", "No updatable fields were provided.");
  }

  const existing = await getPlan(userId, id);
  const merged = { ...existing, ...patch };

  if (merged.endDate < merged.startDate) {
    throw validationError({
      endDate: "End date can't be before the start date.",
    });
  }

  if (patch.mark_completed) {
    delete patch.mark_completed;
    if (existing.completedAt) {
      throw new ApiError(409, "already_completed", "This plan is already completed.");
    }
    // Same rule as the frontend's canComplete(): only after the end date has passed.
    if (!(todayInPlanTimezone() > merged.endDate)) {
      throw new ApiError(409, "plan_not_ended", "A plan can only be completed after its end date.");
    }
    patch.completedAt = new Date().toISOString();
  }

  const updated = await repo.update(id, userId, patch);
  if (!updated) throw new ApiError(404, "not_found", "Plan not found.");
  return updated;
}

export async function deletePlan(userId, id) {
  const deleted = await repo.remove(id, userId);
  if (!deleted) throw new ApiError(404, "not_found", "Plan not found.");
}
