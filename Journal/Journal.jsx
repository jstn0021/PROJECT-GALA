import React, { useMemo } from "react";
import "./Journal.css";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function isPlanCompleted(plan) {
  /*
   * Prefer the status maintained by your plan model.
   *
   * The fallback date calculation keeps Journal synchronized
   * even if status hasn't been explicitly persisted.
   */

  if (plan.status === "Completed") {
    return true;
  }

  if (plan.status) {
    return false;
  }

  if (!plan.endDate) {
    return false;
  }

  const today = new Date();
  const endDate = new Date(
    `${plan.endDate}T23:59:59`
  );

  return today > endDate;
}

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(
    `${date}T00:00:00`
  );

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

function formatDateRange(plan) {
  const start = formatDate(plan.startDate);
  const end = formatDate(plan.endDate);

  if (!start && !end) {
    return "";
  }

  if (!end) {
    return start;
  }

  if (!start) {
    return end;
  }

  return `${start} to ${end}`;
}

function getNoteExcerpt(notes, maxLength = 105) {
  if (!notes) {
    return "";
  }

  const cleanNotes = notes
    .replace(/\s+/g, " ")
    .trim();

  if (cleanNotes.length <= maxLength) {
    return cleanNotes;
  }

  return `${cleanNotes.slice(
    0,
    maxLength
  )}…`;
}

/*
|--------------------------------------------------------------------------
| Journal
|--------------------------------------------------------------------------
*/

export default function Journal({
  plans = [],

  /*
   * Back returns to Dashboard home.
   */
  onBack,

  /*
   * Clicking an entry opens Journal Entry.
   */
  onOpenEntry,
}) {
  /*
   * Journal entries are derived from plans.
   *
   * There is intentionally NO separate journal state.
   */
  const journalEntries = useMemo(() => {
    return plans
      .filter(isPlanCompleted)
      .map((plan) => ({
        id: plan.id,

        title:
          plan.title ||
          plan.name ||
          plan.destination ||
          "Completed trip",

        destination:
          plan.destination || "",

        startDate: plan.startDate,

        endDate: plan.endDate,

        dateLabel:
          formatDateRange(plan),

        noteExcerpt:
          getNoteExcerpt(plan.notes),

        photo:
          plan.destinationPhoto ||
          plan.photoUrl ||
          plan.imageUrl ||
          null,

        /*
         * Keep the original plan available so
         * Journal Entry can show its complete data.
         */
        plan,
      }));
  }, [plans]);

  return (
    <div className="journal-page">
      <main className="journal-shell">

        {/* ============================================================
            NAVIGATION
        ============================================================ */}

        <nav className="journal-nav">
          <div className="journal-logo">
            Logo
          </div>

          <button
            type="button"
            className="journal-nav-item"
          >
            Dashboard
          </button>

          <button
            type="button"
            className="journal-nav-item"
          >
            My plans
          </button>

          <button
            type="button"
            className="journal-nav-item"
          >
            Bucket list
          </button>

          <button
            type="button"
            className="journal-nav-item active"
          >
            Journal
          </button>

          <button
            type="button"
            className="journal-nav-item explore"
          >
            Explore <span>▾</span>
          </button>

          <div className="journal-profile" />
        </nav>

        {/* ============================================================
            HEADER
        ============================================================ */}

        <header className="journal-header">
          <button
            type="button"
            className="journal-back"
            onClick={onBack}
          >
            ← Back
          </button>

          <h1>Journal</h1>

          <p>
            View only. Completed plans from My
            plans appear here automatically.
          </p>
        </header>

        {/* ============================================================
            ENTRIES
        ============================================================ */}

        {journalEntries.length > 0 ? (
          <section
            className="journal-list"
            aria-label="Completed trips"
          >
            {journalEntries.map(
              (entry) => (
                <JournalCard
                  key={entry.id}
                  entry={entry}
                  onOpen={() =>
                    onOpenEntry?.(entry)
                  }
                />
              )
            )}
          </section>
        ) : (
          <JournalEmptyState />
        )}

        {/* ============================================================
            IMPORTANT: VIEW ONLY
        ============================================================ */}

        <p className="journal-footer">
          Journal entries are created
          automatically from completed plans.
          To change an entry, edit the plan in
          My plans.
        </p>
      </main>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Journal Card
|--------------------------------------------------------------------------
*/

function JournalCard({
  entry,
  onOpen,
}) {
  return (
    <article
      className="journal-card"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onOpen?.();
        }
      }}
      aria-label={`Open journal entry for ${entry.title}`}
    >
      {/* ==============================================================
          DESTINATION IMAGE
      ============================================================== */}

      <div
        className={`journal-image ${
          entry.photo
            ? "has-photo"
            : "no-photo"
        }`}
        style={
          entry.photo
            ? {
                backgroundImage: `
                  linear-gradient(
                    135deg,
                    rgba(20, 22, 34, 0.05),
                    rgba(20, 22, 34, 0.08)
                  ),
                  url("${entry.photo}")
                `,
              }
            : undefined
        }
        aria-hidden="true"
      />

      {/* ==============================================================
          ENTRY INFORMATION
      ============================================================== */}

      <div className="journal-entry-content">
        <h2>{entry.title}</h2>

        <p className="journal-date">
          {entry.dateLabel}
        </p>

        <div className="journal-note-area">
          <div className="journal-note-line line-long" />

          <div className="journal-note-line line-short" />

          {entry.noteExcerpt && (
            <p className="journal-note">
              {entry.noteExcerpt}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| Empty State
|--------------------------------------------------------------------------
*/

function JournalEmptyState() {
  return (
    <section className="journal-empty">
      <span>Empty state:</span>{" "}
      <strong>
        Complete a trip to start your journal
      </strong>
    </section>
  );
}