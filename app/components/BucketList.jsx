"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Background } from "app/components/AuthCard";
import {
  useStoredState,
  PLANS_KEY,
  BUCKET_KEY,
  SEED_PLANS,
  todayString,
} from "app/components/usePlanStore";

/* ------------------------------------------------------------------ */
/* Sample data. Papalitan ng galing sa API/database mamaya.           */
/* ------------------------------------------------------------------ */
const initialPlaces = [
  { id: 1, name: "Kyoto", priority: "must", note: "Cherry blossom season", color: "coral" },
  { id: 2, name: "Lisbon", priority: "want", note: "Pastel de nata and tram 28", color: "lime" },
  { id: 3, name: "Banff", priority: "want", note: "Lake Louise at sunrise", color: "blue", visited: true },
  { id: 4, name: "El Nido", priority: "must", note: "Island hopping", color: "green" },
  { id: 5, name: "Seoul", priority: "someday", note: "Street food at Myeongdong", color: "green", visited: true },
  { id: 6, name: "Bali", priority: "want", note: "Rice terraces and surf", color: "coral" },
  { id: 7, name: "Santorini", priority: "someday", note: "Sunset in Oia", color: "lime", visited: true },
  { id: 8, name: "Cusco", priority: "must", note: "Hike to Machu Picchu", color: "blue" },
];

const COLOR_KEYS = ["coral", "lime", "blue", "green"];

const TILE_GRADIENTS = {
  coral: "from-rose-400 to-orange-300",
  lime: "from-yellow-300 to-emerald-300",
  blue: "from-cyan-300 to-indigo-400",
  green: "from-emerald-300 to-teal-500",
};

const PRIORITIES = {
  must: { label: "Must go", rank: 0, style: "border-rose-200/60 bg-rose-400/35 text-rose-50" },
  want: { label: "Want to go", rank: 1, style: "border-sky-200/60 bg-sky-400/35 text-sky-50" },
  someday: { label: "Someday", rank: 2, style: "border-white/40 bg-white/20 text-white" },
};

const FILTERS = [
  ["all", "All"],
  ["todo", "To do"],
  ["planned", "Planned"],
  ["visited", "Visited"],
];

const STATUS_BY_FILTER = { todo: "To do", planned: "Planned", visited: "Visited" };

const navLinks = [
  { label: "Dashboard", href: "/Main" },
  { label: "My plans", href: "/my-plans" },
  { label: "Bucket list", href: "/Bucket-list" },
  { label: "Journal", href: "/journal" },
];

const primaryBtn =
  "rounded-xl border border-teal-200/60 bg-teal-500/40 px-5 py-2.5 font-medium text-teal-50 transition hover:bg-teal-500/60";
const ghostBtn =
  "rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-white/90 transition hover:bg-white/20";
const textareaCls = "glass-input w-full resize-none rounded-xl px-4 py-3";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatLongDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Visited = minarkahan mo mismo, O na-complete na ang plan na naka-link sa place.
// Planned = may plan na naka-link na hindi pa tapos.
function getPlaceInfo(place, plans) {
  const linked = plans.filter((p) => p.bucketId === place.id);
  const done = linked.find((p) => p.status === "Completed");
  const active = linked.find((p) => p.status !== "Completed");

  if (done || (place.visited ?? place.completed)) {
    return {
      status: "Visited",
      viaPlan: Boolean(done),
      plan: done,
      visitedOn: done ? done.completedAt ?? done.endDate : place.visitedOn,
    };
  }

  if (active) return { status: "Planned", plan: active };

  return { status: "To do" };
}

function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

