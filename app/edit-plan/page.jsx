"use client";

/**
 * app/components/EditPlanModal.jsx
 * Edit form for a saved plan. Opens as a glass modal over My plans.
 * Uses globals.css classes: .glass, .glass-input (and .is-error).
 *
 * Props:
 *   plan     - the saved plan object being edited
 *   onClose  - () => void
 *   onSave   - (updatedPlan) => void
 */

import { useEffect, useState } from "react";
import LocationSearch from "@/app/components/LocationSearch";

const TEMPLATE_OPTIONS = {
  Blank: { image: "/newplan/blank.jpg", gradient: "from-teal-300 to-indigo-500" },
  Weekend: { image: "/newplan/weekend.jpg", gradient: "from-rose-400 to-orange-300" },
  Solo: { image: "/newplan/solo.jpg", gradient: "from-teal-300 to-indigo-500" },
  Family: { image: "/newplan/family.jpg", gradient: "from-amber-300 to-emerald-400" },
  Adventure: { image: "/newplan/adventure.jpg", gradient: "from-cyan-300 to-emerald-500" },
};

const primaryBtn =
  "rounded-xl border border-teal-200/60 bg-teal-500/40 px-6 py-3 font-medium text-teal-50 transition hover:bg-teal-500/60";
const ghostBtn =
  "rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-white/90 transition hover:bg-white/20";
const label = "mb-2 block text-sm font-medium text-white/80";

const peso = (n) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n || 0);

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 text-sm text-red-200">
      {children}
    </p>
  );
}

export default function EditPlanModal({ plan, onClose, onSave }) {
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: plan.title ?? "",
    destination: plan.destination ?? "",
    location: plan.location ?? null,
    startDate: plan.startDate ?? "",
    endDate: plan.endDate ?? "",
    activities: plan.activities?.length ? [...plan.activities] : [],
    notes: plan.notes ?? "",
    budget: plan.budget ? String(plan.budget) : "",
    template: plan.template ?? "Blank",
  });

  const option = TEMPLATE_OPTIONS[form.template] ?? TEMPLATE_OPTIONS.Blank;
  const spent = plan.spent ?? 0;
  const budgetNumber = Number(form.budget) || 0;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function update(field, value) {
    setForm((c) => ({ ...c, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  const setActivity = (i, value) =>
    setForm((c) => ({
      ...c,
      activities: c.activities.map((a, idx) => (idx === i ? value : a)),
    }));
  const addActivity = () =>
    setForm((c) => ({ ...c, activities: [...c.activities, ""] }));
  const removeActivity = (i) =>
    setForm((c) => ({
      ...c,
      activities: c.activities.filter((_, idx) => idx !== i),
    }));

  function validate() {
    const next = {};
    if (!form.destination.trim()) next.destination = "Enter a destination.";
    if (!form.startDate) next.startDate = "Pick a start date.";
    if (!form.endDate) next.endDate = "Pick an end date.";
    else if (form.startDate && form.endDate < form.startDate)
      next.endDate = "End date can't be before the start date.";
    return next;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSave({
      ...plan, // keeps id, spent, status, completedAt, etc.
      title: form.title.trim() || form.destination.trim(),
      destination: form.destination.trim(),
      location: form.location,
      startDate: form.startDate,
      endDate: form.endDate,
      activities: form.activities.filter((a) => a.trim() !== ""),
      notes: form.notes,
      budget: budgetNumber,
      template: form.template,
      image: option.image,
      color: option.gradient,
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
        aria-labelledby="edit-plan-title"
        onSubmit={handleSubmit}
        noValidate
        className="glass max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl"
      >
        {/* Header with live image preview */}
        <div
          className={`relative h-36 overflow-hidden bg-linear-to-br ${option.gradient}`}
        >
          <img
            src={option.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-xl text-white transition hover:bg-black/50"
          >
            ×
          </button>
          <div className="absolute bottom-4 left-6">
            <p className="text-sm text-white/70">Editing</p>
            <h2 id="edit-plan-title" className="text-2xl font-bold">
              {form.title || form.destination || "Untitled plan"}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6 md:p-8">
          {/* Template picker */}
          <div>
            <span className={label}>Cover template</span>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(TEMPLATE_OPTIONS).map(([name, t]) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={form.template === name}
                  onClick={() => update("template", name)}
                  className={`overflow-hidden rounded-xl border text-center text-xs transition hover:-translate-y-0.5 ${
                    form.template === name
                      ? "border-white/80 outline outline-2 outline-offset-2 outline-white/70"
                      : "border-white/25"
                  }`}
                >
                  <div
                    className={`relative h-12 overflow-hidden bg-linear-to-br ${t.gradient}`}
                  >
                    <img
                      src={t.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <span className="block bg-white/10 py-1.5">{name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="edit-title" className={label}>
              Plan name
            </label>
            <input
              id="edit-title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Siargao Getaway"
              className="glass-input w-full rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="edit-destination" className={label}>
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
            <FieldError id="edit-destination-error">
              {errors.destination}
            </FieldError>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-start" className={label}>
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
              <FieldError id="edit-start-error">{errors.startDate}</FieldError>
            </div>
            <div>
              <label htmlFor="edit-end" className={label}>
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
              <FieldError id="edit-end-error">{errors.endDate}</FieldError>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white/80">
                Activities
              </span>
              <button
                type="button"
                onClick={addActivity}
                className="rounded-xl border border-white/30 bg-white/10 px-3 py-1.5 text-sm transition hover:bg-white/20"
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
                    onClick={() => removeActivity(i)}
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
            <label htmlFor="edit-notes" className={label}>
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
            <label htmlFor="edit-budget" className={label}>
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
              className={`mt-2 text-sm ${spent > budgetNumber ? "text-red-200" : "text-white/60"}`}
            >
              {spent > budgetNumber
                ? `You've already spent ${peso(spent)}, which is over this budget.`
                : `Spent so far: ${peso(spent)}. Spending is tracked in the Budget tab.`}
            </p>
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