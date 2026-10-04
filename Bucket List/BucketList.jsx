import React, { useMemo, useState } from "react";
import "./BucketList.css";

/*
|--------------------------------------------------------------------------
| Example bucket-list data
|--------------------------------------------------------------------------
|
| In your application this should normally come from shared app state,
| Context, Redux, Zustand, localStorage, or your backend.
|
*/

const initialPlaces = [
  {
    id: 1,
    name: "Kyoto",
    completed: false,
    color: "coral",
  },
  {
    id: 2,
    name: "Lisbon",
    completed: false,
    color: "lime",
  },
  {
    id: 3,
    name: "Banff",
    completed: true,
    color: "blue",
  },
  {
    id: 4,
    name: "El Nido",
    completed: false,
    color: "green",
  },
  {
    id: 5,
    name: "Seoul",
    completed: true,
    color: "green",
  },
  {
    id: 6,
    name: "Bali",
    completed: false,
    color: "coral",
  },
  {
    id: 7,
    name: "Santorini",
    completed: true,
    color: "lime",
  },
  {
    id: 8,
    name: "Cusco",
    completed: false,
    color: "blue",
  },
];

const FILTERS = {
  ALL: "all",
  TODO: "todo",
  COMPLETED: "completed",
};

export default function BucketList({
  places = initialPlaces,

  /*
   * Navigation callbacks supplied by the parent application.
   */
  onBack,
  onAddPlace,
  onUseTemplate,
  onViewDestination,

  /*
   * Optional callback for persisting the bucket list.
   */
  onPlacesChange,
}) {
  const [bucketPlaces, setBucketPlaces] =
    useState(places);

  const [activeFilter, setActiveFilter] =
    useState(FILTERS.ALL);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Progress
  |--------------------------------------------------------------------------
  */

  const completedCount = bucketPlaces.filter(
    (place) => place.completed
  ).length;

  const totalCount = bucketPlaces.length;

  const progressPercentage =
    totalCount === 0
      ? 0
      : (completedCount / totalCount) * 100;

  /*
  |--------------------------------------------------------------------------
  | Filtering
  |--------------------------------------------------------------------------
  */

  const filteredPlaces = useMemo(() => {
    switch (activeFilter) {
      case FILTERS.TODO:
        return bucketPlaces.filter(
          (place) => !place.completed
        );

      case FILTERS.COMPLETED:
        return bucketPlaces.filter(
          (place) => place.completed
        );

      case FILTERS.ALL:
      default:
        return bucketPlaces;
    }
  }, [bucketPlaces, activeFilter]);

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  function updatePlaces(nextPlaces) {
    setBucketPlaces(nextPlaces);

    if (onPlacesChange) {
      onPlacesChange(nextPlaces);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Complete / uncomplete
  |--------------------------------------------------------------------------
  */

  function toggleCompleted(placeId) {
    const nextPlaces = bucketPlaces.map(
      (place) =>
        place.id === placeId
          ? {
              ...place,
              completed: !place.completed,
            }
          : place
    );

    updatePlaces(nextPlaces);
  }

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  function requestRemove(place) {
    setDeleteTarget(place);
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    const nextPlaces =
      bucketPlaces.filter(
        (place) =>
          place.id !== deleteTarget.id
      );

    updatePlaces(nextPlaces);

    setDeleteTarget(null);
  }

  /*
  |--------------------------------------------------------------------------
  | Destination tile click
  |--------------------------------------------------------------------------
  */

  function handleDestinationClick(place) {
    if (onViewDestination) {
      onViewDestination(place);
    }
  }

  return (
    <div className="bucket-page">
      <main className="bucket-shell">
        {/* ============================================================
            TOP NAV
        ============================================================ */}

        <nav className="bucket-nav">
          <div className="bucket-logo">
            Logo
          </div>

          <button className="nav-item">
            Dashboard
          </button>

          <button className="nav-item">
            My plans
          </button>

          <button className="nav-item active">
            Bucket list
          </button>

          <button className="nav-item">
            Journal
          </button>

          <button className="nav-item explore">
            Explore
            <span>▾</span>
          </button>

          <div className="profile-button" />
        </nav>

        {/* ============================================================
            HEADER
        ============================================================ */}

        <header className="bucket-header">
          <button
            type="button"
            className="back-button"
            onClick={onBack}
          >
            ← Back
          </button>

          <div className="bucket-title-row">
            <h1>Bucket list</h1>

            <div className="bucket-header-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={onUseTemplate}
              >
                Use a template
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={onAddPlace}
              >
                + Add place
              </button>
            </div>
          </div>
        </header>

        {/* ============================================================
            PROGRESS CARD
        ============================================================ */}

        <section className="bucket-progress">
          <div className="progress-title">
            {completedCount} of {totalCount}{" "}
            completed
          </div>

          <div
            className="progress-track"
            aria-label={`${completedCount} of ${totalCount} destinations completed`}
          >
            <div
              className="progress-fill"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        </section>

        {/* ============================================================
            FILTERS
        ============================================================ */}

        <div className="bucket-filters">
          <button
            type="button"
            className={
              activeFilter === FILTERS.ALL
                ? "filter-button selected"
                : "filter-button"
            }
            onClick={() =>
              setActiveFilter(FILTERS.ALL)
            }
          >
            All
          </button>

          <button
            type="button"
            className={
              activeFilter === FILTERS.TODO
                ? "filter-button selected"
                : "filter-button"
            }
            onClick={() =>
              setActiveFilter(FILTERS.TODO)
            }
          >
            To do
          </button>

          <button
            type="button"
            className={
              activeFilter === FILTERS.COMPLETED
                ? "filter-button selected"
                : "filter-button"
            }
            onClick={() =>
              setActiveFilter(
                FILTERS.COMPLETED
              )
            }
          >
            Completed
          </button>
        </div>

        {/* ============================================================
            DESTINATION GRID
        ============================================================ */}

        {filteredPlaces.length > 0 ? (
          <section className="bucket-grid">
            {filteredPlaces.map((place) => (
              <BucketTile
                key={place.id}
                place={place}
                onToggleCompleted={() =>
                  toggleCompleted(place.id)
                }
                onRemove={() =>
                  requestRemove(place)
                }
                onOpen={() =>
                  handleDestinationClick(
                    place
                  )
                }
              />
            ))}
          </section>
        ) : (
          <EmptyBucketState
            onAddPlace={onAddPlace}
          />
        )}

        {/* ============================================================
            GLOBAL EMPTY STATE
        ============================================================ */}

        {bucketPlaces.length === 0 && (
          <EmptyBucketState
            onAddPlace={onAddPlace}
          />
        )}

        {/* ============================================================
            DELETE MODAL
        ============================================================ */}

        {deleteTarget && (
          <DeleteConfirmation
            place={deleteTarget}
            onCancel={cancelDelete}
            onConfirm={confirmDelete}
          />
        )}
      </main>
    </div>
  );
}

/* ==========================================================================
   BUCKET TILE
============================================================================= */

function BucketTile({
  place,
  onToggleCompleted,
  onRemove,
  onOpen,
}) {
  return (
    <article
      className={`bucket-tile tile-${place.color}`}
      onClick={onOpen}
    >
      {/* Completion circle */}

      <button
        type="button"
        className={
          place.completed
            ? "completion-circle completed"
            : "completion-circle"
        }
        aria-label={
          place.completed
            ? `Mark ${place.name} as incomplete`
            : `Mark ${place.name} as completed`
        }
        onClick={(event) => {
          event.stopPropagation();
          onToggleCompleted();
        }}
      >
        {place.completed && "✓"}
      </button>

      {/* Tile footer */}

      <div className="tile-footer">
        <span className="tile-name">
          {place.name}
        </span>

        <button
          type="button"
          className="remove-button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          Remove
        </button>
      </div>
    </article>
  );
}

/* ==========================================================================
   EMPTY STATE
============================================================================= */

function EmptyBucketState({
  onAddPlace,
}) {
  return (
    <section className="bucket-empty">
      <span>Empty state:</span>{" "}
      <strong>Add your first place</strong>

      <button
        type="button"
        onClick={onAddPlace}
      >
        + Add place
      </button>
    </section>
  );
}

/* ==========================================================================
   DELETE CONFIRMATION
============================================================================= */

function DeleteConfirmation({
  place,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className="delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
      >
        <h2 id="delete-title">
          Remove this place?
        </h2>

        <p>
          Remove{" "}
          <strong>{place.name}</strong>{" "}
          from your bucket list?
        </p>

        <div className="delete-actions">
          <button
            type="button"
            className="modal-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="modal-delete"
            onClick={onConfirm}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}