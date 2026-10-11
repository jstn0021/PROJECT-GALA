import { getSession } from "lib/session";
import { ApiError } from "lib/server/errors";

// Uses the existing JWT cookie session. `uid` is set in createSession().
export async function requireUserId() {
    const session = await getSession();
    if (!session?.uid) {
        throw new ApiError(401, "unauthorized", "Please sign in.");
    }
    return session.uid;
}