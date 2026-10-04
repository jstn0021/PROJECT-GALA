import React, { useMemo, useState } from "react";
import "./JournalEntry.css";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00`);

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

  if (start && end) {
    return `${start} to ${end}`;
  }

  return start || end || "";
}

function money(value) {
  const number = Number(value) || 0;

  return number.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/*
|--------------------------------------------------------------------------
| Budget calculation
|--------------------------------------------------------------------------
|
| Supports either:
|
| plan.budget
|
| or:
|
| plan.budget.total
|
| and expense/category data.
|
*/

function calculateBudget(plan) {
  const budget =
    plan.budget || {};

  const totalBudget =
    Number(
      plan.totalBudget ??
        budget.total ??
        0
    );

  const categories =
    budget.categories ||
    plan.budgetCategories ||
    [];

  let estimated = 0;
  let actual = 0;

  if (Array.isArray(categories)) {
    categories.forEach((category) => {
      estimated +=
        Number(category.estimated) || 0;

      actual +=
        Number(category.actual) || 0;
    });
  }

  /*
   * If the plan already stores totals,
   * use those when available.
   */
  if (
    budget.estimatedTotal !==
    undefined
  ) {
    estimated =
      Number(budget.estimatedTotal) ||
      0;
  }

  if (
    budget.actualTotal !==
    undefined
  ) {
    actual =
      Number(budget.actualTotal) ||
      0;
  }

  /*
   * Difference follows the same convention
   * as the supplied Plan Details screen:
   *
   * Estimated - Actual
   */
  const difference =
    estimated - actual;

  const percentage =
    totalBudget > 0
      ? Math.min(
          (actual / totalBudget) * 100,
          100
        )
      : 0;

  return {
    totalBudget,
    estimated,
    actual,
    difference,
    percentage,
  };
}

/*
|--------------------------------------------------------------------------
| Journal Entry
|--------------------------------------------------------------------------
*/

export default function JournalEntry({
  plan,

  /*
   * Parent page is Journal.
   */
  onBack,
}) {
  const [selectedPhoto, setSelectedPhoto] =
    useState(0);

  /*
   * No local journal data is created.
   * Everything is derived from `plan`.
   */
  const budget = useMemo(
    () => calculateBudget(plan || {}),
    [plan]
  );

  if (!plan) {
    return (
      <div className="journal-entry-page">
        <main className="journal-entry-shell">
          <button
            type="button"
            className="journal-entry-back"
            onClick={onBack}
          >
            ← Back
          </button>

          <section className="journal-entry-missing">
            <h1>Journal entry unavailable</h1>

            <p>
              This journal entry is no longer
              available because its plan could
              not be found.
            </p>
          </section>
        </main>
      </div>
    );
  }

  /*
   * Photos can come from:
   *
   * plan.photos = [
   *   "/images/photo-1.jpg",
   *   "/images/photo-2.jpg"
   * ]
   *
   * or plan.destinationPhotos.
   */
  const photos =
    plan.photos ||
    plan.destinationPhotos ||
    [];

  const normalizedPhotos =
    Array.isArray(photos)
      ? photos.filter(Boolean)
      : [];

  /*
   * Use the plan's main photo as a fallback
   * when there isn't a gallery.
   */
  const fallbackPhoto =
    plan.destinationPhoto ||
    plan.photoUrl ||
    plan.imageUrl ||
    null;

  const gallery =
    normalizedPhotos.length > 0
      ? normalizedPhotos
      : fallbackPhoto
        ? [fallbackPhoto]
        : [];

  const activePhoto =
    gallery[selectedPhoto] ||
    gallery[0] ||
    null;

  const activities =
    Array.isArray(plan.activities)
      ? plan.activities
      : [];

  const notes =
    plan.notes?.trim() || "";

  const isOverBudget =
    budget.totalBudget > 0 &&
    budget.actual >
      budget.totalBudget;

  const remaining =
    budget.totalBudget -
    budget.actual;

  return (
    <div className="journal-entry-page">
      <main className="journal-entry-shell">

        {/* ============================================================
            NAVIGATION
        ============================================================ */}

        <nav className="journal-entry-nav">
          <div className="journal-entry-logo">
            Logo
          </div>

          <button
            type="button"
            className="journal-entry-nav-item"
          >
            Dashboard
          </button>

          <button
            type="button"
            className="journal-entry-nav-item"
          >
            My plans
          </button>

          <button
            type="button"
            className="journal-entry-nav-item"
          >
            Bucket list
          </button>

          <button
            type="button"
            className="journal-entry-nav-item active"
          >
            Journal
          </button>

          <button
            type="button"
            className="journal-entry-nav-item explore"
          >
            Explore <span>▾</span>
          </button>

          <div className="journal-entry-profile" />
        </nav>

        {/* ============================================================
            BACK
        ============================================================ */}

        <button
          type="button"
          className="journal-entry-back"
          onClick={onBack}
        >
          ← Back
        </button>

        {/* ============================================================
            HEADER
        ============================================================ */}

        <header className="journal-entry-header">
          <div className="journal-entry-title-row">
            <h1>
              {plan.title ||
                plan.name ||
                "Completed trip"}
            </h1>

            <span className="view-only-badge">
              View only
            </span>
          </div>

          <p>
            {plan.destination || ""}
            {plan.destination &&
            formatDateRange(plan)
              ? " · "
              : ""}
            {formatDateRange(plan)}
          </p>
        </header>

        {/* ============================================================
            MAIN CONTENT
        ============================================================ */}

        <section className="journal-entry-layout">

          {/* ==========================================================
              LEFT COLUMN
          ========================================================== */}

          <div className="journal-entry-left">

            {/* ========================================================
                PHOTO GALLERY
            ======================================================== */}

            <section
              className="journal-gallery"
              aria-label="Trip photos"
            >
              <div
                className={
                  activePhoto
                    ? "journal-main-photo has-photo"
                    : "journal-main-photo"
                }
                style={
                  activePhoto
                    ? {
                        backgroundImage: `
                          linear-gradient(
                            135deg,
                            rgba(255,255,255,0.04),
                            rgba(0,0,0,0.04)
                          ),
                          url("${activePhoto}")
                        `,
                      }
                    : undefined
                }
              >
                {!activePhoto && (
                  <div className="photo-placeholder">
                    {plan.destination ||
                      "Trip photo"}
                  </div>
                )}
              </div>

              <div className="journal-photo-controls">
                <div className="journal-thumbnails">
                  {gallery
                    .slice(0, 3)
                    .map(
                      (photo, index) => (
                        <button
                          key={`${photo}-${index}`}
                          type="button"
                          className={`
                            journal-thumbnail
                            ${
                              selectedPhoto ===
                              index
                                ? "selected"
                                : ""
                            }
                          `}
                          onClick={() =>
                            setSelectedPhoto(
                              index
                            )
                          }
                          aria-label={`View photo ${
                            index + 1
                          }`}
                        >
                          <span
                            style={{
                              backgroundImage: `
                                url("${photo}")
                              `,
                            }}
                          />
                        </button>
                      )
                    )}

                  {gallery.length === 0 && (
                    <>
                      <div className="journal-thumbnail placeholder-thumb" />
                      <div className="journal-thumbnail placeholder-thumb" />
                      <div className="journal-thumbnail placeholder-thumb" />
                    </>
                  )}
                </div>

                <button
                  type="button"
                  className="view-photos-button"
                  onClick={() =>
                    setSelectedPhoto(0)
                  }
                >
                  View all photos
                </button>
              </div>
            </section>

            {/* ========================================================
                NOTES
            ======================================================== */}

            <section className="journal-notes">
              <h2>Notes from the plan</h2>

              <div className="journal-notes-card">
                {notes ? (
                  <p>{notes}</p>
                ) : (
                  <div className="notes-placeholder">
                    No notes were added to this
                    plan.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ==========================================================
              RIGHT COLUMN
          ========================================================== */}

          <aside className="journal-details-card">

            {/* ========================================================
                TRIP DETAILS
            ======================================================== */}

            <h2>Trip details</h2>

            <div className="detail-row">
              <span>Destination</span>

              <strong>
                {plan.destination ||
                  "—"}
              </strong>
            </div>

            <div className="detail-row">
              <span>Dates</span>

              <strong>
                {formatDateRange(plan) ||
                  "—"}
              </strong>
            </div>

            <div className="detail-row activities-row">
              <span>Activities</span>

              <div className="activity-values">
                {activities.length > 0 ? (
                  activities.map(
                    (activity, index) => {
                      const label =
                        typeof activity ===
                        "string"
                          ? activity
                          : activity.name;

                      return (
                        <span
                          key={`${label}-${index}`}
                        >
                          {label}
                        </span>
                      );
                    }
                  )
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>

            {/* ========================================================
                BUDGET SUMMARY
            ======================================================== */}

            <section className="journal-budget">
              <h2>Budget summary</h2>

              <div className="budget-heading-row">
                <span>Budget</span>
                <span>Estimated</span>
                <span>Actual</span>
                <span>Difference</span>
              </div>

              <div className="budget-value-row">
                <strong>
                  {money(
                    budget.totalBudget
                  )}
                </strong>

                <strong>
                  {money(
                    budget.estimated
                  )}
                </strong>

                <strong>
                  {money(
                    budget.actual
                  )}
                </strong>

                <strong
                  className={
                    budget.difference <
                    0
                      ? "negative"
                      : "positive"
                  }
                >
                  {budget.difference < 0
                    ? "−"
                    : "+"}
                  {money(
                    Math.abs(
                      budget.difference
                    )
                  ).replace(
                    "$",
                    "$"
                  )}
                </strong>
              </div>

              {/* ======================================================
                  PROGRESS
              ====================================================== */}

              <div className="journal-budget-progress">
                <div
                  className="journal-budget-progress-bar"
                  style={{
                    width: `${budget.percentage}%`,
                  }}
                />
              </div>

              <div
                className={
                  isOverBudget
                    ? "budget-message over"
                    : "budget-message under"
                }
              >
                {budget.totalBudget ===
                0 ? (
                  "No total budget set"
                ) : isOverBudget ? (
                  <>
                    Over budget by{" "}
                    {money(
                      Math.abs(remaining)
                    )}
                  </>
                ) : (
                  <>
                    Under budget by{" "}
                    {money(remaining)}
                  </>
                )}
              </div>
            </section>
          </aside>
        </section>

        {/* ============================================================
            VIEW-ONLY FOOTER
        ============================================================ */}

        <p className="journal-entry-footer">
          All content comes from the plan. No
          Edit or Delete buttons. To change it,
          edit the plan in My plans. Back returns
          to Journal.
        </p>
      </main>
    </div>
  );
}