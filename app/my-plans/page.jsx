"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Background } from "@/app/components/AuthCard";
import Navbar from "@/app/components/Navbar";
import LocationSearch from "@/app/components/LocationSearch";
import {
  useStoredState,
  PLANS_KEY,
  SEED_PLANS,
} from "@/app/components/usePlanStore";

const FILTERS = ["All", "Upcoming", "Ongoing", "Completed"];
const STEPS = ["Upcoming", "Ongoing", "Completed"];

// Cover choices in the edit form (same gradients as the New plan templates)
const COVERS = {
  Blank: "from-teal-300 to-indigo-500",
  Weekend: "from-rose-400 to-orange-300",
  Solo: "from-teal-300 to-indigo-500",
  Family: "from-amber-300 to-emerald-400",
  Adventure: "from-cyan-300 to-emerald-500",
};

const ghostBtn =
  "glass-dark rounded-full px-5 py-2.5 text-white/90 transition hover:bg-white/10";
const smallBtn =
  "glass-dark rounded-full px-3 py-1.5 text-sm transition hover:bg-white/10";
const primaryBtn =
  "rounded-full bg-linear-to-r from-indigo-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.6)] transition hover:scale-105 active:scale-95";
const fieldLabel = "mb-2 block text-sm font-medium text-white/80";

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

