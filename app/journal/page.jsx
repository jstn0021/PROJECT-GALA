"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { listMedia, addMedia, deleteMedia } from "@/lib/client/plans";
import { Background } from "@/app/components/AuthCard";
import Navbar from "@/app/components/Navbar";
import {
  PANEL,
  MODAL,
  CARD,
  GRID,
  PAGE_WRAP,
  PageHeader,
  CardImage,
  Icon,
} from "@/app/components/ui";

function isPlanCompleted(plan) {
  return Boolean(plan?.completedAt);
}

function formatDate(date) {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function formatDateRange(plan) {
  const start = formatDate(plan.startDate);
  const end = formatDate(plan.endDate);
  if (!start && !end) return "";
  if (!end) return start;
  if (!start) return end;
  return `${start} to ${end}`;
}

function getNoteExcerpt(notes, maxLength = 105) {
  if (!notes) return "";
  const clean = notes.replace(/\s+/g, " ").trim();
  return clean.length <= maxLength ? clean : `${clean.slice(0, maxLength)}…`;
}

const MAX_MEDIA = 10;

const ACCEPTED_TYPES = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
  "video/mp4": "MP4",
  "video/quicktime": "MOV",
  "video/webm": "WEBM",
};
const MAX_FILE_MB = 50;
const ACCEPT_ATTR = Object.keys(ACCEPTED_TYPES).join(",");
const ACCEPTED_LABEL = Object.values(ACCEPTED_TYPES).join(", ");


