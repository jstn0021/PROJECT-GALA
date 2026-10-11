
import "server-only";

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { ApiError } from "lib/server/errors";
import * as plansRepo from "lib/repositories/plans";

const BUCKET = "journal-media";
const TABLE = "plan_media";
const MAX_MEDIA = 10;

const ALLOWED_TYPES = {
    "image/jpeg": { kind: "image", ext: "jpg", max: 10 * 1024 * 1024 },
    "image/png": { kind: "image", ext: "png", max: 10 * 1024 * 1024 },
    "image/webp": { kind: "image", ext: "webp", max: 10 * 1024 * 1024 },
    "video/mp4": { kind: "video", ext: "mp4", max: 50 * 1024 * 1024 },
    "video/webm": { kind: "video", ext: "webm", max: 50 * 1024 * 1024 },
};

function db() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error("Supabase Storage configuration is missing.");
    }

    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

async function checkOwnership(userId, planId) {
    const plan = await plansRepo.findByIdForUser(planId, userId);
    if (!plan) {
        throw new ApiError(404, "not_found", "Plan not found.");
    }
    return plan;
}

async function getRows(client, planId) {
    const { data, error } = await client
        .from(TABLE)
        .select("id, plan_id, storage_path, media_type, file_name, created_at")
        .eq("plan_id", planId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

async function toMediaList(client, rows) {
    return Promise.all(
        rows.map(async (row) => {
            const { data, error } = await client.storage
                .from(BUCKET)
                .createSignedUrl(row.storage_path, 3600);

            if (error) throw error;

            return {
                id: row.id,
                url: data.signedUrl,
                mediaType: row.media_type,
                name: row.file_name,
                createdAt: row.created_at,
            };
        })
    );
}

export async function listMedia(userId, planId) {
    await checkOwnership(userId, planId);

    const client = db();
    const rows = await getRows(client, planId);

    return {
        mediaList: await toMediaList(client, rows),
    };
}

export async function addMedia(userId, planId, files) {
    const plan = await checkOwnership(userId, planId);

    if (!plan.completedAt) {
        throw new ApiError(
            409,
            "trip_not_completed",
            "Complete the trip before adding journal media."
        );
    }

    if (!Array.isArray(files) || files.length === 0) {
        throw new ApiError(422, "invalid_media", "Select at least one file.");
    }

    const client = db();
    const existing = await getRows(client, planId);

    if (existing.length + files.length > MAX_MEDIA) {
        throw new ApiError(
            422,
            "media_limit",
            "Maximum of 10 photos or videos per trip."
        );
    }

    // Validate all files before starting any uploads.
    for (const file of files) {
        const allowed = ALLOWED_TYPES[file.type];

        if (!allowed || file.size === 0 || file.size > allowed.max) {
            throw new ApiError(
                422,
                "invalid_media",
                "Use JPEG/PNG/WebP images up to 10 MB or MP4/WebM videos up to 50 MB."
            );
        }
    }

    for (const file of files) {
        const config = ALLOWED_TYPES[file.type];
        const storagePath =
            `${userId}/${planId}/${randomUUID()}.${config.ext}`;

        const bytes = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await client.storage
            .from(BUCKET)
            .upload(storagePath, bytes, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) throw uploadError;

        const { error: insertError } = await client
            .from(TABLE)
            .insert({
                plan_id: Number(planId),
                storage_path: storagePath,
                media_type: config.kind,
                file_name: file.name.slice(0, 255),
            });

        if (insertError) {
            // Remove the uploaded file if its DB record failed.
            await client.storage.from(BUCKET).remove([storagePath]);
            throw insertError;
        }
    }

    return listMedia(userId, planId);
}

export async function deleteMedia(userId, planId, mediaId) {
    await checkOwnership(userId, planId);

    const client = db();

    const { data: item, error } = await client
        .from(TABLE)
        .select("id, storage_path")
        .eq("plan_id", planId)
        .eq("id", mediaId)
        .maybeSingle();

    if (error) throw error;

    if (!item) {
        throw new ApiError(404, "not_found", "Media not found.");
    }

    const { error: storageError } = await client.storage
        .from(BUCKET)
        .remove([item.storage_path]);

    if (storageError) throw storageError;

    const { error: deleteError } = await client
        .from(TABLE)
        .delete()
        .eq("plan_id", planId)
        .eq("id", mediaId);

    if (deleteError) throw deleteError;
}