function getStatus(plan) {
  if (plan.status === "Completed") return "Completed";
  if (todayString() < plan.startDate) return "Upcoming";
  return "Ongoing";
}

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
  }).format(value || 0);
}

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
              : "bg-linear-to-r from-violet-400 via-blue-400 to-cyan-300"
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
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
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
                    ? "border-indigo-300/70 bg-indigo-500/60 text-white"
                    : "border-white/25 bg-white/5 text-white/40"
                }`}
              >
                {reached ? "✓" : index + 1}
              </span>
              <span
                className={`text-[11px] ${reached ? "text-white/85" : "text-white/40"}`}
              >
                {step}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${
                  index < current ? "bg-indigo-400/70" : "bg-white/15"
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
/* Edit plan modal                                                    */
/* ------------------------------------------------------------------ */

function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-2 text-sm text-red-200">{children}</p>;
}

function EditPlanModal({ plan, onClose, onSave }) {
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: plan.title ?? "",
    destination: plan.destination ?? "",
    location: plan.location ?? null,
    startDate: plan.startDate ?? "",
    endDate: plan.endDate ?? "",
    activities: [...(plan.activities ?? [])],
    notes: plan.notes ?? "",
    budget: plan.budget ? String(plan.budget) : "",
    template: plan.template ?? "Blank",
    color: plan.color ?? COVERS.Blank,
    // Plans saved before allocations existed fall back to their category names
    allocations: (
      plan.budgetAllocations ??
      (plan.budgetCategories ?? []).map((category) => ({
        category,
        amount: 0,
      }))
    ).map((a) => ({
      name: a.category,
      amount: a.amount ? String(a.amount) : "",
    })),
  });

  const total = Number(form.budget) || 0;
  const spent = plan.spent ?? 0;
  const allocated = form.allocations.reduce(
    (sum, a) => sum + (Number(a.amount) || 0),
    0,
  );
  const unallocated = total - allocated;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function update(field, value) {
    setForm((c) => ({ ...c, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  const clearAllocError = () =>
    errors.allocation && setErrors((e) => ({ ...e, allocation: undefined }));

  const setActivity = (i, v) =>
    setForm((c) => ({
      ...c,
      activities: c.activities.map((a, idx) => (idx === i ? v : a)),
    }));

  const setAllocation = (i, field, v) => {
    setForm((c) => ({
      ...c,
      allocations: c.allocations.map((a, idx) =>
        idx === i ? { ...a, [field]: v } : a,
      ),
    }));
    clearAllocError();
  };

  function splitEvenly() {
    const count = form.allocations.length;
    if (count === 0 || total <= 0) return;
    const base = Math.floor(total / count);
    const extra = total - base * count;
    setForm((c) => ({
      ...c,
      allocations: c.allocations.map((a, i) => ({
        ...a,
        amount: String(base + (i === 0 ? extra : 0)),
      })),
    }));
    clearAllocError();
  }

  function handleSubmit(event) {
    event.preventDefault();

    const next = {};
    if (!form.destination.trim()) next.destination = "Enter a destination.";
    if (!form.startDate) next.startDate = "Pick a start date.";
    if (!form.endDate) next.endDate = "Pick an end date.";
    else if (form.startDate && form.endDate < form.startDate)
      next.endDate = "End date can't be before the start date.";
    if (form.allocations.some((a) => Number(a.amount) > 0 && !a.name.trim()))
      next.allocation = "Give every allocated amount a category name.";
    else if (allocated > total)
      next.allocation = `Allocations are ${formatMoney(allocated - total)} over your total budget.`;

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const budgetAllocations = form.allocations
      .filter((a) => a.name.trim() !== "")
      .map((a) => ({ category: a.name.trim(), amount: Number(a.amount) || 0 }));

    onSave({
      ...plan, // keeps id, spent, status, completedAt…
      title: form.title.trim() || form.destination.trim(),
      destination: form.destination.trim(),
      location: form.location,
      startDate: form.startDate,
      endDate: form.endDate,
      activities: form.activities.filter((a) => a.trim() !== ""),
      notes: form.notes,
      budget: total,
      budgetCategories: budgetAllocations.map((a) => a.category),
      budgetAllocations,
      template: form.template,
      color: form.color,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
        onSubmit={handleSubmit}
        noValidate
        className="glass max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl"
      >
        <div className={`relative h-32 bg-linear-to-br ${form.color}`}>
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-xl text-white transition hover:bg-black/50"
          >
            ×
          </button>
          <div className="absolute bottom-4 left-6">
            <p className="text-sm text-white/75">Editing plan</p>
            <h2 id="edit-title" className="text-2xl font-bold">
              {form.title || form.destination || "Untitled plan"}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6 md:p-8">
          <div>
            <span className={fieldLabel}>Cover</span>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(COVERS).map(([name, gradient]) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={form.template === name}
                  onClick={() =>
                    setForm((c) => ({ ...c, template: name, color: gradient }))
                  }
                  className={`overflow-hidden rounded-xl border text-center text-xs transition hover:-translate-y-0.5 ${
                    form.template === name
                      ? "border-white/80 outline outline-2 outline-offset-2 outline-white/70"
                      : "border-white/25"
                  }`}
                >
                  <div className={`h-10 bg-linear-to-br ${gradient}`} />
                  <span className="block bg-white/10 py-1.5">{name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="edit-name" className={fieldLabel}>
              Plan name
            </label>
            <input
              id="edit-name"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Siargao Getaway"
              className="glass-input w-full rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="edit-destination" className={fieldLabel}>
              Destination
            </label>
            <LocationSearch
              id="edit-destination"
              value={form.destination}
              invalid={!!errors.destination}
              onChange={(text) => {
                update("destination", text);
                setForm((c) => ({ ...c, location: null }));
              }}
              onSelect={(loc) => {
                setForm((c) => ({
                  ...c,
                  destination: loc.label,
                  location: loc,
                }));
                setErrors((e) => ({ ...e, destination: undefined }));
              }}
            />
            <FieldError>{errors.destination}</FieldError>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-start" className={fieldLabel}>
                Start date
              </label>
              <input
                id="edit-start"
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                aria-invalid={!!errors.startDate}
                className={`glass-input w-full rounded-xl px-4 py-3 [color-scheme:dark] ${errors.startDate ? "is-error" : ""}`}
              />
              <FieldError>{errors.startDate}</FieldError>
            </div>
            <div>
              <label htmlFor="edit-end" className={fieldLabel}>
                End date
              </label>
              <input
                id="edit-end"
                type="date"
                min={form.startDate}
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
                aria-invalid={!!errors.endDate}
                className={`glass-input w-full rounded-xl px-4 py-3 [color-scheme:dark] ${errors.endDate ? "is-error" : ""}`}
              />
              <FieldError>{errors.endDate}</FieldError>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white/80">
                Activities
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm((c) => ({ ...c, activities: [...c.activities, ""] }))
                }
                className={smallBtn}
              >
                + Add activity
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {form.activities.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/30 px-4 py-4 text-sm text-white/60">
                  No activities yet. Add one to get started.
                </div>
              )}
              {form.activities.map((activity, i) => (
                <div key={i} className="flex gap-3">
                  <input
                    value={activity}
                    onChange={(e) => setActivity(i, e.target.value)}
                    placeholder="Activity"
                    aria-label={`Activity ${i + 1}`}
                    className="glass-input w-full rounded-xl px-4 py-3"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((c) => ({
                        ...c,
                        activities: c.activities.filter((_, x) => x !== i),
                      }))
                    }
                    aria-label="Remove activity"
                    className="h-12 w-12 shrink-0 rounded-xl border border-white/30 bg-white/10 text-xl transition hover:bg-white/20"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="edit-notes" className={fieldLabel}>
              Notes
            </label>
            <textarea
              id="edit-notes"
              rows={4}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Add notes for this plan..."
              className="glass-input w-full resize-y rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="edit-budget" className={fieldLabel}>
              Total budget
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                ₱
              </span>
              <input
                id="edit-budget"
                type="number"
                min="0"
                step="1"
                value={form.budget}
                onChange={(e) => update("budget", e.target.value)}
                placeholder="25000"
                className="glass-input w-full rounded-xl py-3 pl-8 pr-4"
              />
            </div>
            <p
              className={`mt-2 text-sm ${spent > total ? "text-red-200" : "text-white/60"}`}
            >
              {spent > total
                ? `You've already spent ${formatMoney(spent)}, which is over this budget.`
                : `Spent so far: ${formatMoney(spent)}. Spending is tracked in the Budget tab.`}
            </p>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-white/80">
                Budget allocation
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={splitEvenly}
                  disabled={total <= 0 || form.allocations.length === 0}
                  className={`${smallBtn} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  Split evenly
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((c) => ({
                      ...c,
                      allocations: [...c.allocations, { name: "", amount: "" }],
                    }))
                  }
                  className={smallBtn}
                >
                  + Add category
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
              <BudgetBar spent={allocated} budget={total} />
              <p
                className={`mt-2 text-xs ${unallocated < 0 ? "text-red-200" : "text-white/60"}`}
              >
                {unallocated < 0
                  ? `${formatMoney(-unallocated)} over your total budget`
                  : `${formatMoney(unallocated)} unallocated`}
              </p>

              <div className="mt-4 flex flex-col gap-3">
                {form.allocations.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/30 px-4 py-4 text-sm text-white/60">
                    No categories yet. Add one to start allocating.
                  </div>
                )}
                {form.allocations.map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      value={row.name}
                      onChange={(e) => setAllocation(i, "name", e.target.value)}
                      placeholder="Category"
                      aria-label={`Category ${i + 1} name`}
                      className="glass-input min-w-0 flex-1 rounded-xl px-4 py-3"
                    />
                    <div className="relative w-36 shrink-0 sm:w-44">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                        ₱
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={row.amount}
                        onChange={(e) =>
                          setAllocation(i, "amount", e.target.value)
                        }
                        placeholder="0"
                        aria-label={`${row.name || `Category ${i + 1}`} amount`}
                        className="glass-input w-full rounded-xl py-3 pl-7 pr-3"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((c) => ({
                          ...c,
                          allocations: c.allocations.filter((_, x) => x !== i),
                        }));
                        clearAllocError();
                      }}
                      aria-label={`Remove ${row.name || "category"}`}
                      className="h-12 w-12 shrink-0 rounded-xl border border-white/30 bg-white/10 text-xl transition hover:bg-white/20"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <FieldError>{errors.allocation}</FieldError>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={onClose} className={ghostBtn}>
              Cancel
            </button>
            <button type="submit" className={primaryBtn}>
              Save changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cards and details                                                  */
/* ------------------------------------------------------------------ */

function PlanCard({ plan, onView, onEdit, onComplete, onDelete }) {
  const status = getStatus(plan);
  const ready = canComplete(plan);

  return (
    <article
      className={`glass overflow-hidden rounded-3xl transition duration-200 hover:-translate-y-1 ${
        status === "Completed" ? "opacity-90" : ""
      }`}
    >
      <div
        className={`h-48 bg-linear-to-br ${plan.color} ${status === "Completed" ? "saturate-50" : ""}`}
      />

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
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onView}
              className="text-sm text-white/75 transition hover:text-white"
            >
              View plan
            </button>

            {status !== "Completed" && (
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Edit ${plan.title}`}
                className="text-sm text-white/75 transition hover:text-white"
              >
                ✎ Edit
              </button>
            )}
          </div>

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

