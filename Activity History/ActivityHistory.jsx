import React, { useMemo, useState } from "react";
import "./ActivityHistory.css";

/*
|--------------------------------------------------------------------------
| Example activity data
|--------------------------------------------------------------------------
|
| In your actual application, these records should come from your
| application state / database.
|
| type:
|   plans
|   bucket
|   budget
|   journal
|
| dateGroup:
|   Today
|   Yesterday
|   Earlier this week
|
| target:
|   Used by the View button to open the appropriate page.
*/

const INITIAL_ACTIVITIES = [
  {
    id: 1,
    type: "budget",
    title: "Added expense to Bali trip",
    metadata: "Budget, 2:30 PM",
    dateGroup: "Today",
    date: "2026-10-04",
    time: "2:30 PM",
    target: {
      page: "plan-details",
      planId: "bali",
      tab: "budget",
    },
  },

  {
    id: 2,
    type: "bucket",
    title: "Marked Santorini as done",
    metadata: "Bucket list, 11:05 AM",
    dateGroup: "Today",
    date: "2026-10-04",
    time: "11:05 AM",
    target: {
      page: "bucket-list",
      itemId: "santorini",
    },
  },

  {
    id: 3,
    type: "plans",
    title: "Created plan from Weekend template",
    metadata: "Plans, 4:12 PM",
    dateGroup: "Yesterday",
    date: "2026-10-03",
    time: "4:12 PM",
    target: {
      page: "plan-details",
      planId: "weekend-plan",
    },
  },

  {
    id: 4,
    type: "plans",
    title: "Edited Lisbon food trip notes",
    metadata: "Plans, 9:48 AM",
    dateGroup: "Yesterday",
    date: "2026-10-03",
    time: "9:48 AM",
    target: {
      page: "plan-details",
      planId: "lisbon",
      tab: "notes",
    },
  },

  {
    id: 5,
    type: "journal",
    title: "Santorini getaway added to Journal",
    metadata: "Journal, Monday",
    dateGroup: "Earlier this week",
    date: "2026-09-29",
    time: "Monday",
    target: {
      page: "journal-entry",
      planId: "santorini",
    },
  },

  {
    id: 6,
    type: "plans",
    title: "Created Kyoto spring trip",
    metadata: "Plans, Monday",
    dateGroup: "Earlier this week",
    date: "2026-09-29",
    time: "Monday",
    target: {
      page: "plan-details",
      planId: "kyoto",
    },
  },

  {
    id: 7,
    type: "bucket",
    title: "Added Cusco to bucket list",
    metadata: "Bucket list, Sunday",
    dateGroup: "Earlier this week",
    date: "2026-09-28",
    time: "Sunday",
    target: {
      page: "bucket-list",
      itemId: "cusco",
    },
  },

  {
    id: 8,
    type: "budget",
    title: "Added transport expense to Lisbon",
    metadata: "Budget, Sunday",
    dateGroup: "Earlier this week",
    date: "2026-09-28",
    time: "Sunday",
    target: {
      page: "plan-details",
      planId: "lisbon",
      tab: "budget",
    },
  },

  {
    id: 9,
    type: "journal",
    title: "Seoul city break added to Journal",
    metadata: "Journal, Saturday",
    dateGroup: "Earlier this week",
    date: "2026-09-27",
    time: "Saturday",
    target: {
      page: "journal-entry",
      planId: "seoul",
    },
  },

  {
    id: 10,
    type: "plans",
    title: "Updated Bali week activities",
    metadata: "Plans, Saturday",
    dateGroup: "Earlier this week",
    date: "2026-09-27",
    time: "Saturday",
    target: {
      page: "plan-details",
      planId: "bali",
      tab: "activities",
    },
  },
];

/*
|--------------------------------------------------------------------------
| Filter configuration
|--------------------------------------------------------------------------
*/

