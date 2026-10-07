"use client";

import Link from "next/link";
import { useMemo } from "react";
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

function JournalCard({ entry, onOpen }) {
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
      className="glass flex cursor-pointer flex-col overflow-hidden rounded-3xl transition duration-200 hover:-translate-y-1 sm:flex-row"
    >
      <div
        aria-hidden="true"
        className={`h-44 shrink-0 bg-cover bg-center sm:h-auto sm:w-56 ${
          entry.photo
            ? ""
            : `bg-linear-to-br ${entry.color || "from-cyan-300/40 to-indigo-400/40"}`
        }`}
        style={
          entry.photo ? { backgroundImage: `url("${entry.photo}")` } : undefined
        }
      />

      <div className="flex-1 p-5">
        <h2 className="text-lg font-semibold">{entry.title}</h2>

        {entry.destination && (
          <p className="mt-1 text-sm text-white/70">{entry.destination}</p>
        )}

        <p className="mt-1 text-xs text-white/50">{entry.dateLabel}</p>

        <div className="mt-4">
          {entry.noteExcerpt ? (
            <p className="text-sm text-white/75">{entry.noteExcerpt}</p>
          ) : (
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-white/10" />
              <div className="h-2 w-2/3 rounded-full bg-white/10" />
            </div>
          )}
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
      photo: plan.destinationPhoto || plan.photoUrl || plan.imageUrl || null,
      color: plan.color,
      plan,
    }));
  }, [plans]);

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
              href="/Main/HOME"
              className="mb-5 inline-block text-sm text-white/65 transition hover:text-white"
            >
              ← Back
            </Link>
          )}

          <header className="mb-8">
            <h1 className="text-4xl font-bold">Journal</h1>
            <p className="mt-1 text-sm text-white/65">
              View only. Completed plans from My plans appear here
              automatically.
            </p>
          </header>

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
                />
              ))}
            </section>
          ) : (
            <JournalEmptyState />
          )}

          <p className="mt-8 text-center text-xs text-white/50">
            Journal entries are created automatically from completed plans. To
            change an entry, edit the plan in My plans.
          </p>
        </main>
      </div>
    </Background>
  );
}
