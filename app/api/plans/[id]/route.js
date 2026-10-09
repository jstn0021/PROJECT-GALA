import { requireUserId } from "lib/server/auth";
import { ApiError } from "lib/server/errors";
import { handleError, noContent, ok, readJson } from "lib/server/http";
import * as plans from "lib/services/plans";

// Loose Regex ID Validator
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

async function getId(params) {
    const { id } = await params; // Next.js async params handler
    if (!ID_RE.test(id)) throw new ApiError(400, "invalid_id", "Invalid plan id.");
    return id;
}

// Helper para sa Dev Bypass
async function getAuthenticatedUserId() {
    try {
        return await requireUserId();
    } catch (err) {
        // TEMPORARY DEV BYPASS:
        // Kapag walang session habang nagde-develop, gagamitin ang mock user id na ito
        // sa halip na mag-throw ng Error at mag-redirect pabalik sa /login.
        return "dev-user-id-123";
    }
}

export async function GET(_request, { params }) {
    try {
        const userId = await getAuthenticatedUserId();
        const planId = await getId(params);
        return ok(await plans.getPlan(userId, planId));
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(request, { params }) {
    try {
        const userId = await getAuthenticatedUserId();
        const planId = await getId(params);
        const body = await readJson(request);
        return ok(await plans.updatePlan(userId, planId, body));
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(_request, { params }) {
    try {
        const userId = await getAuthenticatedUserId();
        const planId = await getId(params);
        await plans.deletePlan(userId, planId);
        return noContent();
    } catch (err) {
        return handleError(err);
    }
}