"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Background } from "app/components/AuthCard";
import { useStoredState, PLANS_KEY, SEED_PLANS } from "app/components/usePlanStore";

/* ------------------------------------------------------------------ */
/* Sample data. Papalitan ng galing sa API/database mamaya.           */
/* `status: "Completed"` lang ang naka-save. Upcoming/Ongoing ay      */
/* kinukuwenta base sa petsa.                                         */
/* ------------------------------------------------------------------ */



const FILTERS = ["All", "Upcoming", "Ongoing", "Completed"];
const STEPS = ["Upcoming", "Ongoing", "Completed"];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toDate(value) {
  return new Date(`${value}T00:00:00`);
}

function daysBetween(from, to) {
  return Math.round((toDate(to) - toDate(from)) / 86400000);
}

// Completed lang kapag pinindot ang button. Pag nagsimula na ang date, Ongoing na.
function getStatus(plan) {
  if (plan.status === "Completed") return "Completed";
  if (todayString() < plan.startDate) return "Upcoming";
  return "Ongoing";
}

// Pwede lang i-complete kapag lumagpas na ang end date
function canComplete(plan) {
  return plan.status !== "Completed" && todayString() > plan.endDate;
}

function getCountdown(plan) {
  const today = todayString();
  const status = getStatus(plan);

  if (status === "Completed") return "Trip completed";

  if (status === "Upcoming") {
    const days = daysBetween(today, plan.startDate);
    return days === 1 ? "Starts tomorrow" : `${days} days to go`;
  }

  if (today <= plan.endDate) {
    const total = daysBetween(plan.startDate, plan.endDate) + 1;
    return `Day ${daysBetween(plan.startDate, today) + 1} of ${total}`;
  }

  const ago = daysBetween(plan.endDate, today);
  return `Ended ${ago} day${ago === 1 ? "" : "s"} ago`;
}

function formatDateRange(start, end) {
  const startDate = toDate(start);
  const endDate = toDate(end);

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });

  if (startMonth === endMonth) {
    return `${startDay} to ${endDay} ${startMonth}`;
  }

  return `${startDay} ${startMonth} to ${endDay} ${endMonth}`;
}

