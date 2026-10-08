import { requireUserId } from "lib/server/auth";
import { handleError, ok, readJson } from "lib/server/http";
import * as plans from "../../../lib/services/plans";

export async function GET() {
    try {
        const userId = await requireUserId();
        return ok(await plans.listPlans(userId));
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(request) {
    try {
        const userId = await requireUserId();
        const body = await readJson(request);
        return ok(await plans.createPlan(userId, body), 201);
    } catch (err) {
        return handleError(err);
    }
}