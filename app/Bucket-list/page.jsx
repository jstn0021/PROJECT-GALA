"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Background, Logo } from "app/components/AuthCard";

/* ------------------------------------------------------------------ */
/* Sample data. Papalitan ng galing sa API/database mamaya.           */
/* ------------------------------------------------------------------ */
const initialPlaces = [
  { id: 1, name: "Kyoto", completed: false, color: "coral" },
  { id: 2, name: "Lisbon", completed: false, color: "lime" },
  { id: 3, name: "Banff", completed: true, color: "blue" },
  { id: 4, name: "El Nido", completed: false, color: "green" },
  { id: 5, name: "Seoul", completed: true, color: "green" },
  { id: 6, name: "Bali", completed: false, color: "coral" },
  { id: 7, name: "Santorini", completed: true, color: "lime" },
  { id: 8, name: "Cusco", completed: false, color: "blue" },
];

const FILTERS = { ALL: "all", TODO: "todo", COMPLETED: "completed" };

const FILTER_LABELS = [
  [FILTERS.ALL, "All"],
  [FILTERS.TODO, "To do"],
  [FILTERS.COMPLETED, "Completed"],
];

// Gradient ng bawat tile, ayon sa `color` ng place
const TILE_GRADIENTS = {
  coral: "from-rose-400 to-orange-300",
  lime: "from-yellow-300 to-emerald-300",
  blue: "from-cyan-300 to-indigo-400",
  green: "from-emerald-300 to-teal-500",
};

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My plans", href: "/newplan" },
  { label: "Bucket list", href: "/bucket-list", active: true },
  { label: "Journal", href: "/journal" },
];

const primaryBtn =
  "rounded-xl border border-teal-200/60 bg-teal-500/40 px-5 py-2.5 font-medium text-teal-50 transition hover:bg-teal-500/60";
const ghostBtn =
  "rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-white/90 transition hover:bg-white/20";

