"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { listMedia, addMedia, deleteMedia } from "@/lib/client/plans";
import { Background } from "@/app/components/AuthCard";
import Navbar from "@/app/components/Navbar";
import {
  GRID,
  PAGE_WRAP,
  PageHeader,
  CardImage,
  Icon,
} from "@/app/components/ui";

/* Journal-only na styles. Kapareho na ng Dashboard, My Plans, New Plan at Profile
   ang panels at shadows. Hindi ginagalaw ang ui.jsx, kaya hindi apektado ang ibang pages. */
const PANEL =
  "rounded-3xl border border-gala-aqua/30 bg-linear-to-br from-gala-surface/90 via-gala-surface/85 to-[#172B3A]/90 backdrop-blur-md shadow-card";
const MODAL = `${PANEL} border-gala-line bg-gala-surface shadow-lift`;
const CARD = `group relative flex flex-col overflow-hidden ${PANEL} transition duration-300 hover:-translate-y-1 hover:shadow-lift`;

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

/**
 * JOURNAL CARD WITH GALLERY (MULTIPLE PHOTOS & VIDEOS - UP TO 10)
 * Kapareho ng laki ng Explore card (16/11 image + p-5 content).
 */
function JournalCard({ entry, onOpen, onAddMedia }) {
  const fileInputRef = useRef(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const mediaList = entry.mediaList || [];

  useEffect(() => {
    setActiveMediaIndex((index) =>
      Math.min(index, Math.max(0, mediaList.length - 1)),
    );
  }, [mediaList.length]);

  const handleUploadClick = (e) => {
    e.stopPropagation(); // Iwasan ang pagbubukas ng buong card modal
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const remainingSlots = MAX_MEDIA - mediaList.length;

    if (files.length > remainingSlots) {
      alert(`You can only add ${remainingSlots} more media items.`);
      e.target.value = "";
      return;
    }

    try {
      await onAddMedia?.(entry.id, files);
    } catch (error) {
      console.error("Journal upload failed:", error);
    } finally {
      e.target.value = "";
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
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* MEDIA GALLERY DISPLAY AREA */}
      <CardImage
        // May media: ipakita ang photo. Wala pa: gamitin ang cover ng trip.
        src={hasMedia ? (isVideo ? null : currentMedia?.url) : entry.image}
        alt={entry.title}
        gradient={entry.color || "from-gala-teal/30 to-gala-raised"}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gala-bg/40 p-4 text-center">
            <Icon name="camera" className="h-8 w-8 text-gala-aqua" />
            <p className="mt-1 text-xs text-gala-text/75">
              No photos yet
            </p>
          </div>
        )}

        {/* Indicator / Badge count (e.g., 3/10) */}
        {hasMedia && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-gala-bg/70 px-2.5 py-1 text-[11px] font-medium text-gala-text backdrop-blur-md">
            <Icon name="camera" className="h-3 w-3" />
            {activeMediaIndex + 1} / {mediaList.length}
          </div>
        )}

        {/* Dots navigation */}
        {mediaList.length > 1 && (
          <div className="absolute bottom-3 left-3 right-14 flex items-center justify-center">
            <div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full bg-gala-bg/60 px-2 py-1.5 backdrop-blur-md">
              {mediaList.map((m, idx) => (
                <button
                  key={m.id ?? idx}
                  type="button"
                  aria-label={`Show media ${idx + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaIndex(idx);
                  }}
                  className={`h-2 shrink-0 rounded-full transition-all ${
                    activeMediaIndex === idx
                      ? "w-5 bg-gala-accent"
                      : "w-2 bg-gala-text/50 hover:bg-gala-text"
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
            title={`Add photo/video (${mediaList.length}/${MAX_MEDIA})`}
            aria-label="Add photo or video"
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-gala-accent text-gala-bg shadow-accent transition hover:scale-110 hover:brightness-110 active:scale-95"
          >
            <Icon name="plus" className="h-5 w-5" />
          </button>
        )}
      </CardImage>

      {/* CARD CONTENT */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold tracking-tight text-gala-text transition group-hover:text-gala-accent">
            {entry.title}
          </h2>
          <span className="shrink-0 rounded-full border border-gala-accent/40 bg-gala-accent/10 px-2.5 py-0.5 text-[11px] text-gala-accent">
            Completed
          </span>
        </div>

        {entry.destination && (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gala-aqua">
            <Icon name="pin" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{entry.destination}</span>
          </p>
        )}

        <p className="mt-1 flex items-center gap-1.5 text-xs text-gala-muted">
          <Icon name="calendar" className="h-3.5 w-3.5 shrink-0" />
          {entry.dateLabel}
        </p>

        <div className="mt-2.5">
          {entry.noteExcerpt ? (
            <p className="line-clamp-3 text-xs leading-relaxed text-gala-text/75">
              {entry.noteExcerpt}
            </p>
          ) : (
            <p className="text-xs italic text-gala-muted">
              No personal journal notes added yet.
            </p>
          )}
        </div>

        {/* GALLERY SUMMARY COUNTER */}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between border-t border-gala-line pt-3 text-xs text-gala-muted">
            <span>
              {mediaList.length === 0
                ? "0 media items"
                : `${mediaList.length} ${
                    mediaList.length === 1 ? "media item" : "media items"
                  } saved`}
            </span>
            <span className="inline-flex items-center gap-1 text-gala-accent hover:underline">
              View Journal
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </span>
          </div>
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
      <p className="text-sm text-gala-muted">Nothing here yet.</p>
      <h2 className="mt-2 text-2xl font-semibold text-gala-text">
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

  // Mag-upload ng bagong media sa API, tapos i-update ang listahan ng plan
  const handleAddMedia = async (planId, files) => {
    setMediaError("");

    try {
      const data = await addMedia(planId, files);

      setMediaByPlan((prev) => ({
        ...prev,
        [planId]: data.mediaList ?? [],
      }));
    } catch (err) {
      console.error("Add media failed:", err);
      setMediaError(err.message || "Unable to upload media.");
      throw err;
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
      <div className={`${PAGE_WRAP} text-gala-text`}>
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
              className={`${MODAL} max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 text-gala-text`}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 id="journal-detail-title" className="text-2xl font-bold text-gala-text">
                    {selectedEntry.title}
                  </h2>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-gala-aqua">
                    <Icon name="pin" className="h-4 w-4 shrink-0" />
                    {selectedEntry.destination}
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gala-muted">
                    <Icon name="calendar" className="h-3.5 w-3.5 shrink-0" />
                    {selectedEntry.dateLabel}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  aria-label="Close"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gala-line bg-gala-raised/60 text-gala-text transition hover:bg-gala-raised"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(mediaByPlan[selectedEntry.id] ?? []).map((media) => (
                  <div
                    key={media.id}
                    className="relative overflow-hidden rounded-xl border border-gala-line bg-gala-bg/50"
                  >
                    {media.mediaType === "video" ? (
                      <video
                        src={media.url}
                        controls
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt={media.name || "Journal photo"}
                        className="aspect-video w-full object-cover"
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
                <p className="text-sm text-gala-muted">
                  No uploaded memories yet.
                </p>
              )}

              <div className="mt-6">
                <h3 className="mb-2 font-semibold text-gala-text">Trip Notes</h3>
                <p className="whitespace-pre-wrap text-sm text-gala-text/75">
                  {selectedEntry.plan?.notes || "No notes added."}
                </p>
              </div>

              {selectedEntry.plan?.activities?.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-2 font-semibold text-gala-text">Planned Activities</h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-gala-text/75 marker:text-gala-accent">
                    {selectedEntry.plan.activities.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </div>
              )}
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
            <p className="text-gala-muted">Loading your journal...</p>
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
                />
              ))}
            </section>
          ) : (
            <JournalEmptyState />
          )}

          <p className="mt-auto pt-4 text-center text-xs text-gala-muted">
            Journal entries are created automatically from completed plans.
          </p>
        </main>
      </div>
    </Background>
  );
}