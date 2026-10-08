import { requireUserId } from "lib/server/auth";
import { ApiError } from "lib/server/errors";
import { handleError, ok, readJson } from "lib/server/http";
import * as plans from "lib/services/plans";

// Loose on purpose: the DB id type (uuid vs integer) isn't decided yet.
const idRe = /^[A-Za-z0-9_-]{1,64}$/;

async function getId(params) {
    const { id } = await params;
    if (!idRe.test(id)) throw new ApiError(400, "invalid_id", "Invalid plan id.");
    return id;
}

export async function GET(_request, { params }) {
    try {
        const userId = await requireUserId();
        return ok(await plans.listMedia(userId, await getId(params)));
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(request, { params }) {
    try {
        const userId = await requireUserId();
        const planId = await getId(params);
        const body = await readJson(request);
        return ok(await plans.addMedia(userId, planId, body), 201);
    } catch (err) {
        return handleError(err);
    }
}