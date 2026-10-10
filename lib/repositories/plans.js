
import { DatabaseNotConnectedError } from "lib/server/errors";
import models from "../../db/models";

const {
    sequelize,
    Plan,
    PlanActivity,
    PlanBudgetAllocation,
} = models;

export const PLAN_COLUMNS = [
    "id",
    "userId",
    "title",
    "destination",
    "image",
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
        image: row.image ?? null,
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


const PLAN_INCLUDE = [
    { model: PlanActivity, as: "activities" },
    { model: PlanBudgetAllocation, as: "budgetAllocations" },
];

function toPlanResponse(instance) {
    const row = instance.get({ plain: true });

    const allocations = (row.budgetAllocations ?? []).map((a) => ({
        category: a.category,
        amount: Number(a.amount),
    }));

    return {
        ...mapRowToPlan(row),
        activities: (row.activities ?? [])
            .sort((a, b) => a.position - b.position)
            .map((a) => a.text),
        budgetAllocations: allocations,
        budgetCategories: allocations.map((a) => a.category),
    };
}


/** @returns {Promise<Plan[]>} newest first */

export async function findAllByUser(userId) {
    const rows = await Plan.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        include: [
            {
                model: PlanActivity,
                as: "activities",
            },
            {
                model: PlanBudgetAllocation,
                as: "budgetAllocations",
            },
        ],
    });

    return rows.map((item) => {
        const row = item.get({ plain: true });

        const allocations = row.budgetAllocations.map((a) => ({
            category: a.category,
            amount: Number(a.amount),
        }));

        return {
            ...mapRowToPlan(row),

            activities: row.activities
                .sort((a, b) => a.position - b.position)
                .map((a) => a.text),

            budgetAllocations: allocations,

            budgetCategories: allocations.map(
                (a) => a.category
            ),
        };
    });
}


/** @returns {Promise<Plan|null>} */
export async function findByIdForUser(id, userId) {
    const plan = await Plan.findOne({
        where: { id, userId },
        include: PLAN_INCLUDE,
    });

    return plan ? toPlanResponse(plan) : null;
}

/**
 * @param {object} plan     validated plan fields + user_id (id/timestamps set by DB)
 * @param {object} related  { activities: string[], budget_categories: string[] }
 * @returns {Promise<Plan>}
 */
export async function insert(plan, related = {}) {
    return sequelize.transaction(async (transaction) => {
        const created = await Plan.create(plan, {
            transaction,
        });

        const activities = related.activities ?? [];
        const allocations = related.budgetAllocations ?? [];

        if (activities.length > 0) {
            await PlanActivity.bulkCreate(
                activities.map((text, position) => ({
                    planId: created.id,
                    position,
                    text,
                })),
                { transaction }
            );
        }

        if (allocations.length > 0) {
            await PlanBudgetAllocation.bulkCreate(
                allocations.map(({ category, amount }) => ({
                    planId: created.id,
                    category,
                    amount,
                })),
                { transaction }
            );
        }

        const saved = await Plan.findByPk(created.id, {
            include: [
                { model: PlanActivity, as: "activities" },
                {
                    model: PlanBudgetAllocation,
                    as: "budgetAllocations",
                },
            ],
            transaction,
        });

        const row = saved.get({ plain: true });

        return {
            ...mapRowToPlan(row),
            activities: row.activities
                .sort((a, b) => a.position - b.position)
                .map((a) => a.text),
            budgetAllocations: row.budgetAllocations.map(
                ({ category, amount }) => ({
                    category,
                    amount: Number(amount),
                })
            ),
            budgetCategories: row.budgetAllocations.map(
                (a) => a.category
            ),
        };
    });
}

/**
 * @param {object} patch  only changed columns; set updated_at = now()
 * @returns {Promise<Plan|null>} null if no plan with that id belongs to the user
 */

export async function update(id, userId, patch, related = {}) {
    return sequelize.transaction(async (transaction) => {
        const plan = await Plan.findOne({
            where: { id, userId },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!plan) return null;

        if (Object.keys(patch).length > 0) {
            await plan.update(patch, { transaction });
        }

        if (related.activities !== undefined) {
            await PlanActivity.destroy({
                where: { planId: plan.id },
                transaction,
            });

            if (related.activities.length > 0) {
                await PlanActivity.bulkCreate(
                    related.activities.map((text, position) => ({
                        planId: plan.id,
                        position,
                        text,
                    })),
                    { transaction }
                );
            }
        }

        if (related.budgetAllocations !== undefined) {
            await PlanBudgetAllocation.destroy({
                where: { planId: plan.id },
                transaction,
            });

            if (related.budgetAllocations.length > 0) {
                await PlanBudgetAllocation.bulkCreate(
                    related.budgetAllocations.map(({ category, amount }) => ({
                        planId: plan.id,
                        category,
                        amount,
                    })),
                    { transaction }
                );
            }
        }

        const updated = await Plan.findOne({
            where: { id: plan.id, userId },
            include: PLAN_INCLUDE,
            transaction,
        });

        return toPlanResponse(updated);
    });
}


/** @returns {Promise<boolean>} true if a row was deleted */

export async function remove(id, userId) {
    const deleted = await Plan.destroy({
        where: {
            id,
            userId,
        },
    });
    return deleted > 0;
}