const FILTERS = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "plans",
    label: "Plans",
  },
  {
    id: "bucket",
    label: "Bucket list",
  },
  {
    id: "budget",
    label: "Budget",
  },
  {
    id: "journal",
    label: "Journal",
  },
];

/*
|--------------------------------------------------------------------------
| Group configuration
|--------------------------------------------------------------------------
*/

const DATE_GROUPS = [
  "Today",
  "Yesterday",
  "Earlier this week",
];

/*
|--------------------------------------------------------------------------
| Activity History
|--------------------------------------------------------------------------
*/

export default function ActivityHistory({
  activities = INITIAL_ACTIVITIES,

  /*
   * Back → Dashboard
   */
  onBack,

  /*
   * Called when a user clicks View.
   *
   * Example:
   *
   * onView({
   *   page: "plan-details",
   *   planId: "bali",
   *   tab: "budget"
   * })
   */
  onView,
}) {
  const [activeFilter, setActiveFilter] =
    useState("all");

  const [dateRange, setDateRange] =
    useState({
      start: "",
      end: "",
    });

  const [visibleCount, setVisibleCount] =
    useState(5);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  /*
   * Filter by category and optional date range.
   */
  const filteredActivities =
    useMemo(() => {
      return activities.filter((activity) => {
        const matchesFilter =
          activeFilter === "all" ||
          activity.type === activeFilter;

        if (!matchesFilter) {
          return false;
        }

        if (dateRange.start) {
          if (
            activity.date <
            dateRange.start
          ) {
            return false;
          }
        }

        if (dateRange.end) {
          if (
            activity.date >
            dateRange.end
          ) {
            return false;
          }
        }

        return true;
      });
    }, [
      activities,
      activeFilter,
      dateRange,
    ]);

  /*
   * Pagination / Load more.
   */
  const visibleActivities =
    filteredActivities.slice(
      0,
      visibleCount
    );

  const hasMore =
    visibleCount <
    filteredActivities.length;

  /*
   * Group the currently visible rows.
   */
  const groupedActivities =
    DATE_GROUPS.map((group) => ({
      group,
      items: visibleActivities.filter(
        (activity) =>
          activity.dateGroup === group
      ),
    })).filter(
      (section) =>
        section.items.length > 0
    );

  /*
   * View handler.
   */
  function handleView(activity) {
    if (onView) {
      onView(activity.target, activity);
      return;
    }

    /*
     * Temporary fallback for standalone testing.
     */
    console.log(
      "Open activity:",
      activity
    );
  }

  /*
   * Date range helpers.
   */

  function handleStartDate(event) {
    setDateRange((current) => ({
      ...current,
      start: event.target.value,
    }));
  }

  function handleEndDate(event) {
    setDateRange((current) => ({
      ...current,
      end: event.target.value,
    }));
  }

  function clearDateRange() {
    setDateRange({
      start: "",
      end: "",
    });

    setShowDatePicker(false);
  }

  function handleFilterChange(filter) {
    setActiveFilter(filter);

    /*
     * Reset pagination whenever the filter
     * changes.
     */
    setVisibleCount(5);
  }

  function loadMore() {
    setVisibleCount(
      (current) =>
        current + 5
    );
  }

  const isEmpty =
    filteredActivities.length === 0;

  return (
    <div className="activity-page">
      <main className="activity-shell">

        {/* ============================================================
            TOP NAVIGATION
        ============================================================ */}

        <nav className="activity-nav">
          <div className="activity-logo">
            Logo
          </div>

          <button
            type="button"
            className="activity-nav-link"
          >
            Dashboard
          </button>

          <button
            type="button"
            className="activity-nav-link"
          >
            My plans
          </button>

          <button
            type="button"
            className="activity-nav-link"
          >
            Bucket list
          </button>

          <button
            type="button"
            className="activity-nav-link"
          >
            Journal
          </button>

          <button
            type="button"
            className="activity-nav-link explore"
          >
            Explore <span>▾</span>
          </button>

          <div className="activity-profile" />
        </nav>

        {/* ============================================================
            BACK
        ============================================================ */}

        <button
          type="button"
          className="activity-back"
          onClick={onBack}
        >
          ← Back
        </button>

        {/* ============================================================
            PAGE HEADER
        ============================================================ */}

        <header className="activity-header">
          <h1>Activity history</h1>
        </header>

        {/* ============================================================
            FILTER BAR
        ============================================================ */}

        <div className="activity-toolbar">

          <div className="activity-filters">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`
                  activity-filter
                  ${
                    activeFilter ===
                    filter.id
                      ? "active"
                      : ""
                  }
                `}
                onClick={() =>
                  handleFilterChange(
                    filter.id
                  )
                }
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* ========================================================
              DATE RANGE
          ======================================================== */}

          <div className="date-range-wrapper">
            <button
              type="button"
              className={`
                date-range-button
                ${
                  dateRange.start ||
                  dateRange.end
                    ? "selected"
                    : ""
                }
              `}
              onClick={() =>
                setShowDatePicker(
                  (current) =>
                    !current
                )
              }
            >
              Date range
            </button>

            {showDatePicker && (
              <div className="date-range-popover">
                <div className="date-field">
                  <label htmlFor="activity-start">
                    From
                  </label>

                  <input
                    id="activity-start"
                    type="date"
                    value={
                      dateRange.start
                    }
                    onChange={
                      handleStartDate
                    }
                  />
                </div>

                <div className="date-field">
                  <label htmlFor="activity-end">
                    To
                  </label>

                  <input
                    id="activity-end"
                    type="date"
                    value={
                      dateRange.end
                    }
                    onChange={
                      handleEndDate
                    }
                  />
                </div>

                <div className="date-actions">
                  <button
                    type="button"
                    onClick={
                      clearDateRange
                    }
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    className="apply-date"
                    onClick={() =>
                      setShowDatePicker(
                        false
                      )
                    }
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================
            CONTENT
        ============================================================ */}

        {isEmpty ? (
          /*
           * =========================================================
           * EMPTY STATE
           * =========================================================
           */
          <section className="activity-empty">
            <span>
              Empty state:
            </span>{" "}
            <strong>No activity yet</strong>
          </section>
        ) : (
          <>
            {/* ======================================================
                TIMELINE
            ====================================================== */}

            <section className="activity-timeline">
              {groupedActivities.map(
                (section) => (
                  <div
                    className="activity-section"
                    key={section.group}
                  >
                    <h2>
                      {section.group}
                    </h2>

                    <div className="activity-list">
                      {section.items.map(
                        (activity) => (
                          <ActivityRow
                            key={
                              activity.id
                            }
                            activity={
                              activity
                            }
                            onView={
                              handleView
                            }
                          />
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </section>

            {/* ======================================================
                LOAD MORE
            ====================================================== */}

            {hasMore && (
              <button
                type="button"
                className="load-more-button"
                onClick={loadMore}
              >
                Load more
              </button>
            )}

            {/* ======================================================
                EMPTY AFTER FILTER
            ====================================================== */}

            {!hasMore &&
              filteredActivities.length ===
                0 && (
                <section className="activity-empty">
                  <span>
                    Empty state:
                  </span>{" "}
                  <strong>
                    No activity yet
                  </strong>
                </section>
              )}
          </>
        )}
      </main>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Activity Row
|--------------------------------------------------------------------------
*/

function ActivityRow({
  activity,
  onView,
}) {
  return (
    <article className="activity-row">

      <div
        className={`
          activity-dot
          activity-dot-${activity.type}
        `}
        aria-hidden="true"
      />

      <div className="activity-row-content">

        <div className="activity-row-title">
          {activity.title}
        </div>

        <div className="activity-row-meta">
          {activity.metadata}
        </div>
      </div>

      <button
        type="button"
        className="activity-view-button"
        onClick={() =>
          onView(activity)
        }
      >
        View
      </button>
    </article>
  );
}