function formatLongDate(value) {
  return toDate(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

/* ------------------------------------------------------------------ */
/* Navbar                                                             */
/* ------------------------------------------------------------------ */
function Navbar() {
  return (
    <header className="glass mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl px-6 py-3">
      <Link href="/Main" className="text-xl font-bold tracking-tight text-white">
        PROJECT-GALA
      </Link>

      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/Main"
          className="rounded-xl px-4 py-2 text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          Dashboard
        </Link>

        <Link
          href="/my-plans"
          className="rounded-xl bg-white/15 px-4 py-2 font-medium text-white"
        >
          My plans
        </Link>

        <Link
          href="/Bucket-list"
          className="rounded-xl px-4 py-2 text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          Bucket list
        </Link>

        <Link
          href="/journal"
          className="rounded-xl px-4 py-2 text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          Journal
        </Link>
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
/* Small pieces                                                       */
/* ------------------------------------------------------------------ */
function BudgetBar({ spent, budget }) {
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const over = spent > budget;

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs text-white/65">
        <span>
          {formatMoney(spent)} / {formatMoney(budget)}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/15">
        <div
          className={`h-full rounded-full transition-all ${
            over
              ? "bg-linear-to-r from-orange-300 to-red-400"
              : "bg-linear-to-r from-cyan-300 to-teal-300"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Upcoming: "bg-sky-400/20 text-sky-100",
    Ongoing: "bg-yellow-300/20 text-yellow-100",
    Completed: "bg-emerald-400/20 text-emerald-100",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function StatusStepper({ status }) {
  const current = STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, index) => {
        const reached = index <= current;

        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                  reached
                    ? "border-teal-200/70 bg-teal-400/60 text-white"
                    : "border-white/25 bg-white/5 text-white/40"
                }`}
              >
                {reached ? "✓" : index + 1}
              </span>
              <span className={`text-[11px] ${reached ? "text-white/85" : "text-white/40"}`}>
                {step}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${
                  index < current ? "bg-teal-300/70" : "bg-white/15"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                               */
/* ------------------------------------------------------------------ */
function PlanCard({ plan, onView, onComplete, onDelete }) {
  const status = getStatus(plan);
  const ready = canComplete(plan);

  return (
    <article
      className={`glass overflow-hidden rounded-3xl transition duration-200 hover:-translate-y-1 ${
        status === "Completed" ? "opacity-90" : ""
      }`}
    >
      <div className={`h-36 bg-linear-to-br ${plan.color} ${status === "Completed" ? "saturate-50" : ""}`} />

      <div className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{plan.title}</h3>
            <p className="mt-1 text-sm text-white/70">{plan.destination}</p>
            <p className="mt-1 text-xs text-white/50">
              {formatDateRange(plan.startDate, plan.endDate)}
            </p>
          </div>

          <StatusBadge status={status} />
        </div>

        <BudgetBar spent={plan.spent} budget={plan.budget} />

        <p className="mt-3 text-xs text-white/55">{getCountdown(plan)}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onView}
            className="text-sm text-white/75 transition hover:text-white"
          >
            View plan
          </button>

          {ready && (
            <button
              type="button"
              onClick={onComplete}
              className="rounded-lg border border-teal-200/50 bg-teal-500/40 px-3 py-1 text-xs font-medium text-teal-50 transition hover:bg-teal-500/60"
            >
              ✓ Mark completed
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            className="text-sm text-red-200/70 transition hover:text-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* View plan modal                                                    */
/* ------------------------------------------------------------------ */
function PlanDetails({ plan, onClose, onComplete, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const status = getStatus(plan);
  const ready = canComplete(plan);
  const duration = daysBetween(plan.startDate, plan.endDate) + 1;
  const remaining = plan.budget - plan.spent;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
        aria-labelledby="plan-title"
        className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl"
      >
        {/* Header */}
        <div className={`relative h-40 bg-linear-to-br ${plan.color}`}>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/50 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-xl text-white transition hover:bg-black/50"
          >
            ×
          </button>

          <div className="absolute bottom-4 left-6">
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="p-6">
          <h2 id="plan-title" className="text-2xl font-bold">
            {plan.title}
          </h2>
          <p className="mt-1 text-white/70">{plan.destination}</p>

          {/* Quick facts */}
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/10 px-2 py-3">
              <p className="text-[11px] uppercase tracking-wide text-white/50">Dates</p>
              <p className="mt-1 text-sm font-medium">
                {formatDateRange(plan.startDate, plan.endDate)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-2 py-3">
              <p className="text-[11px] uppercase tracking-wide text-white/50">Length</p>
              <p className="mt-1 text-sm font-medium">
                {duration} day{duration === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-2 py-3">
              <p className="text-[11px] uppercase tracking-wide text-white/50">Status</p>
              <p className="mt-1 text-sm font-medium">{getCountdown(plan)}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <StatusStepper status={status} />
          </div>

          {/* Budget */}
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">Budget</h3>
              <span className={`text-xs ${remaining < 0 ? "text-red-200" : "text-white/60"}`}>
                {remaining < 0
                  ? `${formatMoney(Math.abs(remaining))} over budget`
                  : `${formatMoney(remaining)} left`}
              </span>
            </div>
            <BudgetBar spent={plan.spent} budget={plan.budget} />
          </div>

          {/* Actions */}
          <div className="mt-6">
            {status === "Completed" ? (
              <p className="rounded-xl bg-emerald-400/15 px-4 py-3 text-center text-sm text-emerald-100">
                This trip is completed and is now in your Journal.
              </p>
            ) : (
              <>
                <button
                  type="button"
                  disabled={!ready}
                  onClick={onComplete}
                  className={`h-11 w-full rounded-xl font-semibold transition ${
                    ready
                      ? "bg-linear-to-r from-teal-400 to-emerald-400 text-white shadow-lg shadow-teal-500/30 hover:scale-[1.02] active:scale-95"
                      : "cursor-not-allowed border border-white/15 bg-white/5 text-white/40"
                  }`}
                >
                  ✓ Mark as completed
                </button>

                {!ready && (
                  <p className="mt-2 text-center text-xs text-white/50">
                    Available once the trip ends (after {formatLongDate(plan.endDate)}).
                  </p>
                )}
              </>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-white/70 transition hover:text-white"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
                onBlur={() => setConfirmDelete(false)}
                className="text-sm text-red-200/70 transition hover:text-red-200"
              >
                {confirmDelete ? "Click again to confirm" : "Delete plan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
export default function MyPlansPage() {
  const [plans, setPlans] = useStoredState(PLANS_KEY, SEED_PLANS);
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);

  const selectedPlan = plans.find((plan) => plan.id === selectedId) ?? null;

  const filteredPlans = useMemo(() => {
    if (filter === "All") return plans;
    return plans.filter((plan) => getStatus(plan) === filter);
  }, [plans, filter]);

  function deletePlan(id) {
    setPlans((current) => current.filter((plan) => plan.id !== id));
    setSelectedId(null);
  }

  function completePlan(id) {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === id && canComplete(plan)
          ? { ...plan, status: "Completed", completedAt: todayString() }
          : plan
      )
    );
  }

  return (
    <Background>
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <Navbar />

        <main className="mt-10">
          <Link
            href="/Main"
            className="mb-5 inline-block text-sm text-white/65 transition hover:text-white"
          >
            ← Back
          </Link>

          <section className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-1 text-sm text-white/60">Your adventures</p>
              <h1 className="text-4xl font-bold">My plans</h1>
            </div>

            <Link
              href="/newplan"
              className="rounded-xl border border-white/35 bg-teal-500/70 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-400/80"
            >
              + New plan
            </Link>
          </section>

          <div className="mb-7 flex flex-wrap gap-2">
            {FILTERS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  filter === tab
                    ? "border-white/60 bg-white/20 text-white"
                    : "border-white/20 bg-white/5 text-white/65 hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {filteredPlans.length > 0 ? (
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onView={() => setSelectedId(plan.id)}
                  onComplete={() => completePlan(plan.id)}
                  onDelete={() => deletePlan(plan.id)}
                />
              ))}
            </section>
          ) : (
            <section className="glass rounded-3xl px-8 py-16 text-center">
              <p className="text-sm text-white/55">No plans here yet.</p>
              <h2 className="mt-2 text-2xl font-semibold">
                {filter === "All" ? "Create your first plan" : `No ${filter.toLowerCase()} plans`}
              </h2>

              <Link
                href="/newplan"
                className="mt-6 inline-block rounded-xl bg-teal-500/70 px-5 py-3 font-medium transition hover:bg-teal-400/80"
              >
                + New plan
              </Link>
            </section>
          )}
        </main>

        {selectedPlan && (
          <PlanDetails
            plan={selectedPlan}
            onClose={() => setSelectedId(null)}
            onComplete={() => completePlan(selectedPlan.id)}
            onDelete={() => deletePlan(selectedPlan.id)}
          />
        )}
      </div>
    </Background>
  );
}