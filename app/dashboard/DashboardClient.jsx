"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { useEffect, useState } from "react";
import { Icon } from "@/app/components/ui";

// Dashboard-only na panel style (walang glow). Hindi ginagalaw ang PANEL sa ui.jsx
// kaya hindi apektado ang ibang pages.
const PANEL_FLAT =
  "rounded-3xl border border-gala-aqua/30 bg-linear-to-br from-gala-surface/90 via-gala-surface/85 to-[#172B3A]/90 backdrop-blur-md shadow-card";

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
          <stop offset="0" stopColor="#C9AE72" stopOpacity="0.75" />
          <stop offset="1" stopColor="#C9AE72" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bucketSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2B6F7C" stopOpacity="0" />
          <stop offset="1" stopColor="#7C98A3" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect width="300" height="160" fill="url(#bucketSky)" />
      <circle cx="215" cy="98" r="46" fill="url(#bucketSun)" />
      <path
        d="M0 110 L40 85 L70 100 L110 70 L150 98 L190 75 L240 105 L300 80 L300 160 L0 160Z"
        fill="#4A5F6B"
        opacity="0.55"
      />
      <path
        d="M0 130 L50 105 L90 125 L140 95 L190 125 L235 108 L300 128 L300 160 L0 160Z"
        fill="#2E4150"
        opacity="0.8"
      />
      <path
        d="M0 148 L60 128 L110 145 L170 125 L230 146 L300 132 L300 160 L0 160Z"
        fill="#131C2B"
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
  backdrop = null,
  action,
  onAction,
  children,
  className = "",
}) {
  return (
    <div
      className={`${PANEL_FLAT} relative flex flex-col overflow-hidden p-5 ${className}`}
    >
      {backdrop}

      <div className="relative z-10 flex flex-1 flex-col">
        <div
          className={`mb-4 flex items-center justify-between ${
            divider ? "border-b border-gala-line pb-4" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            {boxedIcon ? (
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gala-line bg-gala-raised text-gala-accent">
                {icon}
              </span>
            ) : (
              <span className="text-gala-accent">{icon}</span>
            )}
            <div>
              <h2 className="text-lg font-semibold leading-tight text-gala-text">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gala-aqua">{subtitle}</p>
              )}
            </div>
          </div>
          {action && (
            <button
              onClick={onAction}
              className="flex items-center gap-1 text-sm text-gala-accent transition hover:text-gala-text"
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
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gala-text/15">
      <div
        className="h-full rounded-full bg-linear-to-r from-gala-accent to-gala-teal"
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
          stroke="#1D2A3A"
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
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A5AE5C" />
            <stop offset="1" stopColor="#2B6F7C" />
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
      "bg-gala-accent",
      "bg-gala-teal",
      "bg-gala-gold",
      "bg-gala-aqua",
      "bg-gala-muted",
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
    <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 text-gala-text md:px-8 md:py-6 xl:px-12">
      {/* NAV */}
      <Navbar />

      {/* MAIN FRAME */}
      <div className="flex flex-col gap-5 p-4 md:p-6">
        {/* WELCOME */}
        <section className="flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="text-left">
            <h1 className="text-4xl font-bold tracking-tight text-gala-text md:text-5xl">
              Welcome back,{" "}
              <span className="text-gala-accent">{name}!</span>
            </h1>
            <p className="mt-2 text-lg text-gala-aqua md:text-xl">
              Ready for your next na adventure gala?
            </p>
          </div>
          <button
            onClick={() => go("/newplan")}
            className="flex items-center gap-2 rounded-full bg-gala-accent px-7 py-3 font-bold text-gala-bg shadow-accent transition hover:scale-105 hover:brightness-110 hover:shadow-lift active:scale-95"
          >
            <Icon name="plus" className="h-5 w-5" /> New Plan
          </button>
        </section>

        {/* HERO: NEXT TRIP */}
        {loading ? (
          <section className={`${PANEL_FLAT} p-8 text-gala-text/80`}>
            Loading your next na gala...
          </section>
        ) : error ? (
          <section className={`${PANEL_FLAT} p-8 text-red-200`}>{error}</section>
        ) : nextTrip ? (
          <section
            className="relative overflow-hidden rounded-3xl border border-gala-line shadow-card"
            style={{
              backgroundImage: nextTrip.image
                ? `linear-gradient(90deg, rgba(12,18,32,0.95) 0%, rgba(12,18,32,0.75) 30%, rgba(12,18,32,0.1) 65%, rgba(12,18,32,0) 100%), url("${nextTrip.image}")`
                : "linear-gradient(120deg, #0C1220, #131C2B, #2B6F7C)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="flex min-h-72 flex-col justify-between gap-6 p-6 md:p-8">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold tracking-wider text-gala-aqua">
                  <Icon name="pin" className="h-5 w-5" />
                  YOUR NEXT NA GALA
                  {isDemo && (
                    <span className="rounded-full border border-gala-accent/50 bg-gala-accent/15 px-2.5 py-0.5 text-[10px] font-medium tracking-normal text-gala-accent">
                      Sample Gala
                    </span>
                  )}
                </p>
                <h2 className="mt-2 text-4xl font-bold tracking-tight text-gala-text md:text-5xl">
                  {nextTrip.title}
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gala-text/90">
                  <span className="flex items-center gap-2">
                    <Icon name="calendar" className="h-5 w-5 text-gala-aqua" />
                    {nextTrip.dates}
                  </span>
                  <span className="hidden h-5 w-px bg-gala-text/25 sm:block" />
                  <span className="flex items-center gap-2">
                    <Icon name="pin" className="h-5 w-5 text-gala-aqua" />
                    {nextTrip.destinations} destinations
                  </span>
                  <span className="hidden h-5 w-px bg-gala-text/25 sm:block" />
                  <span className="flex items-center gap-2">
                    <Icon name="clock" className="h-5 w-5 text-gala-aqua" />
                    {nextTrip.daysToGo} days to go
                  </span>
                </div>
                <button
                  onClick={() =>
                    go(isDemo ? "/newplan" : `/my-plans?trip=${nextTrip.id}`)
                  }
                  className="mt-5 flex items-center gap-2 rounded-full border border-gala-aqua bg-gala-bg/50 px-6 py-2.5 text-sm font-semibold text-gala-text backdrop-blur transition hover:bg-gala-raised"
                >
                  {isDemo ? "Plan your first trip" : "View Trip"}
                  <Icon name="arrow" className="h-4 w-4" />
                </button>
              </div>

              <div className="flex max-w-xl items-start gap-3 border-t border-gala-text/15 pt-4">
                <Icon
                  name="wallet"
                  className="mt-0.5 h-6 w-6 text-gala-aqua"
                />
                <div className="flex-1">
                  <div className="text-sm text-gala-text/80">
                    Budget Progress
                  </div>
                  <div className="mt-0.5 text-lg font-semibold text-gala-text">
                    {peso(nextTrip.spent)}{" "}
                    <span className="text-gala-muted">
                      / {peso(nextTrip.budget)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1">
                      <Bar percent={budgetPercent} />
                    </div>
                    <span className="text-sm text-gala-text/80">
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
            action={showingFeatured ? "Explore more" : "View all"}
            onAction={() => go(showingFeatured ? "/explore" : "/bucket-list")}
          >
            <div className="grid flex-1 grid-cols-3 gap-3">
              {visiblePlaces.map((d, index) => (
                <button
                  key={`${d.id}-${index}`}
                  onClick={() => setSelectedDestination(d)}
                  className="group relative min-h-64 overflow-hidden rounded-3xl border border-gala-line text-left shadow-card transition duration-500 hover:shadow-lift"
                >
                  {/* gradient fallback (lalabas kapag walang image / hindi nag-load) */}
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${
                      d.color || "from-gala-teal to-gala-surface"
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
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#0C1220]/90 via-[#0C1220]/50 to-transparent p-3 pt-10">
                    <div className="flex items-center justify-between gap-1">
                      <div className="truncate text-sm font-semibold text-gala-text">
                        {d.name}
                      </div>
                      <Icon
                        name="bookmark"
                        filled={d.bookmarked ?? hasSaved}
                        className={`h-4 w-4 shrink-0 ${
                          (d.bookmarked ?? hasSaved)
                            ? "text-gala-accent"
                            : "text-gala-aqua"
                        }`}
                      />
                    </div>
                    <div className="truncate text-[11px] text-gala-text/80">
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
                  className="flex items-center gap-1.5 rounded-full border border-gala-line bg-gala-raised/60 px-4 py-2 text-sm text-gala-text transition hover:bg-gala-raised active:scale-95"
                  aria-label="Previous destination"
                >
                  <Icon name="arrowLeft" className="h-3.5 w-3.5" />
                  Prev
                </button>

                <span className="text-xs text-gala-muted">
                  {startIndex + 1} of {totalPlaces}
                </span>

                <button
                  type="button"
                  onClick={nextPlaces}
                  className="flex items-center gap-1.5 rounded-full border border-gala-line bg-gala-raised/60 px-4 py-2 text-sm text-gala-text transition hover:bg-gala-raised active:scale-95"
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
            icon={<Icon name="Wallet" className="h-6 w-6" />}
            boxedIcon
          >
            <div>
              <div className="text-sm text-gala-text/75">Total Budget</div>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-3xl font-bold text-gala-text">
                  {peso(nextTrip?.budget ?? 0)}
                </span>
                <span className="rounded-full border border-gala-accent/60 bg-gala-accent/10 px-3 py-0.5 text-xs text-gala-accent">
                  Planned
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <Bar percent={budgetPercent} />
                </div>
                <span className="text-sm text-gala-text/80">
                  {budgetPercent}%
                </span>
              </div>

              <ul className="mt-4 divide-y divide-gala-line text-sm text-gala-text/90">
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
                      <span className="w-10 text-right text-gala-muted">
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
                <span className="mb-0.5 text-gala-accent">
                  <Icon name="mountain" className="h-6 w-6" />
                </span>
                <div className="text-2xl font-bold text-gala-text">
                  {bucketDone}{" "}
                  <span className="text-base font-normal text-gala-text/75">
                    of {bucketTotal}
                  </span>
                </div>
                <div className="text-[11px] text-gala-muted">
                  destinations completed
                </div>
              </Ring>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1">
                <Bar percent={bucketPercent} />
              </div>
              <span className="text-sm text-gala-text/80">
                {bucketPercent}%
              </span>
            </div>
            <button
              onClick={() => go("/bucket-list")}
              className="mx-auto mt-5 flex items-center gap-2 rounded-full bg-gala-accent px-5 py-2 text-sm font-semibold text-gala-bg shadow-accent transition hover:scale-105 hover:brightness-110 hover:shadow-lift active:scale-95"
            >
              View Bucket List
              <Icon name="arrow" className="h-4 w-4" />
            </button>
          </Card>

          {/* CARD 4: RECENT ACTIVITY */}
          <Card
            title="Recent Activity"
            icon={<Icon name="clock" className="h-6 w-6" />}
          >
            <ul className="flex flex-col divide-y divide-gala-line">
              {activities.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gala-line bg-gala-raised text-gala-accent">
                    <Icon
                      name={ACTIVITY_ICON_MAP[a.icon] ?? a.icon}
                      className="h-5 w-5"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gala-text">
                      {a.title}
                    </div>
                    <div className="truncate text-xs text-gala-aqua">
                      {a.sub}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-gala-muted">
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
            className={`${PANEL_FLAT} max-h-[90vh] w-full max-w-xl overflow-y-auto border-gala-line bg-gala-surface shadow-lift`}
          >
            {/* Destination image */}
            <div
              className="relative h-64 bg-cover bg-center"
              style={{
                backgroundImage: selectedDestination.image
                  ? `url("${selectedDestination.image}")`
                  : "linear-gradient(135deg, #2B6F7C, #131C2B)",
              }}
            >
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedDestination(null)}
                aria-label="Close destination details"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-gala-text transition hover:bg-black/70"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>

              <div className="absolute bottom-5 left-6 right-6">
                <h2
                  id="destination-modal-title"
                  className="text-3xl font-bold text-gala-text"
                >
                  {selectedDestination.name}
                </h2>
              </div>
            </div>

            {/* Destination details */}
            <div className="space-y-4 p-6">
              <p className="flex items-center gap-2 text-sm text-gala-aqua">
                <Icon name="pin" className="h-4 w-4" />
                {selectedDestination.region ||
                  selectedDestination.location ||
                  "Philippines"}
              </p>

              <p className="text-sm leading-relaxed text-gala-text/75">
                {selectedDestination.description ||
                  "Explore this destination and discover your next adventure."}
              </p>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedDestination(null)}
                  className="rounded-xl bg-gala-accent px-6 py-2.5 text-sm font-semibold text-gala-bg transition hover:scale-105 hover:brightness-110"
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