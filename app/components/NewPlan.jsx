"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Background, Logo } from "app/components/AuthCard";
import Navbar from "app/components/Navbar";

/* ------------------------------------------------------------------ */
/* Templates                                                          */
/* ------------------------------------------------------------------ */
const TEMPLATES = {
  Blank: {
    description: "Start empty",
    gradient: "",
    activities: [],
    notes: "",
    budgetCategories: [],
  },
  Weekend: {
    description: "A quick weekend escape",
    gradient: "from-rose-400 to-orange-300",
    activities: [
      "Explore the city",
      "Local food experience",
      "Relax and unwind",
    ],
    notes: "Keep the itinerary flexible and leave room for spontaneous plans.",
    budgetCategories: ["Accommodation", "Food", "Activities"],
  },
  Solo: {
    description: "A trip built around you",
    gradient: "from-teal-300 to-indigo-500",
    activities: [
      "Explore independently",
      "Local food experience",
      "Personal free time",
    ],
    notes: "Prioritize experiences that you can enjoy at your own pace.",
    budgetCategories: ["Accommodation", "Food", "Transport"],
  },
  Family: {
    description: "Something for everyone",
    gradient: "from-amber-300 to-emerald-400",
    activities: ["Family attraction", "Kid-friendly activity", "Family meal"],
    notes: "Leave some downtime between activities for the family.",
    budgetCategories: ["Accommodation", "Food", "Family activities"],
  },
  Adventure: {
    description: "Make the most of the outdoors",
    gradient: "from-cyan-300 to-emerald-500",
    activities: [
      "Outdoor adventure",
      "Local exploration",
      "Adventure activity",
    ],
    notes: "Check weather and equipment requirements before activities.",
    budgetCategories: ["Accommodation", "Transport", "Adventure"],
  },
};

// Mga reusable na class
const primaryBtn =
  "rounded-xl border border-teal-200/60 bg-teal-500/40 px-6 py-3 font-medium text-teal-50 transition hover:bg-teal-500/60";
const ghostBtn =
  "rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-white/90 transition hover:bg-white/20";
const label = "mb-2 block text-sm font-medium text-white/80";

/* ------------------------------------------------------------------ */
/* Small components                                                   */
/* ------------------------------------------------------------------ */

function StepIndicator({ step }) {
  const item = (n) => (
    <span
      className={`rounded-full border px-4 py-1 text-sm ${
        step === n
          ? "border-white/60 bg-white/25 text-white"
          : "border-white/20 bg-white/5 text-white/60"
      }`}
    >
      Step {n}
    </span>
  );
  return (
    <div
      className="mt-6 flex items-center gap-3"
      aria-label={`Step ${step} of 2`}
    >
      {item(1)}
      <div className="h-px w-10 bg-white/30" />
      {item(2)}
    </div>
  );
}

function TemplateCard({ name, template, selected, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(name)}
      className={`glass overflow-hidden rounded-3xl text-left transition hover:-translate-y-1 hover:bg-white/10 ${
        selected ? "outline outline-2 outline-offset-2 outline-white/80" : ""
      }`}
    >
      <div
        className={`h-24 ${
          template.gradient
            ? `bg-gradient-to-br ${template.gradient}`
            : "border-b border-dashed border-white/30 bg-white/5"
        }`}
      />
      <div className="p-4">
        <strong className="block text-lg font-semibold">{name}</strong>
        <span className="text-sm text-white/70">{template.description}</span>
      </div>
    </button>
  );
}