function JournalCard({ entry, onOpen, onAddMedia, uploading, status }) {
  const fileInputRef = useRef(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const mediaList = entry.mediaList || [];
  useEffect(() => {
    setActiveMediaIndex((index) =>
      Math.min(index, Math.max(0, mediaList.length - 1)),
    );
  }, [mediaList.length]);
  const handleUploadClick = (e) => {
    if (uploading) return;
    e.stopPropagation(); // Iwasan ang pagbubukas ng buong card modal
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    try {
      await onAddMedia?.(entry.id, files);
    } catch (error) {
      console.error("Journal upload failed:", error);
    }
  };

  const currentMedia = mediaList[activeMediaIndex];
  const isVideo = currentMedia?.mediaType === "video";
  const hasMedia = mediaList.length > 0;
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen?.();
        }
      }}
      aria-label={`Open journal entry for ${entry.title}`}
      className={`${CARD} cursor-pointer`}
    >
      {/* Hidden Multiple File Input for Photos and Videos */}
      <input
        type="file"
        ref={fileInputRef}
        accept={ACCEPT_ATTR}
        multiple
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={handleFileChange}
      />
      {/* MEDIA GALLERY DISPLAY AREA */}
      <CardImage
        // May media: ipakita ang photo. Wala pa: gamitin ang cover ng trip.
        src={hasMedia ? (isVideo ? null : currentMedia?.url) : entry.image}
        alt={entry.title}
        gradient={entry.color || "from-cyan-500/20 to-indigo-600/30"}
      >
        {hasMedia && isVideo && (
          <video
            key={currentMedia.url}
            src={currentMedia.url}
            className="absolute inset-0 h-full w-full object-cover"
            controls={false}
            muted
            loop
            autoPlay
            playsInline
          />
        )}
        {!hasMedia && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 p-4 text-center">
            <Icon name="camera" className="h-8 w-8 text-white/80" />
            <p className="mt-1 text-xs text-white/70">
              No photos or videos yet
            </p>
          </div>
        )}
        {/* Indicator / Badge count (e.g., 3/10) */}
        {hasMedia && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <Icon name="camera" className="h-3 w-3" />
            {activeMediaIndex + 1} / {mediaList.length}
          </div>
        )}
        {/* Dots navigation */}
        {mediaList.length > 1 && (
          <div className="absolute bottom-3 left-3 right-14 flex items-center justify-center">
            <div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full bg-black/40 px-2 py-1.5 backdrop-blur-md">
              {mediaList.map((m, idx) => (
                <button
                  key={m.id ?? idx}
                  type="button"
                  aria-label={`Show media ${idx + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaIndex(idx);
                  }}
                  className={`h-2 shrink-0 rounded-full transition-all ${activeMediaIndex === idx
                    ? "w-5 bg-teal-400"
                    : "w-2 bg-white/50 hover:bg-white"
                    }`}
                />
              ))}
            </div>
          </div>
        )}
        {/* ADD MEDIA (+) BUTTON OVERLAY */}
        {mediaList.length < MAX_MEDIA && (
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploading}
            title={`Add photo/video (${mediaList.length}/${MAX_MEDIA}) • ${ACCEPTED_LABEL}`}
            aria-label="Add photo or video"
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-slate-900 shadow-xl transition hover:scale-110 active:scale-95"
          >
            {uploading ? "…" : <Icon name="plus" className="h-5 w-5" />}
          </button>
        )}
      </CardImage>
      <p className="px-5 pt-3 text-xs text-white/60">
        Accepted: {ACCEPTED_LABEL} • Max {MAX_FILE_MB}MB each
      </p>
      {status && (
        <div
          role="status"
          aria-live="polite"
          className={`px-5 pt-3 text-sm ${status.state === "uploading"
            ? "text-teal-200"
            : status.state === "success"
              ? "text-emerald-300"
              : "text-red-300"
            }`}
        >
          <div className="flex items-center gap-2">
            {status.state === "uploading" && (
              <Icon name="clock" className="h-4 w-4 animate-pulse" />
            )}
            {status.state === "success" && <span>✓</span>}
            {status.state === "error" && <span>✕</span>}
            <span>{status.message}</span>
          </div>
          {status.state === "uploading" && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-teal-400" />
            </div>
          )}
        </div>
      )}
      {/* CARD CONTENT */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold tracking-tight text-white transition group-hover:text-indigo-300">
            {entry.title}
          </h2>
          <span className="shrink-0 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-[11px] text-teal-300">
            Completed
          </span>
        </div>
        {entry.destination && (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-sky-300">
            <Icon name="pin" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{entry.destination}</span>
          </p>
        )}
        <p className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
          <Icon name="calendar" className="h-3.5 w-3.5 shrink-0" />
          {entry.dateLabel}
        </p>
        <div className="mt-2.5">
          {entry.noteExcerpt ? (
            <p className="line-clamp-3 text-xs leading-relaxed text-white/75">
              {entry.noteExcerpt}
            </p>
          ) : (
            <p className="text-xs italic text-white/40">
              No personal journal notes added yet.
            </p>
          )}
        </div>
        {/* GALLERY SUMMARY COUNTER */}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/50">
            <span>
              {mediaList.length === 0
                ? "0 media items"
                : `${mediaList.length} ${mediaList.length === 1 ? "media item" : "media items"
                } saved`}
            </span>
            <span className="inline-flex items-center gap-1 text-teal-300 hover:underline">
              View Journal
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-2 text-[11px] text-white/40">
            Accepted: {ACCEPTED_LABEL} • Max {MAX_FILE_MB}MB each
          </p>
        </div>
      </div>
    </article>
  );
}

function JournalEmptyState() {
  return (
    <section
      className={`${PANEL} mx-auto my-8 max-w-lg px-8 py-16 text-center`}
    >
      <p className="text-sm text-white/55">Nothing here yet.</p>
      <h2 className="mt-2 text-2xl font-semibold">
        Complete a trip to start your journal
      </h2>
    </section>
  );
}

export default function Journal() {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [mediaByPlan, setMediaByPlan] = useState({});
  const [mediaError, setMediaError] = useState("");
  const [uploadingPlanId, setUploadingPlanId] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});

  const setPlanStatus = (planId, value) =>
    setUploadStatus((prev) => {
      const next = { ...prev };
      if (value) next[planId] = value;
      else delete next[planId];
      return next;
    });

  useEffect(() => {
    let cancelled = false;
    async function loadCompletedPlans() {
      try {
        const response = await fetch("/api/plans", {
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error?.message || "Failed to load journal.");
        }
        if (!Array.isArray(result.data)) {
          throw new Error("Invalid plans response.");
        }
        const completed = result.data.filter((plan) =>
          Boolean(plan.completedAt),
        );
        if (!cancelled) {
          setPlans(completed);
          setLoadError("");
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadCompletedPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  const clearStatusLater = (planId, state, ms) => {
    setTimeout(() => {
      setUploadStatus((prev) => {
        // Burahin lang kung pareho pa rin ang state (hindi pa napalitan ng bagong upload)
        if (prev[planId]?.state !== state) return prev;
        const next = { ...prev };
        delete next[planId];
        return next;
      });
    }, ms);
  };
  // Load media ng bawat completed trip mula sa API
  useEffect(() => {
    const list = Array.isArray(plans) ? plans : [];
    const completed = list.filter(isPlanCompleted);
    let cancelled = false;
    Promise.all(
      completed.map((plan) =>
        listMedia(plan.id)
          .then((data) => [plan.id, data.mediaList])
          .catch((err) => {
            console.warn(
              "listMedia failed:",
              plan.id,
              err.status,
              err.code,
              err.message,
            );
            return [plan.id, []];
          }),
      ),
    ).then((pairs) => {
      if (!cancelled) setMediaByPlan(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [plans]);

  const handleAddMedia = async (planId, files) => {
    if (uploadingPlanId !== null) return;

    setSelectedEntry(null);

    const remaining = MAX_MEDIA - (mediaByPlan[planId] ?? []).length;
    if (files.length > remaining) {
      setPlanStatus(planId, {
        state: "error",
        message: `Uploading failed. You can only add ${remaining} more media item${remaining === 1 ? "" : "s"}.`,
      });
      clearStatusLater(planId, "error", 6000);
      return;
    }

    const unsupported = files.find((f) => !ACCEPTED_TYPES[f.type]);
    if (unsupported) {
      setPlanStatus(planId, {
        state: "error",
        message: `Uploading failed. "${unsupported.name}" is not supported. Accepted: ${ACCEPTED_LABEL}.`,
      });
      clearStatusLater(planId, "error", 6000);
      return;
    }

    const tooLarge = files.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooLarge) {
      setPlanStatus(planId, {
        state: "error",
        message: `Uploading failed. "${tooLarge.name}" is over ${MAX_FILE_MB}MB.`,
      });
      clearStatusLater(planId, "error", 6000);
      return;
    }

    setUploadingPlanId(planId);
    setPlanStatus(planId, {
      state: "uploading",
      message: `Uploading ${files.length} file${files.length === 1 ? "" : "s"}…`,
    });

    try {
      const data = await addMedia(planId, files);
      setMediaByPlan((prev) => ({ ...prev, [planId]: data.mediaList ?? [] }));
      setPlanStatus(planId, {
        state: "success",
        message: "Uploaded successfully!",
      });

      clearStatusLater(planId, "success", 4000);
    } catch (err) {
      console.error("Add media failed:", err);
      setPlanStatus(planId, {
        state: "error",
        message: err.message
          ? `Uploading failed. ${err.message}`
          : "Uploading failed. Please try again.",
      });
      clearStatusLater(planId, "error", 6000);
    } finally {
      setUploadingPlanId(null);
    }
  };
  const [deletingMediaId, setDeletingMediaId] = useState(null);
  const handleDeleteMedia = async (planId, mediaId) => {
    if (deletingMediaId !== null) return;
    const confirmed = window.confirm("Delete this photo/video permanently?");
    if (!confirmed) return;
    setDeletingMediaId(mediaId);
    setMediaError("");
    try {
      await deleteMedia(planId, mediaId);
      // Kunin ang updated gallery mula sa backend.
      const data = await listMedia(planId);
      setMediaByPlan((prev) => ({
        ...prev,
        [planId]: data.mediaList ?? [],
      }));
    } catch (error) {
      console.error("Delete media failed:", error);
      setMediaError(error.message || "Unable to delete media.");
      // Refresh din kahit nagka-error, in case successful
      // ang delete pero pumalya ang response.
      try {
        const data = await listMedia(planId);
        setMediaByPlan((prev) => ({
          ...prev,
          [planId]: data.mediaList ?? [],
        }));
      } catch {
        // Keep the current gallery if reloading fails.
      }
    } finally {
      setDeletingMediaId(null);
    }
  };
  const viewerMedia = viewer ? (mediaByPlan[viewer.planId] ?? []) : [];
  const activeViewerMedia = viewerMedia[viewer?.index ?? 0] ?? null;
  const moveViewer = (direction) => {
    setViewer((current) => {
      if (!current) return null;
      const count = (mediaByPlan[current.planId] ?? []).length;
      if (!count) return null;
      return { ...current, index: (current.index + direction + count) % count };
    });
  };
  useEffect(() => {
    if (!viewer) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setViewer(null);
      if (event.key === "ArrowLeft") moveViewer(-1);
      if (event.key === "ArrowRight") moveViewer(1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewer, mediaByPlan]);

  useEffect(() => {
    if (!viewer) return;
    const count = (mediaByPlan[viewer.planId] ?? []).length;
    if (!count) setViewer(null);
    else if (viewer.index >= count) setViewer((v) => v ? { ...v, index: count - 1 } : null);
  }, [viewer, mediaByPlan]);
  const journalEntries = useMemo(() => {
    const list = Array.isArray(plans) ? plans : [];
    return list.filter(isPlanCompleted).map((plan) => ({
      id: plan.id,
      title: plan.title || plan.name || plan.destination || "Completed trip",
      destination: plan.destination || "",
      startDate: plan.startDate,
      endDate: plan.endDate,
      dateLabel: formatDateRange(plan),
      noteExcerpt: getNoteExcerpt(plan.notes),
      mediaList: mediaByPlan[plan.id] || [], // galing na sa API
      color: plan.color,
      image: plan.image ?? null,
      plan,
    }));
  }, [plans, mediaByPlan]);
  return (
    <Background>
      <div className={PAGE_WRAP}>
        <Navbar />
        {selectedEntry && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedEntry(null);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="journal-detail-title"
              className={`${MODAL} max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 text-white`}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 id="journal-detail-title" className="text-2xl font-bold">
                    {selectedEntry.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
                    <Icon name="pin" className="h-4 w-4 shrink-0" />
                    {selectedEntry.destination}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
                    <Icon name="calendar" className="h-3.5 w-3.5 shrink-0" />
                    {selectedEntry.dateLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  aria-label="Close"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(mediaByPlan[selectedEntry.id] ?? []).map((media) => (
                  <div
                    key={media.id}
                    className="relative overflow-hidden rounded-xl bg-black/30"
                  >
                    {media.mediaType === "video" ? (
                      <video
                        src={media.url}
                        controls
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <img
                        onClick={() => setViewer({ planId: selectedEntry.id, index: (mediaByPlan[selectedEntry.id] ?? []).findIndex((m) => m.id === media.id) })}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") setViewer({ planId: selectedEntry.id, index: (mediaByPlan[selectedEntry.id] ?? []).findIndex((m) => m.id === media.id) }); }}
                        src={media.url}
                        alt={media.name || "Journal photo"}
                        className="aspect-video w-full cursor-zoom-in object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteMedia(selectedEntry.id, media.id)
                      }
                      disabled={deletingMediaId !== null}
                      title="Delete media"
                      aria-label={`Delete ${media.name || "media"}`}
                      className="absolute right-2 top-2 rounded-full bg-red-600/90 p-2 text-white shadow-lg transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingMediaId === media.id ? (
                        "…"
                      ) : (
                        <Icon name="trash" className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              {(mediaByPlan[selectedEntry.id] ?? []).length === 0 && (
                <p className="text-sm text-white/50">
                  No uploaded memories yet.
                </p>
              )}
              <div className="mt-6">
                <h3 className="mb-2 font-semibold">Trip Notes</h3>
                <p className="whitespace-pre-wrap text-sm text-white/75">
                  {selectedEntry.plan?.notes || "No notes added."}
                </p>
              </div>
              {selectedEntry.plan?.activities?.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-2 font-semibold">Planned Activities</h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-white/75">
                    {selectedEntry.plan.activities.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        {viewer && activeViewerMedia && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            role="presentation"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setViewer(null); }}
          >
            <div role="dialog" aria-modal="true" aria-label="Journal media preview" className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center gap-4">
              <button type="button" onClick={() => setViewer(null)} aria-label="Close preview" className="absolute right-0 top-0 z-10 rounded-full bg-white/15 p-3 text-white hover:bg-white/25">
                <Icon name="close" className="h-5 w-5" />
              </button>
              <div className="flex w-full items-center justify-between gap-2">
                {viewerMedia.length > 1 && (
                  <button type="button" onClick={() => moveViewer(-1)} aria-label="Previous media" className="shrink-0 rounded-full bg-white/15 px-3 py-3 text-sm text-white hover:bg-white/25">‹ Prev</button>
                )}
                <div className="flex min-w-0 flex-1 items-center justify-center">
                  {activeViewerMedia.mediaType === "video" ? (
                    <video key={activeViewerMedia.id} src={activeViewerMedia.url} controls autoPlay className="max-h-[80vh] max-w-full object-contain" />
                  ) : (
                    <img src={activeViewerMedia.url} alt={activeViewerMedia.name || "Journal photo"} className="max-h-[80vh] max-w-full object-contain" />
                  )}
                </div>
                {viewerMedia.length > 1 && (
                  <button type="button" onClick={() => moveViewer(1)} aria-label="Next media" className="shrink-0 rounded-full bg-white/15 px-3 py-3 text-sm text-white hover:bg-white/25">Next ›</button>
                )}
              </div>
              <p className="text-xs text-white/70">{viewer.index + 1} / {viewerMedia.length} · {activeViewerMedia.name}</p>
            </div>
          </div>
        )}
        <main className="flex flex-1 flex-col gap-6">
          <PageHeader
            title="Journal & Memories"
            subtitle="View completed trips and attach up to 10 photos or video clips per trip."
          />
          {mediaError && <p className="text-sm text-red-300">{mediaError}</p>}
          {loading ? (
            <p className="text-white/70">Loading your journal...</p>
          ) : loadError ? (
            <p className="text-red-300">{loadError}</p>
          ) : journalEntries.length > 0 ? (
            <section aria-label="Completed trips" className={GRID}>
              {journalEntries.map((entry) => (
                <JournalCard
                  key={entry.id}
                  entry={entry}
                  onOpen={() => setSelectedEntry(entry)}
                  onAddMedia={handleAddMedia}
                  uploading={uploadingPlanId === entry.id}
                  status={uploadStatus[entry.id]}
                />
              ))}
            </section>
          ) : (
            <JournalEmptyState />
          )}
          <p className="mt-auto pt-4 text-center text-xs text-white/50">
            Journal entries are created automatically from completed plans.
          </p>
        </main>
      </div>
    </Background>
  );
}
