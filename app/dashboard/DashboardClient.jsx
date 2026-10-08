"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

const nextTrip = {
  id: 1,
  title: "Baguio Weekend Getaway",
  dates: "Dec 12 – Dec 15, 2026",
  destinations: 3,
  daysToGo: 12,
  budget: 10000,
  spent: 6250,
  image: "/baguio.jpg",
};

const saved = [
  {
    id: 1,
    name: "El Nido",
    region: "Palawan",
    color: "from-emerald-300 to-teal-500",
  },
  {
    id: 2,
    name: "Siargao",
    region: "Surigao del Norte",
    color: "from-cyan-300 to-blue-500",
  },
  {
    id: 3,
    name: "Baguio",
    region: "Benguet",
    color: "from-lime-300 to-emerald-600",
  },
];

const budgetItems = [
  { label: "Transportation", amount: 2000, dot: "bg-violet-400" },
  { label: "Accommodation", amount: 4000, dot: "bg-blue-400" },
  { label: "Food", amount: 2000, dot: "bg-orange-400" },
  { label: "Activities", amount: 1000, dot: "bg-fuchsia-400" },
  { label: "Others", amount: 500, dot: "bg-cyan-400" },
];

const activities = [
  {
    id: 1,
    icon: "✈️",
    title: "Created a new trip plan",
    sub: "Baguio Weekend Getaway",
    time: "2h ago",
  },
  {
    id: 2,
    icon: "🔖",
    title: "Added destination to bucket list",
    sub: "Siargao",
    time: "5h ago",
  },
  {
    id: 3,
    icon: "👛",
    title: "Updated trip budget",
    sub: "Baguio Weekend Getaway",
    time: "1d ago",
  },
  {
    id: 4,
    icon: "👁️",
    title: "Viewed a destination",
    sub: "El Nido",
    time: "1d ago",
  },
];

const bucketDone = 3;
const bucketTotal = 10;

const peso = (n) => `₱${n.toLocaleString("en-PH")}`;

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
          strokeDashoffset={c * (1 - percent / 100)}
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

  const budgetPercent = Math.round((nextTrip.spent / nextTrip.budget) * 100);
  const bucketPercent = Math.round((bucketDone / bucketTotal) * 100);

  return (
    <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 md:px-8 md:py-6 xl:px-12">
      {/* NAV (shared: includes Admin tab for superadmin + Profile menu) */}
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
      <section
        className="glass-dark relative overflow-hidden rounded-3xl"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(12,18,70,0.92) 0%, rgba(12,18,70,0.55) 45%, rgba(12,18,70,0.05) 100%), url(${nextTrip.image})`,
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
              onClick={() => go(`/plans/${nextTrip.id}`)}
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

      {/* 4 CARDS */}
      <section className="grid flex-1 gap-5 md:grid-cols-2 xl:grid-cols-[1.1fr_1.2fr_0.9fr_1fr]">
        <Card
          title="Saved Destinations"
          icon="📍"
          action="View all"
          onAction={() => go("/bucket-list")}
        >
          <div className="grid flex-1 grid-cols-3 gap-3">
            {saved.map((d) => (
              <button
                key={d.id}
                onClick={() => go(`/destination/${d.id}`)}
                className="group relative min-h-48 overflow-hidden rounded-2xl border border-white/25 text-left"
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${d.color} transition duration-300 group-hover:scale-110`}
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-2.5">
                  <div className="text-sm font-semibold">{d.name}</div>
                  <div className="text-[11px] text-white/75">{d.region}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Trip Budget Planner" icon="👛">
          <p className="-mt-3 mb-3 text-sm text-white/65">{nextTrip.title}</p>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <div className="text-sm text-white/75">Total Budget</div>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-3xl font-bold">
                {peso(nextTrip.budget)}
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
              {budgetItems.map((b) => (
                <li key={b.label} className="flex items-center gap-3 py-2">
                  <span className={`h-3 w-3 rounded-full ${b.dot}`} />
                  <span className="flex-1">{b.label}</span>
                  <span className="w-16 text-right">{peso(b.amount)}</span>
                  <span className="w-10 text-right text-white/60">
                    {Math.round((b.amount / nextTrip.budget) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

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
          <button
            onClick={() => go("/bucket-list")}
            className="glass-dark mx-auto mt-5 rounded-full px-5 py-2 text-sm font-medium hover:bg-white/10"
          >
            View Bucket List →
          </button>
        </Card>

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
                <span className="shrink-0 text-xs text-white/55">{a.time}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
