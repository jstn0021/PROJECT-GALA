import { requireUserId } from "lib/server/auth";
import { ApiError } from "lib/server/errors";
import { handleError, noContent, ok, readJson } from "lib/server/http";
import * as plans from "lib/services/plans";

// ID format is intentionally loose because the DB id type (uuid vs integer) isn't decided yet.
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

async function getId(params) {
    const { id } = await params; // params is a Promise in recent Next.js versions
    if (!ID_RE.test(id)) throw new ApiError(400, "invalid_id", "Invalid plan id.");
    return id;
}

export async function GET(_request, { params }) {
    try {
        const userId = await requireUserId();
        return ok(await plans.getPlan(userId, await getId(params)));
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(request, { params }) {
    try {
        const userId = await requireUserId();
        const id = await getId(params);
        const body = await readJson(request);
        return ok(await plans.updatePlan(userId, id, body));
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(_request, { params }) {
    try {
        const userId = await requireUserId();
        await plans.deletePlan(userId, await getId(params));
        return noContent();
    } catch (err) {
        return handleError(err);
    }
}
