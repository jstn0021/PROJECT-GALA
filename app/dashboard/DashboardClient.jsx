"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { useEffect, useState } from "react";
import { PANEL, CARD_HOVER, Icon } from "@/app/components/ui";

const peso = (n) => `₱${Number(n || 0).toLocaleString("en-PH")}`;
function timeAgo(date) {
  if (!date) return "";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 1000),
  );

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/* ---------- STATIC DEFAULTS ----------
   Ito lang ang ipinapakita habang wala pang plan ang user.
   Kapag may data na galing sa /api/dashboard, napapalitan lahat. */
const DEFAULT_TRIP = {
  id: null,
  title: "Baguio Weekend Getaway",
  dates: "Dec 12 – Dec 15, 2026",
  destinations: 3,
  daysToGo: 12,
  budget: 10000,
  spent: 6250,
  budgetPercent: 62,
  image: "/baguio.jpg",
  budgetItems: [
    { label: "Transportation", amount: 2000 },
    { label: "Accommodation", amount: 4000 },
    { label: "Food", amount: 2000 },
    { label: "Activities", amount: 1000 },
    { label: "Others", amount: 500 },
  ],
};

// May image path ang bawat isa. Kapag wala pang file sa /public,
// gradient `color` ang lalabas bilang fallback.
const DEFAULT_SAVED = [
  {
    id: "default-1",
    name: "El Nido",
    region: "Palawan",
    image: "/el-nido.jpg",
    color: "from-emerald-300 to-teal-500",
    bookmarked: false,
  },
  {
    id: "default-2",
    name: "Siargao",
    region: "Surigao del Norte",
    image: "/siargao.jpg",
    color: "from-cyan-300 to-blue-500",
    bookmarked: false,
  },
  {
    id: "default-3",
    name: "Baguio",
    region: "Benguet",
    image: "/baguio.jpg",
    color: "from-lime-300 to-emerald-600",
    bookmarked: true,
  },
];

// `icon` ay pangalan ng icon sa ui.jsx
const DEFAULT_ACTIVITIES = [
  {
    id: "default-1",
    icon: "plane",
    title: "Created a new trip plan",
    sub: "Baguio Weekend Getaway",
    time: "2h ago",
  },
  {
    id: "default-2",
    icon: "bookmark",
    title: "Added destination to bucket list",
    sub: "Siargao",
    time: "5h ago",
  },
  {
    id: "default-3",
    icon: "wallet",
    title: "Updated trip budget",
    sub: "Baguio Weekend Getaway",
    time: "1d ago",
  },
  {
    id: "default-4",
    icon: "eye",
    title: "Viewed a destination",
    sub: "El Nido",
    time: "1d ago",
  },
];

// Ang /api/dashboard ay maaaring magpadala pa rin ng emoji sa `icon`.
// Dito namamapa ang mga iyon sa SVG icon. Kapag hindi kilala, clock ang lalabas.
const ACTIVITY_ICON_MAP = {
  "✈️": "plane",
  "✈": "plane",
  "🔖": "bookmark",
  "👛": "wallet",
  "👁️": "eye",
  "👁": "eye",
};

const DEFAULT_BUCKET = { done: 3, total: 10 };

/* ---------- DESIGN TOKENS ---------- */
// Static background sa ilalim ng Bucket List Progress card.
// Palitan ang path para sa ibang image; kapag null, ang naka-code na mountain backdrop ang lalabas.
const BUCKET_BG = "/baguio.jpg";

function MountainBackdrop() {
  return (
    <svg
      viewBox="0 0 300 160"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="bucketSun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f9a8d4" stopOpacity="0.75" />
          <stop offset="1" stopColor="#f9a8d4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bucketSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6366f1" stopOpacity="0" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect width="300" height="160" fill="url(#bucketSky)" />
      <circle cx="215" cy="98" r="46" fill="url(#bucketSun)" />
      <path
        d="M0 110 L40 85 L70 100 L110 70 L150 98 L190 75 L240 105 L300 80 L300 160 L0 160Z"
        fill="#7c6be0"
        opacity="0.55"
      />
      <path
        d="M0 130 L50 105 L90 125 L140 95 L190 125 L235 108 L300 128 L300 160 L0 160Z"
        fill="#4c3fb8"
        opacity="0.8"
      />
      <path
        d="M0 148 L60 128 L110 145 L170 125 L230 146 L300 132 L300 160 L0 160Z"
        fill="#262280"
        opacity="0.95"
      />
    </svg>
  );
}

