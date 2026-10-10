// Frontend API client. Components never call fetch directly.
// Components -> this file (or usePlans) -> /api/plans -> service -> repository -> DB

export class PlansApiError extends Error {
    constructor(status, code, message, details) {
        super(message);
        this.name = "PlansApiError";
        this.status = status;
        this.code = code;
        this.details = details; // { field_name: "message" } for 422 responses
    }

    get isDatabaseNotConnected() {
        return this.code === "database_not_connected";
    }
}

async function request(path, options = {}) {
    let res;
    try {
        res = await fetch(path, {
            credentials: "same-origin",
            ...options,
            headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        });
    } catch {
        throw new PlansApiError(0, "network_error", "Can't reach the server.");
    }

    if (res.status === 204) return null;

    let body = null;
    try {
        body = await res.json();
    } catch {
        /* non-JSON response */
    }

    if (!res.ok) {
        const e = body?.error;
        throw new PlansApiError(
            res.status,
            e?.code ?? "unknown_error",
            e?.message ?? "Request failed.",
            e?.details
        );
    }
    return body?.data ?? null;
}

const planPath = (id) => `/api/plans/${encodeURIComponent(id)}`;

const mediaPath = (planId, mediaId) =>
    `/api/plans/${encodeURIComponent(planId)}/media` +
    (mediaId ? `/${encodeURIComponent(mediaId)}` : "");

export const listMedia = (planId) => request(mediaPath(planId));
export const listPlans = () => request("/api/plans");
export const getPlan = (id) => request(planPath(id));
export const createPlan = (input) =>
    request("/api/plans", { method: "POST", body: JSON.stringify(input) });
export const updatePlan = (id, patch) =>
    request(planPath(id), { method: "PATCH", body: JSON.stringify(patch) });
export const markPlanCompleted = (id) => updatePlan(id, { markCompleted: true });
export const deletePlan = (id) => request(planPath(id), { method: "DELETE" });


export async function addMedia(planId, files) {
    const formData = new FormData();

    for (const file of files) {
        formData.append("files", file);
    }

    let response;

    try {
        response = await fetch(mediaPath(planId), {
            method: "POST",
            credentials: "same-origin",
            body: formData,
        });
    } catch {
        throw new PlansApiError(
            0,
            "network_error",
            "Can't reach the server."
        );
    }

    const result = await response.json().catch(() => null);

    if (!response.ok) {
        throw new PlansApiError(
            response.status,
            result?.error?.code ?? "upload_failed",
            result?.error?.message ?? "Failed to upload media."
        );
    }

    return result.data;
}

export const deleteMedia = (planId, mediaId) =>
    request(mediaPath(planId, mediaId), {
        method: "DELETE",
    });
