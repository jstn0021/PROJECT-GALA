"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { listMedia, addMedia, deleteMedia } from "@/lib/client/plans";
import { Background } from "@/app/components/AuthCard";
import Navbar from "@/app/components/Navbar";

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

/**
 * JOURNAL CARD WITH GALLERY (MULTIPLE PHOTOS & VIDEOS - UP TO 10)
 */
function JournalCard({ entry, onOpen, onAddMedia }) {
  const fileInputRef = useRef(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const mediaList = entry.mediaList || [];
  useEffect(() => {
    setActiveMediaIndex((index) =>
      Math.min(index, Math.max(0, mediaList.length - 1))
    );
  }, [mediaList.length]);
  const MAX_MEDIA = 10;

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
      className="glass flex cursor-pointer flex-col overflow-hidden rounded-3xl transition duration-200 hover:-translate-y-1 md:flex-row"
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
      <div className="relative h-56 shrink-0 bg-slate-900 md:h-auto md:w-72">
        {mediaList.length > 0 ? (
          <div className="relative h-full w-full">
            {/* Display Video or Image depending on media type */}
            {currentMedia?.mediaType === "video" ? (
              <video
                src={currentMedia.url}
                className="h-full w-full object-cover"
                controls={false}
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (

              <div
                className={`flex h-full w-full flex-col items-center justify-center bg-cover bg-center bg-linear-to-br ${entry.color || "from-cyan-500/20 to-indigo-600/30"
                  }`}
                style={
                  entry.image
                    ? { backgroundImage: `url("${entry.image}")` }
                    : undefined
                }
              >
                {!entry.image && (
                  <>
                    <span className="text-3xl">📷</span>
                    <p className="mt-1 text-xs text-white/60">
                      No photos or videos yet
                    </p>
                  </>
                )}
              </div>

            )}

            {/* Indicator / Badge count (e.g., 3/10) */}
            <div className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              📷 {activeMediaIndex + 1} / {mediaList.length}
            </div>

            {/* Thumbnail Navigation / Dots inside card */}
            {mediaList.length > 1 && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1.5 overflow-x-auto py-1">
                {mediaList.map((m, idx) => (
                  <button
                    key={m.id ?? idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMediaIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all ${activeMediaIndex === idx
                      ? "w-5 bg-teal-400"
                      : "w-2 bg-white/50 hover:bg-white"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Empty Gallery Placeholder */
          <div
            className={`flex h-full w-full flex-col items-center justify-center p-4 bg-linear-to-br ${entry.color || "from-cyan-500/20 to-indigo-600/30"
              }`}
          >
            <span className="text-3xl">📷</span>
            <p className="mt-1 text-xs text-white/60">
              No photos or videos yet
            </p>
          </div>
        )}

        {/* ADD MEDIA (+) BUTTON OVERLAY */}
        {mediaList.length < MAX_MEDIA && (
          <button
            type="button"
            onClick={handleUploadClick}
            title={`Add photo/video (${mediaList.length}/${MAX_MEDIA})`}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-slate-900 shadow-xl transition hover:scale-110 active:scale-95"
          >
            <span className="text-xl font-extrabold line-none">+</span>
          </button>
        )}
      </div>

      {/* CARD CONTENT */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{entry.title}</h2>
            <span className="text-[11px] text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Completed
            </span>
          </div>

          {entry.destination && (
            <p className="mt-1 text-sm text-white/70">📍 {entry.destination}</p>
          )}

          <p className="mt-1 text-xs text-white/50">📅 {entry.dateLabel}</p>

          <div className="mt-4">
            {entry.noteExcerpt ? (
              <p className="text-sm leading-relaxed text-white/80">
                {entry.noteExcerpt}
              </p>
            ) : (
              <p className="text-xs italic text-white/40">
                No personal journal notes added yet.
              </p>
            )}
          </div>
        </div>

        {/* GALLERY SUMMARY COUNTER */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/50">
          <span>
            {mediaList.length === 0
              ? "0 media items"
              : `${mediaList.length} ${mediaList.length === 1 ? "media item" : "media items"
              } saved`}
          </span>
          <span className="text-teal-300 hover:underline">View Journal →</span>
        </div>
      </div>
    </article>
  );
}

function JournalEmptyState() {
  return (
    <section className="glass rounded-3xl px-8 py-16 text-center">
      <p className="text-sm text-white/55">Nothing here yet.</p>
      <h2 className="mt-2 text-2xl font-semibold">
        Complete a trip to start your journal
      </h2>
    </section>
  );
}

export default function Journal({ onBack, onOpenEntry }) {
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
          throw new Error(
            result.error?.message || "Failed to load journal."
          );
        }
        if (!Array.isArray(result.data)) {
          throw new Error("Invalid plans response.");
        }
        const completed = result.data.filter(
          (plan) => Boolean(plan.completedAt)
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

      setMediaError(
        err.message || "Unable to upload media."
      );

      throw err;
    }
  };


  const [deletingMediaId, setDeletingMediaId] = useState(null);

  const handleDeleteMedia = async (planId, mediaId) => {
    if (deletingMediaId !== null) return;

    const confirmed = window.confirm(
      "Delete this photo/video permanently?"
    );

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
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 text-white md:px-8 md:py-6 xl:px-12">
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
              className="glass max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-6 text-white"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="journal-detail-title"
                    className="text-2xl font-bold"
                  >
                    {selectedEntry.title}
                  </h2>

                  <p className="mt-1 text-sm text-white/70">
                    📍 {selectedEntry.destination}
                  </p>

                  <p className="mt-1 text-xs text-white/50">
                    📅 {selectedEntry.dateLabel}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="rounded-full bg-white/10 px-3 py-1 text-xl hover:bg-white/20"
                >
                  ×
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
                      {deletingMediaId === media.id ? "…" : "🗑️"}
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


        <main className="flex flex-1 flex-col">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="mb-5 inline-block text-sm text-white/65 transition hover:text-white"
            >
              ← Back
            </button>
          ) : (
            <Link
              href="/dashboard"
              className="mb-5 inline-block text-sm text-white/65 transition hover:text-white"
            >
              ← Back
            </Link>
          )}

          <header className="mb-8">
            <h1 className="text-4xl font-bold">Journal & Memories</h1>
            <p className="mt-1 text-sm text-white/65">
              View completed trips and attach up to 10 photos or video clips per
              trip.
            </p>
          </header>

          {mediaError && (
            <p className="mb-4 text-sm text-red-300">{mediaError}</p>
          )}

          {loading ? (
            <p className="text-white/70">Loading your journal...</p>
          ) : loadError ? (
            <p className="text-red-300">{loadError}</p>
          ) : journalEntries.length > 0 ? (
            <section
              aria-label="Completed trips"
              className="grid grid-cols-1 gap-5 xl:grid-cols-2"
            >
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

          <p className="mt-8 text-center text-xs text-white/50">
            Journal entries are created automatically from completed plans.
          </p>
        </main>
      </div>
    </Background>
  );
}
