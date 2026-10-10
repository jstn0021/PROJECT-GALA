"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { useEffect, useState } from "react";

const peso = (n) => `₱${Number(n || 0).toLocaleString("en-PH")}`;
function timeAgo(date) {
  if (!date) return "";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  );

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function Card({ title, icon, action, onAction, children, className = "" }) {
  return (
    <div className={`glass-dark flex flex-col rounded-3xl p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-3 text-lg font-semibold">
          <span className="text-xl">{icon}</span>
          {title}
        </h2>
        {action && (
          <button
            onClick={onAction}
            className="text-sm text-indigo-200 hover:text-white"
          >
            {action} →
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Bar({ percent }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/15">
      <div
        className="h-full rounded-full bg-linear-to-r from-violet-400 via-blue-400 to-cyan-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function Ring({ percent, children }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#5eead4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

export default function DashboardClient({ name }) {
  const router = useRouter();
  const go = (p) => router.push(p);

  const [dashboard, setDashboard] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error?.message || "Failed to load dashboard."
          );
        }

        if (!cancelled) {
          setDashboard(result.data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const nextTrip = dashboard?.nextTrip ?? null;

  const budgetItems = (nextTrip?.budgetItems ?? []).map((item, index) => ({
    ...item,
    dot: [
      "bg-violet-400",
      "bg-blue-400",
      "bg-orange-400",
      "bg-fuchsia-400",
      "bg-cyan-400",
    ][index % 5],
  }));

  const budgetPercent = Math.min(
    100,
    Math.max(0, nextTrip?.budgetPercent ?? 0)
  );

  // Saved / Featured Destinations Sliding Logic
  const saved = dashboard?.savedDestinations ?? [];
  const featured = dashboard?.featuredPlaces ?? [];
  const hasSaved = saved.length > 0;
  const displayedPlaces = hasSaved ? saved : featured;
  const totalPlaces = displayedPlaces.length;

  useEffect(() => {
    if (totalPlaces <= 3) return;

    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % totalPlaces);
    }, 4000);

    return () => clearInterval(interval);
  }, [totalPlaces]);

  const visiblePlaces =
    totalPlaces <= 3
      ? displayedPlaces
      : [
        displayedPlaces[startIndex % totalPlaces],
        displayedPlaces[(startIndex + 1) % totalPlaces],
        displayedPlaces[(startIndex + 2) % totalPlaces],
      ];

  function nextPlaces() {
    if (totalPlaces <= 3) return;
    setStartIndex((prev) => (prev + 1) % totalPlaces);
  }

  function previousPlaces() {
    if (totalPlaces <= 3) return;
    setStartIndex((prev) => (prev - 1 + totalPlaces) % totalPlaces);
  }

  // Bucket List Progress Data mula sa DB
  const activities = dashboard?.recentActivity ?? [];
  const bucketDone = dashboard?.bucketList?.done ?? 0;
  const bucketTotal = dashboard?.bucketList?.total ?? 0;
  const bucketPercent =
    bucketTotal > 0 ? Math.round((bucketDone / bucketTotal) * 100) : 0;

  return (
    <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 md:px-8 md:py-6 xl:px-12">
      {/* NAV */}
      <Navbar />

      {/* WELCOME */}
      <section className="glass-dark flex flex-wrap items-center justify-between gap-4 rounded-3xl px-6 py-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-indigo-300">{name}!</span>
          </h1>
          <p className="mt-1 text-sky-300">Ready for your next adventure?</p>
        </div>
        <button
          onClick={() => go("/newplan")}
          className="rounded-full bg-linear-to-r from-indigo-500 to-violet-500 px-6 py-3 font-semibold shadow-[0_0_24px_rgba(99,102,241,0.6)] transition hover:scale-105 active:scale-95"
        >
          + New Plan
        </button>
      </section>

      {/* HERO: NEXT TRIP */}
      {loading ? (
        <section className="glass-dark rounded-3xl p-8">
          Loading your next trip...
        </section>
      ) : error ? (
        <section className="glass-dark rounded-3xl p-8 text-red-200">
          {error}
        </section>
      ) : nextTrip ? (
        <section
          className="glass-dark relative overflow-hidden rounded-3xl"
          style={{
            backgroundImage: nextTrip.image
              ? `linear-gradient(90deg, rgba(12,18,70,0.65), rgba(12,18,70,0.25)), url("${nextTrip.image}")`
              : "linear-gradient(120deg, #172554, #312e81, #134e4a)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex min-h-72 flex-col justify-between gap-6 p-6 md:p-8">
            <div>
              <p className="text-sm font-semibold tracking-wider text-indigo-200">
                📍 YOUR NEXT TRIP
              </p>
              <h2 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
                {nextTrip.title}
              </h2>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
                <span>📅 {nextTrip.dates}</span>
                <span>📌 {nextTrip.destinations} destinations</span>
                <span>🕒 {nextTrip.daysToGo} days to go</span>
              </div>
              <button
                onClick={() => go(`/my-plans?trip=${nextTrip.id}`)}
                className="glass-dark mt-5 rounded-full px-6 py-2.5 text-sm font-semibold transition hover:bg-white/10"
              >
                View Trip →
              </button>
            </div>

            <div className="max-w-xl">
              <div className="text-sm text-white/80">👛 Budget Progress</div>
              <div className="mt-1 text-xl font-semibold">
                {peso(nextTrip.spent)}{" "}
                <span className="text-white/60">/ {peso(nextTrip.budget)}</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1">
                  <Bar percent={budgetPercent} />
                </div>
                <span className="text-sm">{budgetPercent}%</span>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="glass-dark rounded-3xl p-8">
          <h2 className="text-2xl font-bold">No upcoming trips yet</h2>
          <p className="mt-2 text-white/65">
            Create a new plan to start your next adventure.
          </p>
        </section>
      )}

      {/* 4 CARDS */}
      <section className="grid flex-1 gap-5 md:grid-cols-2 xl:grid-cols-[1.1fr_1.2fr_0.9fr_1fr]">

        {/* CARD 1: SAVED DESTINATIONS */}
        <Card
          title={hasSaved ? "Saved Destinations" : "Featured Places"}
          icon={hasSaved ? "❤️" : "🌍"}
          action={hasSaved ? "View all" : "Explore more"}
          onAction={() => go(hasSaved ? "/bucket-list" : "/explore")}
        >
          <div className="grid flex-1 grid-cols-3 gap-3">
            {visiblePlaces.map((d, index) => (
              <button
                key={`${d.id}-${index}`}
                onClick={() => setSelectedDestination(d)}
                className="group relative min-h-48 overflow-hidden rounded-2xl border border-white/25 text-left transition duration-500"
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${d.color || "from-cyan-400 to-indigo-600"
                    } transition duration-300 group-hover:scale-110`}
                  style={
                    d.image
                      ? {
                        backgroundImage: `url("${d.image}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                      : undefined
                  }
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-2.5">
                  <div className="text-sm font-semibold">{d.name}</div>
                  <div className="text-[11px] text-white/75">
                    {d.region || d.location || ""}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {totalPlaces > 3 && (
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={previousPlaces}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition active:scale-95"
                aria-label="Previous destination"
              >
                ← Prev
              </button>

              <span className="text-xs text-white/60">
                {startIndex + 1} of {totalPlaces}
              </span>

              <button
                type="button"
                onClick={nextPlaces}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition active:scale-95"
                aria-label="Next destination"
              >
                Next →
              </button>
            </div>
          )}
        </Card>

        {/* CARD 2: TRIP BUDGET PLANNER */}
        <Card title="Trip Budget Planner" icon="👛">
          <p className="-mt-3 mb-3 text-sm text-white/65">
            {nextTrip?.title || "No trip selected"}
          </p>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <div className="text-sm text-white/75">Total Budget</div>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-3xl font-bold">
                {peso(nextTrip?.budget ?? 0)}
              </span>
              <span className="rounded-full bg-indigo-500/40 px-3 py-0.5 text-xs">
                Planned
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <Bar percent={budgetPercent} />
              </div>
              <span className="text-sm">{budgetPercent}%</span>
            </div>

            <ul className="mt-4 divide-y divide-white/10 text-sm">
              {budgetItems.map((b) => {
                const totalBudget = nextTrip?.budget ?? 0;
                const itemPercent =
                  totalBudget > 0
                    ? Math.round((b.amount / totalBudget) * 100)
                    : 0;

                return (
                  <li key={b.label} className="flex items-center gap-3 py-2">
                    <span className={`h-3 w-3 rounded-full ${b.dot}`} />
                    <span className="flex-1">{b.label}</span>
                    <span className="w-16 text-right">{peso(b.amount)}</span>
                    <span className="w-10 text-right text-white/60">
                      {itemPercent}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>

        {/* CARD 3: BUCKET LIST PROGRESS */}
        <Card title="Bucket List Progress" icon="🔖">
          <Ring percent={bucketPercent}>
            <div className="text-2xl font-bold">
              {bucketDone}{" "}
              <span className="text-base font-normal text-white/70">
                of {bucketTotal}
              </span>
            </div>
            <div className="text-[11px] text-white/65">
              destinations completed
            </div>
          </Ring>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1">
              <Bar percent={bucketPercent} />
            </div>
            <span className="text-sm">{bucketPercent}%</span>
          </div>
        </Card>

        {/* CARD 4: RECENT ACTIVITY */}
        <Card title="Recent Activity" icon="🕒">
          <ul className="flex flex-col divide-y divide-white/10">
            {activities.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-lg">
                  {a.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{a.title}</div>
                  <div className="truncate text-xs text-white/60">{a.sub}</div>
                </div>
                <span className="shrink-0 text-xs text-white/55">
                  {timeAgo(a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {selectedDestination && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedDestination(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="destination-modal-title"
            className="glass-dark max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/20 shadow-2xl"
          >
            {/* Destination image */}
            <div
              className="relative h-64 bg-cover bg-center"
              style={{
                backgroundImage: selectedDestination.image
                  ? `url("${selectedDestination.image}")`
                  : "linear-gradient(135deg, #1d4ed8, #6d28d9)",
              }}
            >
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedDestination(null)}
                aria-label="Close destination details"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-xl text-white transition hover:bg-black/70"
              >
                ×
              </button>

              <div className="absolute bottom-5 left-6 right-6">
                <h2
                  id="destination-modal-title"
                  className="text-3xl font-bold text-white"
                >
                  {selectedDestination.name}
                </h2>
              </div>
            </div>

            {/* Destination details */}
            <div className="space-y-4 p-6">
              <p className="flex items-center gap-2 text-sm text-indigo-200">
                📍 {selectedDestination.region ||
                  selectedDestination.location ||
                  "Philippines"}
              </p>

              <p className="text-sm leading-relaxed text-white/75">
                {selectedDestination.description ||
                  "Explore this destination and discover your next adventure."}
              </p>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedDestination(null)}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}