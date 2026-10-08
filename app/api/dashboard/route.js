import { requireUserId } from "lib/server/auth";
import { handleError, ok } from "lib/server/http";
import * as dashboard from "lib/services/dashboard";

// Read-only on purpose: no POST / PATCH / DELETE.
export async function GET() {
  try {
    const userId = await requireUserId();
    return ok(await dashboard.getDashboard(userId));
  } catch (err) {
    return handleError(err);
  }
}