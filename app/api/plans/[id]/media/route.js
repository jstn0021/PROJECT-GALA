
import { requireUserId } from "lib/server/auth";
import { ApiError } from "lib/server/errors";
import { handleError, ok } from "lib/server/http";
import * as plans from "lib/services/plans";

export const runtime = "nodejs";

const idRe = /^\d+$/;

async function getPlanId(params) {
    const { id } = await params;

    if (!idRe.test(id)) {
        throw new ApiError(400, "invalid_id", "Invalid plan id.");
    }

    return id;
}

export async function GET(_request, { params }) {
    try {
        const userId = await requireUserId();
        const planId = await getPlanId(params);

        return ok(await plans.listMedia(userId, planId));
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(request, { params }) {
    try {
        const userId = await requireUserId();
        const planId = await getPlanId(params);

        const formData = await request.formData();
        const files = formData.getAll("files");

        if (
            files.length === 0 ||
            files.some((file) => !(file instanceof File))
        ) {
            throw new ApiError(
                422,
                "invalid_media",
                "Please select valid media files."
            );
        }

        return ok(await plans.addMedia(userId, planId, files), 201);
    } catch (err) {
        return handleError(err);
    }
}
