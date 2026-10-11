import { requireUserId } from "lib/server/auth";
import { ApiError } from "lib/server/errors";
import { handleError, noContent } from "lib/server/http";
import * as plans from "lib/services/plans";

const idRe = /^[A-Za-z0-9_-]{1,64}$/;

async function getIds(params) {
    const { id, mediaId } = await params;
    if (!idRe.test(id)) {
        throw new ApiError(400, "invalid_id", "Invalid plan id.");
    }
    if (!idRe.test(mediaId)) {
        throw new ApiError(400, "invalid_id", "Invalid media id.");
    }
    return {
        planId: id,
        mediaId,
    };
}
export async function DELETE(_request, { params }) {
    try {
        const userId = await requireUserId();
        const { planId, mediaId } = await getIds(params);
        await plans.deleteMedia(userId, planId, mediaId);
        return noContent();
    } catch (err) {
        return handleError(err);
    }
}