function PreviewSection({ title, items }) {
  return (
    <div className="glass rounded-3xl p-5">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="flex flex-col gap-2">
        {items.length > 0 ? (
          items.map((text, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white/80"
            >
              {text}
            </div>
          ))
        ) : (
          <>
            <div className="h-8 rounded-xl bg-white/10" />
            <div className="h-8 w-2/3 rounded-xl bg-white/10" />
            <div className="h-8 w-1/3 rounded-xl bg-white/10" />
          </>
        )}
      </div>
    </div>
  );
}

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 text-sm text-red-200">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
export default function NewPlan({ onCancel, onSave, initialDestination = "" }) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState("Blank");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    destination: initialDestination,
    startDate: "",
    endDate: "",
    activities: [],
    notes: "",
    budget: "",
    budgetCategories: [],
  });

  const template = useMemo(
    () => TEMPLATES[selectedTemplate],
    [selectedTemplate],
  );

  function updateForm(field, value) {
    setForm((c) => ({ ...c, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  // Pag-pili ng template, dito na nag-pre-fill (hindi na ulit sa Continue,
  // para hindi mabura ang na-edit ng user kapag bumalik sa Step 1)
  function selectTemplate(name) {
    const t = TEMPLATES[name];
    setSelectedTemplate(name);
    setForm((c) => ({
      ...c,
      activities: [...t.activities],
      notes: t.notes,
      budgetCategories: [...t.budgetCategories],
    }));
  }

  function addActivity() {
    setForm((c) => ({ ...c, activities: [...c.activities, ""] }));
  }

  function updateActivity(index, value) {
    setForm((c) => ({
      ...c,
      activities: c.activities.map((a, i) => (i === index ? value : a)),
    }));
  }

  function removeActivity(index) {
    setForm((c) => ({
      ...c,
      activities: c.activities.filter((_, i) => i !== index),
    }));
  }

  function validate() {
    const next = {};
    if (!form.destination.trim()) next.destination = "Enter a destination.";
    if (!form.startDate) next.startDate = "Pick a start date.";
    if (!form.endDate) next.endDate = "Pick an end date.";
    else if (form.startDate && form.endDate < form.startDate)
      next.endDate = "End date can't be before the start date.";
    return next;
  }

  function savePlan(event) {
    event.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const newPlan = {
      id: Date.now(),
      title: form.destination.trim() || "New plan",
      destination: form.destination.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      activities: form.activities.filter((a) => a.trim() !== ""),
      notes: form.notes,
      budget: Number(form.budget) || 0,
      spent: 0,
      budgetCategories: form.budgetCategories,
      template: selectedTemplate,
    };

    onSave?.(newPlan);
  }

  function handleCancel() {
    if (onCancel) onCancel();
    else router.push("/dashboard");
  }

  return (
    <Background>
      <div className="mx-auto max-w-5xl p-6 md:p-10">
        <TopNav />

        <div className="mt-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              New plan
            </h1>
            <p className="mt-2 text-white/70">
              {step === 1
                ? "Step 1 of 2: choose a template"
                : "Step 2 of 2: plan details"}
            </p>
          </div>
          <button type="button" onClick={handleCancel} className={ghostBtn}>
            Cancel
          </button>
        </div>

        <StepIndicator step={step} />

        {/* ---------------- STEP 1 ---------------- */}
        {step === 1 && (
          <section className="mt-8">
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
              {Object.entries(TEMPLATES).map(([name, t]) => (
                <TemplateCard
                  key={name}
                  name={name}
                  template={t}
                  selected={selectedTemplate === name}
                  onSelect={selectTemplate}
                />
              ))}
            </div>

            <p className="mt-6 text-white/70">
              The selected template pre-fills these. Everything stays editable.
            </p>

            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <PreviewSection
                title="Activities"
                items={template.activities.slice(0, 3)}
              />
              <PreviewSection
                title="Notes"
                items={template.notes ? [template.notes] : []}
              />
              <PreviewSection
                title="Budget categories"
                items={template.budgetCategories.slice(0, 3)}
              />
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className={primaryBtn}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {step === 2 && (
          <form
            onSubmit={savePlan}
            noValidate
            className="glass mt-8 flex flex-col gap-6 rounded-3xl p-6 md:p-8"
          >
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-white/70">Template</span>
              <strong className="rounded-full border border-white/30 bg-white/10 px-3 py-1">
                {selectedTemplate}
              </strong>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="underline underline-offset-4 text-white/80 hover:text-white"
              >
                Change
              </button>
            </div>

            <div>
              <label htmlFor="destination" className={label}>
                Destination
              </label>
              <input
                id="destination"
                value={form.destination}
                onChange={(e) => updateForm("destination", e.target.value)}
                placeholder="e.g. Kyoto, Japan"
                aria-invalid={!!errors.destination}
                aria-describedby={
                  errors.destination ? "destination-error" : undefined
                }
                className={`glass-input w-full rounded-xl px-4 py-3 ${errors.destination ? "is-error" : ""}`}
              />
              <FieldError id="destination-error">
                {errors.destination}
              </FieldError>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className={label}>
                  Start date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateForm("startDate", e.target.value)}
                  aria-invalid={!!errors.startDate}
                  aria-describedby={
                    errors.startDate ? "startDate-error" : undefined
                  }
                  className={`glass-input w-full rounded-xl px-4 py-3 [color-scheme:dark] ${errors.startDate ? "is-error" : ""}`}
                />
                <FieldError id="startDate-error">{errors.startDate}</FieldError>
              </div>
              <div>
                <label htmlFor="endDate" className={label}>
                  End date
                </label>
                <input
                  id="endDate"
                  type="date"
                  min={form.startDate}
                  value={form.endDate}
                  onChange={(e) => updateForm("endDate", e.target.value)}
                  aria-invalid={!!errors.endDate}
                  aria-describedby={
                    errors.endDate ? "endDate-error" : undefined
                  }
                  className={`glass-input w-full rounded-xl px-4 py-3 [color-scheme:dark] ${errors.endDate ? "is-error" : ""}`}
                />
                <FieldError id="endDate-error">{errors.endDate}</FieldError>
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
                {form.activities.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      value={activity}
                      onChange={(e) => updateActivity(index, e.target.value)}
                      placeholder="Activity"
                      aria-label={`Activity ${index + 1}`}
                      className="glass-input w-full rounded-xl px-4 py-3"
                    />
                    <button
                      type="button"
                      onClick={() => removeActivity(index)}
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
              <label htmlFor="notes" className={label}>
                Notes
              </label>
              <textarea
                id="notes"
                rows={5}
                value={form.notes}
                onChange={(e) => updateForm("notes", e.target.value)}
                placeholder="Add notes for this plan..."
                className="glass-input w-full resize-y rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label htmlFor="budget" className={label}>
                Total budget
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                  $
                </span>
                <input
                  id="budget"
                  type="number"
                  min="0"
                  step="1"
                  value={form.budget}
                  onChange={(e) => updateForm("budget", e.target.value)}
                  placeholder="2500"
                  className="glass-input w-full rounded-xl py-3 pl-8 pr-4"
                />
              </div>
              <p className="mt-2 text-sm text-white/60">
                This is the total amount the Budget tab compares your spending
                against.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={ghostBtn}
              >
                ← Back
              </button>
              <button type="submit" className={primaryBtn}>
                Save plan
              </button>
            </div>
          </form>
        )}
      </div>
    </Background>
  );
}