function PlanDetails({ plan, onClose, onEdit, onComplete, onDelete }) {
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
              <p className="text-[11px] uppercase tracking-wide text-white/50">
                Dates
              </p>
              <p className="mt-1 text-sm font-medium">
                {formatDateRange(plan.startDate, plan.endDate)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-2 py-3">
              <p className="text-[11px] uppercase tracking-wide text-white/50">
                Length
              </p>
              <p className="mt-1 text-sm font-medium">
                {duration} day{duration === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-2 py-3">
              <p className="text-[11px] uppercase tracking-wide text-white/50">
                Status
              </p>
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
              <span
                className={`text-xs ${remaining < 0 ? "text-red-200" : "text-white/60"}`}
              >
                {remaining < 0
                  ? `${formatMoney(Math.abs(remaining))} over budget`
                  : `${formatMoney(remaining)} left`}
              </span>
            </div>
            <BudgetBar spent={plan.spent} budget={plan.budget} />

            {plan.budgetAllocations?.length > 0 && (
              <ul className="mt-4 flex flex-col gap-1.5 border-t border-white/15 pt-3 text-xs text-white/70">
                {plan.budgetAllocations.map((a) => (
                  <li key={a.category} className="flex justify-between">
                    <span>{a.category}</span>
                    <span>{formatMoney(a.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
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
                      ? "bg-linear-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_24px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95"
                      : "cursor-not-allowed border border-white/15 bg-white/5 text-white/40"
                  }`}
                >
                  ✓ Mark as completed
                </button>

                {!ready && (
                  <p className="mt-2 text-center text-xs text-white/50">
                    Available once the trip ends (after{" "}
                    {formatLongDate(plan.endDate)}).
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

              {status !== "Completed" && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="text-sm text-white/80 transition hover:text-white"
                >
                  ✎ Edit plan
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  confirmDelete ? onDelete() : setConfirmDelete(true)
                }
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
  const [editingId, setEditingId] = useState(null);

  const safePlans = Array.isArray(plans) ? plans : [];
  const selectedPlan = safePlans.find((plan) => plan.id === selectedId) ?? null;
  const editingPlan = safePlans.find((plan) => plan.id === editingId) ?? null;

  const filteredPlans = useMemo(() => {
    if (filter === "All") return safePlans;
    return safePlans.filter((plan) => getStatus(plan) === filter);
  }, [safePlans, filter]);

  function deletePlan(id) {
    setPlans((current) => current.filter((plan) => plan.id !== id));
    setSelectedId(null);
  }

  function completePlan(id) {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === id && canComplete(plan)
          ? { ...plan, status: "Completed", completedAt: todayString() }
          : plan,
      ),
    );
  }

  function startEdit(id) {
    setSelectedId(null); // close the details popup if it was open
    setEditingId(id);
  }

  function updatePlan(updated) {
    setPlans((current) =>
      current.map((plan) => (plan.id === updated.id ? updated : plan)),
    );
    setEditingId(null);
  }

  return (
    <Background>
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 md:px-8 md:py-6 xl:px-12">
        <Navbar />

        <main className="flex flex-1 flex-col">
          <Link
            href="/Main/HOME"
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
              className="rounded-full bg-linear-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold shadow-[0_0_24px_rgba(99,102,241,0.6)] transition hover:scale-105 active:scale-95"
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
                    ? "border-indigo-300/60 bg-indigo-500/40 text-white shadow-[0_0_18px_rgba(99,102,241,0.5)]"
                    : "border-white/20 bg-white/5 text-white/65 hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {filteredPlans.length > 0 ? (
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onView={() => setSelectedId(plan.id)}
                  onEdit={() => startEdit(plan.id)}
                  onComplete={() => completePlan(plan.id)}
                  onDelete={() => deletePlan(plan.id)}
                />
              ))}
            </section>
          ) : (
            <section className="glass rounded-3xl px-8 py-16 text-center">
              <p className="text-sm text-white/55">No plans here yet.</p>
              <h2 className="mt-2 text-2xl font-semibold">
                {filter === "All"
                  ? "Create your first plan"
                  : `No ${filter.toLowerCase()} plans`}
              </h2>

              <Link
                href="/newplan"
                className="mt-6 inline-block rounded-full bg-linear-to-r from-indigo-500 to-violet-500 px-5 py-3 font-semibold shadow-[0_0_24px_rgba(99,102,241,0.6)] transition hover:scale-105 active:scale-95"
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
            onEdit={() => startEdit(selectedPlan.id)}
            onComplete={() => completePlan(selectedPlan.id)}
            onDelete={() => deletePlan(selectedPlan.id)}
          />
        )}

        {editingPlan && (
          <EditPlanModal
            plan={editingPlan}
            onClose={() => setEditingId(null)}
            onSave={updatePlan}
          />
        )}
      </div>
    </Background>
  );
}