function Card({
  title,
  subtitle,
  icon,
  boxedIcon = false,
  divider = false,
  glow = "from-violet-500/25",
  backdrop = null,
  action,
  onAction,
  children,
  className = "",
}) {
  return (
    <div
      className={`${PANEL} ${CARD_HOVER} relative flex flex-col overflow-hidden p-5 ${className}`}
    >
      {/* corner glow */}
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-tr ${glow} via-transparent to-transparent`}
      />
      {backdrop}

      <div className="relative z-10 flex flex-1 flex-col">
        <div
          className={`mb-4 flex items-center justify-between ${
            divider ? "border-b border-white/10 pb-4" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            {boxedIcon ? (
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-300/50 bg-indigo-500/20 text-indigo-200 shadow-[0_0_16px_rgba(129,140,248,0.55)]">
                {icon}
              </span>
            ) : (
              <span className="text-indigo-300 drop-shadow-[0_0_8px_rgba(129,140,248,0.9)]">
                {icon}
              </span>
            )}
            <div>
              <h2 className="text-lg font-semibold leading-tight text-white">
                {title}
              </h2>
              {subtitle && <p className="text-sm text-white/65">{subtitle}</p>}
            </div>
          </div>
          {action && (
            <button
              onClick={onAction}
              className="flex items-center gap-1 text-sm text-sky-300 transition hover:text-white"
            >
              {action}
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

function Bar({ percent }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-linear-to-r from-violet-400 via-blue-400 to-teal-300 shadow-[0_0_12px_rgba(94,234,212,0.6)]"
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
          stroke="rgba(99,102,241,0.3)"
          strokeWidth="6"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ filter: "drop-shadow(0 0 6px rgba(94,234,212,0.8))" }}
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
          throw new Error(result.error?.message || "Failed to load dashboard.");
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

  // Demo mode: tapos na mag-load, walang error, at wala pang plan ang user
  const realTrip = dashboard?.nextTrip ?? null;
  const isDemo = !loading && !error && !realTrip;
  const nextTrip = realTrip ?? (isDemo ? DEFAULT_TRIP : null);

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
    Math.max(0, nextTrip?.budgetPercent ?? 0),
  );

  // Saved / Featured Destinations Sliding Logic
  const saved = dashboard?.savedDestinations ?? [];
  const featured = dashboard?.featuredPlaces ?? [];
  const hasSaved = saved.length > 0;
  const showingFeatured = !hasSaved && featured.length > 0;
  const showingDefaultSaved = !hasSaved && !showingFeatured && isDemo;
  const displayedPlaces = hasSaved
    ? saved
    : showingFeatured
      ? featured
      : showingDefaultSaved
        ? DEFAULT_SAVED
        : [];
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

  // Recent Activity + Bucket List Progress (DB, may static fallback sa demo mode)
  const realActivities = dashboard?.recentActivity ?? [];
  const activities =
    realActivities.length === 0 && isDemo ? DEFAULT_ACTIVITIES : realActivities;

  const realBucketTotal = dashboard?.bucketList?.total ?? 0;
  const useDefaultBucket = isDemo && realBucketTotal === 0;
  const bucketDone = useDefaultBucket
    ? DEFAULT_BUCKET.done
    : (dashboard?.bucketList?.done ?? 0);
  const bucketTotal = useDefaultBucket ? DEFAULT_BUCKET.total : realBucketTotal;
  const bucketPercent =
    bucketTotal > 0 ? Math.round((bucketDone / bucketTotal) * 100) : 0;

  return (
    <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 text-white md:px-8 md:py-6 xl:px-12">
      {/* NAV */}
      <Navbar />

      {/* MAIN FRAME */}
      <div className="flex flex-col gap-5 rounded-[2rem] border border-indigo-400/30 bg-linear-to-br from-[#1b1f72]/45 via-[#10175a]/45 to-[#0b2f4d]/40 p-4 shadow-[0_0_40px_rgba(99,102,241,0.25)] backdrop-blur-xl md:p-6">
        {/* WELCOME */}
        <section className="flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-4">
            <span className="text-violet-300 drop-shadow-[0_0_12px_rgba(167,139,250,0.8)]">
              <Icon name="mountain" className="h-12 w-12" />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back,{" "}
                <span className="bg-linear-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                  {name}!
                </span>
              </h1>
              <p className="mt-0.5 text-sky-300">
                Ready for your next adventure?
              </p>
            </div>
          </div>
          <button
            onClick={() => go("/newplan")}
            className="flex items-center gap-2 rounded-full border border-indigo-300/60 bg-linear-to-r from-indigo-500 to-violet-500 px-7 py-3 font-semibold shadow-[0_0_26px_rgba(99,102,241,0.65)] transition hover:scale-105 active:scale-95"
          >
            <Icon name="plus" className="h-5 w-5" /> New Plan
          </button>
        </section>

        {/* HERO: NEXT TRIP */}
        {loading ? (
          <section className={`${PANEL} p-8`}>
            Loading your next trip...
          </section>
        ) : error ? (
          <section className={`${PANEL} p-8 text-red-200`}>{error}</section>
        ) : nextTrip ? (
          <section
            className="relative overflow-hidden rounded-3xl border border-sky-400/60 shadow-[0_0_30px_rgba(56,189,248,0.4),0_0_60px_rgba(99,102,241,0.3)]"
            style={{
              backgroundImage: nextTrip.image
                ? `linear-gradient(90deg, rgba(14,20,92,0.95) 0%, rgba(14,20,92,0.75) 30%, rgba(14,20,92,0.1) 65%, rgba(14,20,92,0) 100%), url("${nextTrip.image}")`
                : "linear-gradient(120deg, #172554, #312e81, #134e4a)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="flex min-h-72 flex-col justify-between gap-6 p-6 md:p-8">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold tracking-wider text-indigo-200">
                  <Icon name="pin" className="h-5 w-5" />
                  YOUR NEXT TRIP
                  {isDemo && (
                    <span className="rounded-full border border-indigo-300/40 bg-indigo-500/30 px-2.5 py-0.5 text-[10px] font-medium tracking-normal text-indigo-100">
                      Sample trip
                    </span>
                  )}
                </p>
                <h2 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
                  {nextTrip.title}
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
                  <span className="flex items-center gap-2">
                    <Icon name="calendar" className="h-5 w-5 text-indigo-200" />
                    {nextTrip.dates}
                  </span>
                  <span className="hidden h-5 w-px bg-white/25 sm:block" />
                  <span className="flex items-center gap-2">
                    <Icon name="pin" className="h-5 w-5 text-indigo-200" />
                    {nextTrip.destinations} destinations
                  </span>
                  <span className="hidden h-5 w-px bg-white/25 sm:block" />
                  <span className="flex items-center gap-2">
                    <Icon name="clock" className="h-5 w-5 text-indigo-200" />
                    {nextTrip.daysToGo} days to go
                  </span>
                </div>
                <button
                  onClick={() =>
                    go(isDemo ? "/newplan" : `/my-plans?trip=${nextTrip.id}`)
                  }
                  className="mt-5 flex items-center gap-2 rounded-full border border-indigo-300/70 bg-indigo-900/40 px-6 py-2.5 text-sm font-semibold shadow-[0_0_16px_rgba(99,102,241,0.45)] backdrop-blur transition hover:bg-indigo-700/50"
                >
                  {isDemo ? "Plan your first trip" : "View Trip"}
                  <Icon name="arrow" className="h-4 w-4" />
                </button>
              </div>

              <div className="flex max-w-xl items-start gap-3 border-t border-white/10 pt-4">
                <Icon
                  name="wallet"
                  className="mt-0.5 h-6 w-6 text-indigo-200"
                />
                <div className="flex-1">
                  <div className="text-sm text-white/80">Budget Progress</div>
                  <div className="mt-0.5 text-lg font-semibold">
                    {peso(nextTrip.spent)}{" "}
                    <span className="text-white/60">
                      / {peso(nextTrip.budget)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1">
                      <Bar percent={budgetPercent} />
                    </div>
                    <span className="text-sm text-white/80">
                      {budgetPercent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* 4 CARDS */}
        <section className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.1fr_1.2fr_0.9fr_1fr]">
          {/* CARD 1: SAVED DESTINATIONS */}
          <Card
            title={showingFeatured ? "Featured Places" : "Saved Destinations"}
            icon={<Icon name="pin" className="h-6 w-6" />}
            glow="from-violet-500/35"
            action={showingFeatured ? "Explore more" : "View all"}
            onAction={() => go(showingFeatured ? "/explore" : "/bucket-list")}
          >
            <div className="grid flex-1 grid-cols-3 gap-3">
              {visiblePlaces.map((d, index) => (
                <button
                  key={`${d.id}-${index}`}
                  onClick={() => setSelectedDestination(d)}
                  className="group relative min-h-64 overflow-hidden rounded-3xl border border-sky-300/50 text-left shadow-[0_0_16px_rgba(56,189,248,0.35)] transition duration-500 hover:shadow-[0_0_28px_rgba(56,189,248,0.65)]"
                >
                  {/* gradient fallback (lalabas kapag walang image / hindi nag-load) */}
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${
                      d.color || "from-cyan-400 to-indigo-600"
                    } transition duration-300 group-hover:scale-110`}
                  />
                  {d.image && (
                    <div
                      className="absolute inset-0 transition duration-300 group-hover:scale-110"
                      style={{
                        backgroundImage: `url("${d.image}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#0b1040]/90 via-[#0b1040]/50 to-transparent p-3 pt-10">
                    <div className="flex items-center justify-between gap-1">
                      <div className="truncate text-sm font-semibold">
                        {d.name}
                      </div>
                      <Icon
                        name="bookmark"
                        filled={d.bookmarked ?? hasSaved}
                        className={`h-4 w-4 shrink-0 ${
                          (d.bookmarked ?? hasSaved)
                            ? "text-teal-300 drop-shadow-[0_0_6px_rgba(94,234,212,0.9)]"
                            : "text-violet-300"
                        }`}
                      />
                    </div>
                    <div className="truncate text-[11px] text-white/80">
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
                  className="flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-indigo-500/15 px-4 py-2 text-sm text-white transition hover:bg-indigo-500/30 hover:shadow-[0_0_14px_rgba(56,189,248,0.4)] active:scale-95"
                  aria-label="Previous destination"
                >
                  <Icon name="arrowLeft" className="h-3.5 w-3.5" />
                  Prev
                </button>

                <span className="text-xs text-white/60">
                  {startIndex + 1} of {totalPlaces}
                </span>

                <button
                  type="button"
                  onClick={nextPlaces}
                  className="flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-indigo-500/15 px-4 py-2 text-sm text-white transition hover:bg-indigo-500/30 hover:shadow-[0_0_14px_rgba(56,189,248,0.4)] active:scale-95"
                  aria-label="Next destination"
                >
                  Next
                  <Icon name="arrow" className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </Card>

          {/* CARD 2: TRIP BUDGET PLANNER */}
          <Card
            title="Trip Budget Planner"
            subtitle={nextTrip?.title || "No trip selected"}
            icon={<Icon name="wallet" className="h-6 w-6" />}
            boxedIcon
            glow="from-indigo-500/20"
          >
            <div className="rounded-2xl border border-sky-300/25 bg-[#0a1047]/60 p-4 shadow-[inset_0_0_20px_rgba(99,102,241,0.14)]">
              <div className="text-sm text-white/75">Total Budget</div>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-3xl font-bold">
                  {peso(nextTrip?.budget ?? 0)}
                </span>
                <span className="rounded-full border border-sky-300/40 bg-[#1b2a7a]/80 px-3 py-0.5 text-xs shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                  Planned
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <Bar percent={budgetPercent} />
                </div>
                <span className="text-sm text-white/80">{budgetPercent}%</span>
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
                      <span className={`h-3.5 w-3.5 rounded-full ${b.dot}`} />
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
          <Card
            title="Bucket List Progress"
            icon={<Icon name="bookmark" className="h-6 w-6" />}
            divider
            glow="from-violet-500/20"
            backdrop={
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to top, black 45%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to top, black 45%, transparent 100%)",
                }}
              >
                {BUCKET_BG ? (
                  <div
                    className="h-full w-full opacity-80"
                    style={{
                      backgroundImage: `url("${BUCKET_BG}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center bottom",
                    }}
                  />
                ) : (
                  <MountainBackdrop />
                )}
              </div>
            }
          >
            <div className="py-2">
              <Ring percent={bucketPercent}>
                <span className="mb-0.5 text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.9)]">
                  <Icon name="mountain" className="h-6 w-6" />
                </span>
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
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1">
                <Bar percent={bucketPercent} />
              </div>
              <span className="text-sm text-white/80">{bucketPercent}%</span>
            </div>
            <button
              onClick={() => go("/bucket-list")}
              className="mx-auto mt-5 flex items-center gap-2 rounded-full border border-violet-300/60 bg-linear-to-r from-violet-500/80 to-indigo-500/80 px-5 py-2 text-sm font-medium shadow-[0_0_18px_rgba(139,92,246,0.7)] transition hover:scale-105 hover:shadow-[0_0_26px_rgba(139,92,246,0.9)] active:scale-95"
            >
              View Bucket List
              <Icon name="arrow" className="h-4 w-4" />
            </button>
          </Card>

          {/* CARD 4: RECENT ACTIVITY */}
          <Card
            title="Recent Activity"
            icon={<Icon name="clock" className="h-6 w-6" />}
            glow="from-sky-400/15"
          >
            <ul className="flex flex-col divide-y divide-white/10">
              {activities.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sky-300/40 bg-indigo-500/25 text-indigo-100 shadow-[0_0_14px_rgba(99,102,241,0.6)]">
                    <Icon
                      name={ACTIVITY_ICON_MAP[a.icon] ?? a.icon}
                      className="h-5 w-5"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {a.title}
                    </div>
                    <div className="truncate text-xs text-indigo-200/60">
                      {a.sub}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-white/55">
                    {a.createdAt ? timeAgo(a.createdAt) : (a.time ?? "")}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>

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
            className={`${PANEL} max-h-[90vh] w-full max-w-xl overflow-y-auto border-sky-300/40 bg-[#0e1450] shadow-2xl`}
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
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              >
                <Icon name="close" className="h-4 w-4" />
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
                <Icon name="pin" className="h-4 w-4" />
                {selectedDestination.region ||
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
                  className="rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(99,102,241,0.5)] transition hover:scale-105"
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