/* ------------------------------------------------------------------ */
/* Navbar                                                             */
/* ------------------------------------------------------------------ */
function Navbar() {
  const pathname = usePathname();

  return (
    <header className="glass mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl px-6 py-3">
      <Link href="/Main" className="text-xl font-bold tracking-tight text-white">
        PROJECT-GALA
      </Link>

      <nav className="flex items-center gap-2 text-sm">
        {navLinks.map((l) => {
          const active = pathname.startsWith(l.href);
          return (
            <Link
              key={l.label}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-xl px-4 py-2 transition ${
                active
                  ? "bg-white/15 font-medium text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        aria-label="Profile"
        className="h-9 w-9 rounded-full border border-white/40 bg-indigo-500"
      />
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                      */
/* ------------------------------------------------------------------ */
function Modal({ onClose, labelledBy, className = "max-w-md", children }) {
  useEscape(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`glass max-h-[90vh] w-full overflow-y-auto rounded-3xl ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

function PriorityPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Priority">
      {Object.entries(PRIORITIES).map(([key, p]) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={`rounded-full border px-3 py-1.5 text-sm transition ${
            value === key
              ? p.style
              : "border-white/20 bg-white/5 text-white/65 hover:bg-white/10"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ title, text, onAdd }) {
  return (
    <section className="glass flex flex-col items-center gap-3 rounded-3xl border-dashed px-6 py-12 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      {text && <p className="text-white/70">{text}</p>}
      {onAdd && (
        <button type="button" onClick={onAdd} className={`${primaryBtn} mt-2`}>
          + Add place
        </button>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Tile                                                               */
/* ------------------------------------------------------------------ */
function BucketTile({ place, info, onOpen, onToggleVisited, onPlan }) {
  const gradient = TILE_GRADIENTS[place.color] ?? TILE_GRADIENTS.green;
  const visited = info.status === "Visited";
  const priority = PRIORITIES[place.priority] ?? PRIORITIES.want;

  return (
    <article
      className={`relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} shadow-lg transition hover:-translate-y-1 ${
        visited ? "saturate-50" : ""
      }`}
    >
      {/* Buong tile clickable, nasa ilalim ng ibang buttons */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View ${place.name}`}
        className="absolute inset-0 z-0 h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
      />

      <button
        type="button"
        aria-pressed={visited}
        disabled={info.viaPlan}
        title={info.viaPlan ? "Visited na dahil completed ang trip" : undefined}
        aria-label={visited ? `Unmark ${place.name} as visited` : `Mark ${place.name} as visited`}
        onClick={onToggleVisited}
        className={`absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-lg font-bold transition ${
          visited
            ? "border-white bg-teal-500 text-white"
            : "border-white/80 bg-black/20 text-transparent hover:bg-black/40"
        }`}
      >
        ✓
      </button>

      <span
        className={`pointer-events-none absolute right-3 top-3 z-10 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md ${priority.style}`}
      >
        {priority.label}
      </span>

      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-2 rounded-2xl bg-black/40 px-4 py-2.5 backdrop-blur-md">
        <div className="min-w-0">
          <span className="block truncate font-semibold">{place.name}</span>
          {place.note && (
            <span className="block truncate text-xs text-white/65">{place.note}</span>
          )}
        </div>

        {info.status === "To do" && (
          <button
            type="button"
            onClick={onPlan}
            className="pointer-events-auto shrink-0 rounded-lg border border-teal-200/50 bg-teal-500/40 px-3 py-1 text-xs font-medium text-teal-50 transition hover:bg-teal-500/70"
          >
            Plan trip
          </button>
        )}

        {info.status === "Planned" && (
          <span className="shrink-0 rounded-lg bg-sky-400/25 px-3 py-1 text-xs font-medium text-sky-50">
            Planned
          </span>
        )}

        {info.status === "Visited" && (
          <span className="shrink-0 rounded-lg bg-emerald-400/25 px-3 py-1 text-xs font-medium text-emerald-50">
            Visited
          </span>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Place details (view + edit priority and note)                      */
/* ------------------------------------------------------------------ */
function PlaceDetails({ place, info, onClose, onUpdate, onToggleVisited, onPlan, onRemove }) {
  const gradient = TILE_GRADIENTS[place.color] ?? TILE_GRADIENTS.green;

  return (
    <Modal onClose={onClose} labelledBy="place-title" className="max-w-lg">
      <div className={`relative h-32 bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-xl transition hover:bg-black/50"
        >
          ×
        </button>
        <h2 id="place-title" className="absolute bottom-4 left-6 text-3xl font-bold">
          {place.name}
        </h2>
      </div>

      <div className="space-y-5 p-6">
        <div>
          <p className="mb-2 text-sm font-medium text-white/80">Priority</p>
          <PriorityPicker value={place.priority} onChange={(priority) => onUpdate({ priority })} />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white/80">Why do you want to go?</span>
          <textarea
            rows={3}
            value={place.note ?? ""}
            onChange={(e) => onUpdate({ note: e.target.value })}
            placeholder="e.g. Cherry blossoms, ramen, temples"
            className={textareaCls}
          />
        </label>

        {info.status === "Planned" && (
          <div className="rounded-2xl bg-sky-400/15 p-4">
            <p className="text-xs uppercase tracking-wide text-sky-100/70">Planned</p>
            <p className="mt-1 font-medium">{info.plan.title}</p>
            <p className="text-sm text-white/65">
              {formatLongDate(info.plan.startDate)} to {formatLongDate(info.plan.endDate)}
            </p>
            <Link href="/my-plans" className="mt-2 inline-block text-sm text-white/80 transition hover:text-white">
              View in My plans →
            </Link>
          </div>
        )}

        {info.status === "Visited" && (
          <div className="rounded-2xl bg-emerald-400/15 p-4 text-sm">
            <p className="font-medium text-emerald-50">
              Visited{info.visitedOn ? ` on ${formatLongDate(info.visitedOn)}` : ""}
            </p>
            {info.viaPlan && (
              <p className="mt-1 text-white/65">Automatic mula sa na-complete mong trip.</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {info.status === "To do" && (
            <button type="button" onClick={onPlan} className={`${primaryBtn} w-full`}>
              Plan this trip
            </button>
          )}

          {!info.viaPlan && (
            <button type="button" onClick={onToggleVisited} className={`${ghostBtn} w-full`}>
              {info.status === "Visited" ? "Unmark as visited" : "I've been here already"}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button type="button" onClick={onClose} className="text-sm text-white/70 transition hover:text-white">
            Close
          </button>
          <button type="button" onClick={onRemove} className="text-sm text-red-200/70 transition hover:text-red-200">
            Remove place
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Add place                                                          */
/* ------------------------------------------------------------------ */
function AddPlaceModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("want");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Where do you want to go?");
      return;
    }
    onAdd({ name: name.trim(), priority, note: note.trim() });
  }

  return (
    <Modal onClose={onClose} labelledBy="add-title">
      <form onSubmit={submit} className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs tracking-widest text-white/60">BUCKET LIST</span>
            <h2 id="add-title" className="text-2xl font-semibold">Add place</h2>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="text-2xl text-white/70 hover:text-white">
            ×
          </button>
        </div>

        {error && (
          <p className="rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2 text-sm text-red-100">{error}</p>
        )}

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white/80">Destination</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hokkaido"
            className="glass-input h-11 w-full rounded-xl px-4"
          />
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-white/80">Priority</p>
          <PriorityPicker value={priority} onChange={setPriority} />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white/80">Why do you want to go? (optional)</span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything that makes you want to go"
            className={textareaCls}
          />
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
          <button type="submit" className={primaryBtn}>Add place</button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Plan this trip                                                     */
/* ------------------------------------------------------------------ */
function PlanTripModal({ place, onClose, onCreate }) {
  const today = todayString();
  const [title, setTitle] = useState(`${place.name} trip`);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();

    if (!title.trim()) return setError("Add a trip name.");
    if (!startDate || !endDate) return setError("Pick your start and end dates.");
    if (endDate < startDate) return setError("End date can't be before the start date.");

    onCreate({
      title: title.trim(),
      startDate,
      endDate,
      budget: Number(budget) || 0,
    });
  }

  return (
    <Modal onClose={onClose} labelledBy="plan-title">
      <form onSubmit={submit} className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs tracking-widest text-white/60">NEW PLAN</span>
            <h2 id="plan-title" className="text-2xl font-semibold">Plan {place.name}</h2>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="text-2xl text-white/70 hover:text-white">
            ×
          </button>
        </div>

        {error && (
          <p className="rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2 text-sm text-red-100">{error}</p>
        )}

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white/80">Trip name</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="glass-input h-11 w-full rounded-xl px-4"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white/80">Start date</span>
            <input
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="glass-input h-11 w-full rounded-xl px-3 [color-scheme:dark]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white/80">End date</span>
            <input
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="glass-input h-11 w-full rounded-xl px-3 [color-scheme:dark]"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white/80">Budget (₱)</span>
          <input
            type="number"
            min="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="0"
            className="glass-input h-11 w-full rounded-xl px-4"
          />
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
          <button type="submit" className={primaryBtn}>Create plan</button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Delete modal                                                       */
/* ------------------------------------------------------------------ */
function DeleteConfirmation({ place, onCancel, onConfirm }) {
  return (
    <Modal onClose={onCancel} labelledBy="delete-title">
      <div className="p-6">
        <h2 id="delete-title" className="text-xl font-semibold">Remove this place?</h2>
        <p className="mt-2 text-white/80">
          Remove <strong>{place.name}</strong> from your bucket list?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" autoFocus onClick={onCancel} className={ghostBtn}>Cancel</button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl border border-red-200/60 bg-red-500/40 px-5 py-2.5 font-medium text-red-50 transition hover:bg-red-500/60"
          >
            Remove
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
export default function BucketList({
  places: seedPlaces, // optional: panimulang listahan (hal. galing DB) kung wala pang naka-save
  onToggleCompleted, // optional: (id, visited) para i-save sa DB ang pag-tick
  onRemovePlace, // optional: (id) para i-save sa DB ang pagtanggal
  onPlaceAdded, // optional: (place) para i-save sa DB ang bagong place
} = {}) {
  const router = useRouter();

  const [places, setPlaces, placesReady] = useStoredState(
    BUCKET_KEY,
    seedPlaces ?? initialPlaces
  );
  const [plans, setPlans, plansReady] = useStoredState(PLANS_KEY, SEED_PLANS);
  const ready = placesReady && plansReady;

  const [filter, setFilter] = useState("all");
  const [prioritySort, setPrioritySort] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [planTarget, setPlanTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const items = useMemo(
    () => places.map((place) => ({ place, info: getPlaceInfo(place, plans) })),
    [places, plans]
  );

  const visibleItems = useMemo(() => {
    let list = items;

    if (filter !== "all") {
      list = list.filter((item) => item.info.status === STATUS_BY_FILTER[filter]);
    }

    if (prioritySort) {
      list = [...list].sort(
        (a, b) =>
          (PRIORITIES[a.place.priority]?.rank ?? 1) - (PRIORITIES[b.place.priority]?.rank ?? 1)
      );
    }

    return list;
  }, [items, filter, prioritySort]);

  const totalCount = items.length;
  const visitedCount = items.filter((i) => i.info.status === "Visited").length;
  const plannedCount = items.filter((i) => i.info.status === "Planned").length;
  const progress = totalCount === 0 ? 0 : (visitedCount / totalCount) * 100;

  const selectedItem = items.find((i) => i.place.id === selectedId) ?? null;

  function updatePlace(id, patch) {
    setPlaces((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function toggleVisited(place) {
    const next = !(place.visited ?? place.completed);
    updatePlace(place.id, { visited: next, visitedOn: next ? todayString() : null });
    onToggleCompleted?.(place.id, next);
  }

  function addPlace(data) {
    const newPlace = {
      id: Date.now(),
      ...data,
      color: COLOR_KEYS[places.length % COLOR_KEYS.length],
      visited: false,
    };

    setPlaces((cur) => [newPlace, ...cur]);
    onPlaceAdded?.(newPlace);
    setShowAdd(false);
  }

  function removePlace() {
    if (!deleteTarget) return;
    setPlaces((cur) => cur.filter((p) => p.id !== deleteTarget.id));
    onRemovePlace?.(deleteTarget.id);
    setDeleteTarget(null);
    setSelectedId(null);
  }

  function createPlan(place, data) {
    setPlans((cur) => [
      {
        id: Date.now(),
        title: data.title,
        destination: place.name,
        startDate: data.startDate,
        endDate: data.endDate,
        spent: 0,
        budget: data.budget,
        color: TILE_GRADIENTS[place.color] ?? TILE_GRADIENTS.green,
        bucketId: place.id,
      },
      ...cur,
    ]);
    setPlanTarget(null);
    setToast(`${place.name} is now in My plans`);
  }

  function openPlan(place) {
    setSelectedId(null);
    setPlanTarget(place);
  }

  const emptyText = {
    todo: ["Nothing left to do", "Every place on your list is planned or visited."],
    planned: ["No planned trips yet", "Hit “Plan trip” on any place to start."],
    visited: ["Nothing visited yet", "Complete a trip and it shows up here automatically."],
  };

  return (
    <Background>
      <div className={`mx-auto w-full max-w-6xl px-6 py-8 ${ready ? "" : "invisible"}`}>
        <Navbar />

        {/* Header */}
        <div className="mb-8 mt-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-white/70 transition hover:text-white"
          >
            ← Back
          </button>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Bucket list</h1>
            <button type="button" onClick={() => setShowAdd(true)} className={primaryBtn}>
              + Add place
            </button>
          </div>
        </div>

        {/* Progress */}
        <section className="glass rounded-3xl p-6" aria-label="Bucket list progress">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-semibold">
              {visitedCount} of {totalCount} visited
            </span>
            <span className="text-sm text-white/65">{plannedCount} planned</span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-valuenow={visitedCount}
            aria-label={`${visitedCount} of ${totalCount} destinations visited`}
            className="mt-3 h-3 overflow-hidden rounded-full bg-white/15"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-yellow-300 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        {/* Filters + sort */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter places">
            {FILTERS.map(([value, text]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  filter === value
                    ? "border-white/60 bg-white/25 text-white"
                    : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {text}
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-pressed={prioritySort}
            onClick={() => setPrioritySort(!prioritySort)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              prioritySort
                ? "border-white/60 bg-white/25 text-white"
                : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            ↕ Priority first
          </button>
        </div>

        {/* Grid / empty states */}
        <div className="mt-6">
          {totalCount === 0 ? (
            <EmptyState title="Add your first place" onAdd={() => setShowAdd(true)} />
          ) : visibleItems.length === 0 ? (
            <EmptyState title={emptyText[filter][0]} text={emptyText[filter][1]} />
          ) : (
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visibleItems.map(({ place, info }) => (
                <BucketTile
                  key={place.id}
                  place={place}
                  info={info}
                  onOpen={() => setSelectedId(place.id)}
                  onToggleVisited={() => toggleVisited(place)}
                  onPlan={() => openPlan(place)}
                />
              ))}
            </section>
          )}
        </div>

        {selectedItem && (
          <PlaceDetails
            place={selectedItem.place}
            info={selectedItem.info}
            onClose={() => setSelectedId(null)}
            onUpdate={(patch) => updatePlace(selectedItem.place.id, patch)}
            onToggleVisited={() => toggleVisited(selectedItem.place)}
            onPlan={() => openPlan(selectedItem.place)}
            onRemove={() => setDeleteTarget(selectedItem.place)}
          />
        )}

        {showAdd && <AddPlaceModal onClose={() => setShowAdd(false)} onAdd={addPlace} />}

        {planTarget && (
          <PlanTripModal
            place={planTarget}
            onClose={() => setPlanTarget(null)}
            onCreate={(data) => createPlan(planTarget, data)}
          />
        )}

        {deleteTarget && (
          <DeleteConfirmation
            place={deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={removePlace}
          />
        )}

        {toast && (
          <div className="glass fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm">
            <span className="mr-2">✓</span>
            {toast}
            <Link href="/my-plans" className="ml-3 underline transition hover:text-white/80">
              View
            </Link>
          </div>
        )}
      </div>
    </Background>
  );
}