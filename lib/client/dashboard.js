// Frontend API client for the dashboard (read-only).
// Components -> this file -> GET /api/dashboard -> service -> plans service -> repository -> DB

export class DashboardApiError extends Error {
    constructor(status, code, message) {
        super(message);
        this.name = "DashboardApiError";
        this.status = status;
        this.code = code;
    }

    get isDatabaseNotConnected() {
        return this.code === "database_not_connected";
    }
}

export async function getDashboard() {
    let res;
    try {
        res = await fetch("/api/dashboard", { credentials: "same-origin" });
    } catch {
        throw new DashboardApiError(0, "network_error", "Can't reach the server.");
    }

    let body = null;
    try {
        body = await res.json();
    } catch {
        /* non-JSON response */
    }

    if (!res.ok) {
        const e = body?.error;
        throw new DashboardApiError(
            res.status,
            e?.code ?? "unknown_error",
            e?.message ?? "Request failed."
        );
    }
    return body?.data ?? null;
}