/**
 * Plans repository: the ONLY file that should talk to the database.
 *
 * Right now every function throws DatabaseNotConnectedError (HTTP 503) so nothing
 * pretends to be saved. When the DB is ready, implement the five functions below
 * (Sequelize model in db/, Supabase client, or raw pg) and keep the same
 * signatures and return shapes. The service, routes, and frontend stay unchanged.
 *
 * Contract:
 *  - Every query MUST be scoped by user_id (a user can only touch their own plans).
 *  - Return plain objects shaped by mapRowToPlan() (snake_case, see below).
 *  - "Not found" returns null / false. Do not throw.
 *  - `related` (activities, budget_categories) belongs in child tables once they
 *    exist. Insert them in the same transaction as the plan.
 */
import { DatabaseNotConnectedError } from "lib/server/errors";

export const PLAN_COLUMNS = [
    "id",
    "userId",
    "title",
    "destination",
    "startDate",
    "endDate",
    "notes",
    "budget",
    "spent",
    "templateType",
    "completedAt",
    "createdAt",
    "updatedAt",
];

const toDateString = (v) =>
    v instanceof Date ? v.toISOString().slice(0, 10) : v ?? null;
const toIso = (v) => (v instanceof Date ? v.toISOString() : v ?? null);

// Normalizes a DB row (pg returns NUMERIC as string and DATE as Date objects).
export function mapRowToPlan(row) {
    return {
        id: row.id,
        userId: row.userId,
        title: row.title,
        destination: row.destination,
        startDate: toDateString(row.startDate),
        endDate: toDateString(row.endDate),
        notes: row.notes ?? "",
        budget: Number(row.budget ?? 0),
        spent: Number(row.spent ?? 0),
        templateType: row.templateType ?? null,
        completedAt: toIso(row.completedAt),
        createdAt: toIso(row.createdAt),
        updatedAt: toIso(row.updatedAt),
    };
}

/** @returns {Promise<Plan[]>} newest first */
export async function findAllByUser(userId) {
    throw new DatabaseNotConnectedError("plans.findAllByUser");
}

/** @returns {Promise<Plan|null>} */
export async function findByIdForUser(id, userId) {
    throw new DatabaseNotConnectedError("plans.findByIdForUser");
}

/**
 * @param {object} plan     validated plan fields + user_id (id/timestamps set by DB)
 * @param {object} related  { activities: string[], budget_categories: string[] }
 * @returns {Promise<Plan>}
 */
export async function insert(plan, related) {
    throw new DatabaseNotConnectedError("plans.insert");
}

/**
 * @param {object} patch  only changed columns; set updated_at = now()
 * @returns {Promise<Plan|null>} null if no plan with that id belongs to the user
 */
export async function update(id, userId, patch) {
    throw new DatabaseNotConnectedError("plans.update");
}

/** @returns {Promise<boolean>} true if a row was deleted */
export async function remove(id, userId) {
    throw new DatabaseNotConnectedError("plans.remove");
}