/* ------------------------------------------------------------------ */
/* Navbar                                                             */
/* ------------------------------------------------------------------ */
function TopNav() {
  return (
    <header className="glass flex items-center justify-between rounded-2xl px-5 py-3">
      <div className="flex items-center gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              aria-current={l.active ? "page" : undefined}
              className={`rounded-xl px-3 py-1.5 text-sm transition ${
                l.active ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            className="rounded-xl px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Explore ▾
          </button>
        </nav>
      </div>
      <button
        type="button"
        aria-label="Profile"
        className="h-9 w-9 rounded-full border border-white/40 bg-indigo-500"
      />
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Tile                                                               */
/* ------------------------------------------------------------------ */
function BucketTile({ place, onToggleCompleted, onRemove, onOpen }) {
  const gradient = TILE_GRADIENTS[place.color] ?? TILE_GRADIENTS.green;

  return (
    <article
      className={`group relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} shadow-lg transition hover:-translate-y-1 ${
        place.completed ? "saturate-50" : ""
      }`}
    >
      {/* Buong tile ay clickable, nasa ilalim ng ibang buttons (walang nested button) */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View ${place.name}`}
        className="absolute inset-0 z-0 h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
      />

      <button
        type="button"
        aria-pressed={place.completed}
        aria-label={
          place.completed
            ? `Mark ${place.name} as incomplete`
            : `Mark ${place.name} as completed`
        }
        onClick={onToggleCompleted}
        className={`absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-lg font-bold transition ${
          place.completed
            ? "border-white bg-teal-500 text-white"
            : "border-white/80 bg-black/20 text-transparent hover:bg-black/40"
        }`}
      >
        ✓
      </button>

      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-2 rounded-2xl bg-black/40 px-4 py-2.5 backdrop-blur-md">
        <span className="truncate font-semibold">{place.name}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${place.name}`}
          className="pointer-events-auto rounded-lg px-2 py-1 text-sm text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          Remove
        </button>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                        */
/* ------------------------------------------------------------------ */
function EmptyState({ title, text, onAddPlace }) {
  return (
    <section className="glass flex flex-col items-center gap-3 rounded-3xl border-dashed px-6 py-12 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      {text && <p className="text-white/70">{text}</p>}
      {onAddPlace && (
        <button type="button" onClick={onAddPlace} className={`${primaryBtn} mt-2`}>
          + Add place
        </button>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Delete modal                                                       */
/* ------------------------------------------------------------------ */
function DeleteConfirmation({ place, onCancel, onConfirm }) {
  // Escape key para isara
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        className="glass w-full max-w-md rounded-3xl p-6"
      >
        <h2 id="delete-title" className="text-xl font-semibold">
          Remove this place?
        </h2>
        <p className="mt-2 text-white/80">
          Remove <strong>{place.name}</strong> from your bucket list?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" autoFocus onClick={onCancel} className={ghostBtn}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl border border-red-200/60 bg-red-500/40 px-5 py-2.5 font-medium text-red-50 transition hover:bg-red-500/60"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
export default function BucketList({
  places = initialPlaces,
  onBack,
  onAddPlace,
  onUseTemplate,
  onViewDestination,
  onPlacesChange,
}) {
  const router = useRouter();

  const [bucketPlaces, setBucketPlaces] = useState(places);
  const [activeFilter, setActiveFilter] = useState(FILTERS.ALL);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const completedCount = bucketPlaces.filter((p) => p.completed).length;
  const totalCount = bucketPlaces.length;
  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  const filteredPlaces = useMemo(() => {
    if (activeFilter === FILTERS.TODO) return bucketPlaces.filter((p) => !p.completed);
    if (activeFilter === FILTERS.COMPLETED) return bucketPlaces.filter((p) => p.completed);
    return bucketPlaces;
  }, [bucketPlaces, activeFilter]);

  function updatePlaces(next) {
    setBucketPlaces(next);
    onPlacesChange?.(next);
  }

  function toggleCompleted(id) {
    updatePlaces(bucketPlaces.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p)));
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    updatePlaces(bucketPlaces.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <Background>
      <div className="mx-auto max-w-5xl p-6 md:p-10">
        <TopNav />

        {/* Header */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : router.back())}
            className="text-white/70 transition hover:text-white"
          >
            ← Back
          </button>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Bucket list</h1>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={onUseTemplate} className={ghostBtn}>
                Use a template
              </button>
              <button type="button" onClick={onAddPlace} className={primaryBtn}>
                + Add place
              </button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <section className="glass mt-8 rounded-3xl p-6" aria-label="Bucket list progress">
          <div className="font-semibold">
            {completedCount} of {totalCount} completed
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-valuenow={completedCount}
            aria-label={`${completedCount} of ${totalCount} destinations completed`}
            className="mt-3 h-3 overflow-hidden rounded-full bg-white/15"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-yellow-300 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        {/* Filters */}
        <div className="mt-6 flex gap-2" role="group" aria-label="Filter places">
          {FILTER_LABELS.map(([value, text]) => (
            <button
              key={value}
              type="button"
              aria-pressed={activeFilter === value}
              onClick={() => setActiveFilter(value)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                activeFilter === value
                  ? "border-white/60 bg-white/25 text-white"
                  : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {text}
            </button>
          ))}
        </div>

        {/* Grid / empty states */}
        <div className="mt-6">
          {bucketPlaces.length === 0 ? (
            <EmptyState title="Add your first place" onAddPlace={onAddPlace} />
          ) : filteredPlaces.length === 0 ? (
            <EmptyState
              title={activeFilter === FILTERS.TODO ? "Nothing left to do" : "Nothing completed yet"}
              text={
                activeFilter === FILTERS.TODO
                  ? "Every place on your list is checked off."
                  : "Tick off a place once you've been there."
              }
            />
          ) : (
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredPlaces.map((place) => (
                <BucketTile
                  key={place.id}
                  place={place}
                  onToggleCompleted={() => toggleCompleted(place.id)}
                  onRemove={() => setDeleteTarget(place)}
                  onOpen={() => onViewDestination?.(place)}
                />
              ))}
            </section>
          )}
        </div>

        {deleteTarget && (
          <DeleteConfirmation
            place={deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        )}
      </div>
    </Background>
  );
}