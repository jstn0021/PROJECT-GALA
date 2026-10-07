import { NextResponse } from "next/server";
import { ApiError } from "lib/server/errors";

export function ok(data, status = 200) {
    return NextResponse.json({ data }, { status });
}

export function noContent() {
    return new Response(null, { status: 204 });
}

export function fail(status, code, message, details) {
    return NextResponse.json(
        { error: { code, message, ...(details ? { details } : {}) } },
        { status }
    );
}

export function handleError(err) {
    if (err instanceof ApiError) {
        return fail(err.status, err.code, err.message, err.details);
    }
    console.error("[api] unexpected error:", err);
    return fail(500, "internal_error", "Something went wrong.");
}

export async function readJson(request) {
    try {
        const body = await request.json();
        if (body === null || typeof body !== "object" || Array.isArray(body)) {
            throw new Error("not an object");
        }
        return body;
    } catch {
        throw new ApiError(400, "invalid_json", "Request body must be a JSON object.");
    }
}