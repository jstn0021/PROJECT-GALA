"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { listMedia, addMedia } from "@/lib/client/plans";
import { Background } from "@/app/components/AuthCard";
import Navbar from "@/app/components/Navbar";
import {
  useStoredState,
  PLANS_KEY,
  SEED_PLANS,
} from "@/app/components/usePlanStore";

function isPlanCompleted(plan) {
  return plan?.status === "Completed";
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
  const MAX_MEDIA = 10;

  const handleUploadClick = (e) => {
    e.stopPropagation(); // Iwasan ang pagbubukas ng buong card modal
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Limitahan sa natitirang slots hanggang 10
    const remainingSlots = MAX_MEDIA - mediaList.length;
    const filesToUpload = files.slice(0, remainingSlots);

    const newMediaItems = [];

    for (const file of filesToUpload) {
      const isVideo = file.type.startsWith("video/");
      const reader = new FileReader();

      const mediaUrl = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      newMediaItems.push({
        url: mediaUrl,
        mediaType: isVideo ? "video" : "image",
        name: file.name,
      });
    }

    if (newMediaItems.length > 0) {
      await onAddMedia?.(entry.id, newMediaItems);
    }

    // Reset input
    e.target.value = "";
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
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${currentMedia?.url}")` }}
              />
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
                    className={`h-2 rounded-full transition-all ${
                      activeMediaIndex === idx
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
            className={`flex h-full w-full flex-col items-center justify-center p-4 bg-linear-to-br ${
              entry.color || "from-cyan-500/20 to-indigo-600/30"
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
              : `${mediaList.length} ${
                  mediaList.length === 1 ? "media item" : "media items"
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
  const [plans] = useStoredState(PLANS_KEY, SEED_PLANS);
  const [mediaByPlan, setMediaByPlan] = useState({});
  const [mediaError, setMediaError] = useState("");

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
  const handleAddMedia = async (planId, newMediaItems) => {
    setMediaError("");
    try {
      const data = await addMedia(planId, newMediaItems);
      setMediaByPlan((prev) => ({ ...prev, [planId]: data.mediaList }));
    } catch (err) {
      console.error(
        "addMedia failed:",
        err.status,
        err.code,
        err.message,
        err.details,
      );
      setMediaError(`${err.message} (${err.status ?? "?"} ${err.code ?? ""})`);
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
      plan,
    }));
  }, [plans, mediaByPlan]);

  return (
    <Background>
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 text-white md:px-8 md:py-6 xl:px-12">
        <Navbar />

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

          {journalEntries.length > 0 ? (
            <section
              aria-label="Completed trips"
              className="grid grid-cols-1 gap-5 xl:grid-cols-2"
            >
              {journalEntries.map((entry) => (
                <JournalCard
                  key={entry.id}
                  entry={entry}
                  onOpen={() => onOpenEntry?.(entry)}
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
