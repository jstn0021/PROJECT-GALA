"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Background } from "@/app/components/AuthCard";
import Navbar from "@/app/components/Navbar";
import LocationSearch from "@/app/components/LocationSearch";
import {
  GRID,
  PAGE_WRAP,
  PageHeader,
  CardImage,
  fieldLabel as label,
  Icon,
} from "@/app/components/ui";

/* New Plan-only na styles. Kapareho na ng Dashboard at My Plans ang panels,
   buttons at shadows. Hindi ginagalaw ang ui.jsx, kaya hindi apektado ang ibang pages. */
const PANEL =
  "rounded-3xl border border-gala-aqua/30 bg-linear-to-br from-gala-surface/90 via-gala-surface/85 to-[#172B3A]/90 backdrop-blur-md shadow-card";
const CARD = `group relative flex flex-col overflow-hidden ${PANEL} transition duration-300 hover:-translate-y-1 hover:shadow-lift`;
const gradientBtn =
  "bg-gala-accent font-bold text-gala-bg shadow-accent transition hover:scale-105 hover:brightness-110 hover:shadow-lift active:scale-95";
const primaryBtn = `rounded-full px-6 py-3 ${gradientBtn}`;
const ghostBtn =
  "rounded-full border border-gala-line bg-gala-raised/60 px-5 py-2.5 text-gala-text transition hover:bg-gala-raised active:scale-95";
const smallBtn =
  "rounded-full border border-gala-line bg-gala-raised/60 px-3 py-1.5 text-sm text-gala-text transition hover:bg-gala-raised active:scale-95";

/* ------------------------------------------------------------------ */
/* Templates                                                          */
/* ------------------------------------------------------------------ */
// Ang `gradient` ay kapareho ng COVERS sa My Plans page
const TEMPLATES = {
  Blank: {
    description: "Start empty",
    image: "/new-plan/blank.jpg",
    gradient: "from-gala-teal to-gala-raised",
    activities: [],
    notes: "",
    budgetCategories: [],
  },
  Weekend: {
    description: "A quick weekend escape",
    image: "/new-plan/weekend.jpg",
    gradient: "from-gala-gold to-gala-muted",
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
    image: "/new-plan/solo.jpg",
    gradient: "from-gala-aqua to-gala-teal",
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
    image: "/newplan/family.jpg",
    gradient: "from-gala-accent to-gala-teal",
    activities: ["Family attraction", "Kid-friendly activity", "Family meal"],
    notes: "Leave some downtime between activities for the family.",
    budgetCategories: ["Accommodation", "Food", "Family activities"],
  },
  Adventure: {
    description: "Make the most of the outdoors",
    image: "/new-plan/adventure.jpg",
    gradient: "from-gala-teal to-gala-accent",
    activities: [
      "Outdoor adventure",
      "Local exploration",
      "Adventure activity",
    ],
    notes: "Check weather and equipment requirements before activities.",
    budgetCategories: ["Accommodation", "Transport", "Adventure"],
  },
};

const peso = (n) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n || 0);

// Template category names -> editable allocation rows (amount starts empty)
const toAllocations = (names) => names.map((name) => ({ name, amount: "" }));

/* ------------------------------------------------------------------ */
/* Small components                                                   */
/* ------------------------------------------------------------------ */

function StepIndicator({ step }) {
  const item = (n) => (
    <span
      className={`rounded-full border px-4 py-1 text-sm ${
        step === n
          ? "border-gala-accent bg-gala-accent font-semibold text-gala-bg"
          : "border-gala-line bg-gala-raised/40 text-gala-muted"
      }`}
    >
      Step {n}
    </span>
  );
  return (
    <div className="flex items-center gap-3" aria-label={`Step ${step} of 2`}>
      {item(1)}
      <div className="h-px w-10 bg-gala-line" />
      {item(2)}
    </div>
  );
}

// Kapareho ng Explore card: 16/11 image + p-5 content
function TemplateCard({ name, template, selected, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(name)}
      className={`${CARD} text-left ${
        selected ? "outline outline-2 outline-offset-2 outline-gala-accent" : ""
      }`}
    >
      <CardImage src={template.image} alt="" gradient={template.gradient}>
        {selected && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gala-accent px-2.5 py-1 text-xs font-semibold text-gala-bg">
            <Icon name="check" className="h-3.5 w-3.5" />
            Selected
          </span>
        )}
      </CardImage>
      <div className="flex flex-1 flex-col p-5">
        <strong className="block text-xl font-bold tracking-tight text-gala-text transition group-hover:text-gala-accent">
          {name}
        </strong>
        <span className="mt-1 text-xs text-gala-muted">
          {template.description}
        </span>
      </div>
    </button>
  );
}

function PreviewSection({ title, items }) {
  return (
    <div className={`${PANEL} p-5`}>
      <h3 className="mb-3 font-semibold text-gala-text">{title}</h3>
      <div className="flex flex-col gap-2">
        {items.length > 0 ? (
          items.map((text, i) => (
            <div
              key={i}
              className="rounded-xl border border-gala-line bg-gala-raised/60 px-3 py-2 text-sm text-gala-text/80"
            >
              {text}
            </div>
          ))
        ) : (
          <>
            <div className="h-8 rounded-xl bg-gala-raised/60" />
            <div className="h-8 w-2/3 rounded-xl bg-gala-raised/60" />
            <div className="h-8 w-1/3 rounded-xl bg-gala-raised/60" />
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

/** Splits the total budget across categories and shows what's left. */
function BudgetAllocation({
  rows,
  total,
  error,
  onChange,
  onAdd,
  onRemove,
  onSplit,
}) {
  const allocated = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const remaining = total - allocated;
  const over = remaining < 0;
  const pct = total > 0 ? Math.min((allocated / total) * 100, 100) : 0;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-gala-text/80">
          Budget allocation
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSplit}
            disabled={total <= 0 || rows.length === 0}
            className={`${smallBtn} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Split evenly
          </button>
          <button type="button" onClick={onAdd} className={smallBtn}>
            + Add category
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gala-line bg-gala-bg/40 p-4">
        {total <= 0 && (
          <p className="mb-3 text-sm text-gala-muted">
            Enter a total budget above to start allocating it.
          </p>
        )}

        <div className="mb-1 flex justify-between text-xs text-gala-muted">
          <span>
            {peso(allocated)} of {peso(total)} allocated
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gala-text/15">
          <div
            className={`h-full rounded-full transition-all ${
              over
                ? "bg-linear-to-r from-gala-gold to-red-400"
                : "bg-linear-to-r from-gala-accent to-gala-teal"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p
          className={`mt-2 text-xs ${over ? "text-red-200" : "text-gala-muted"}`}
        >
          {over
            ? `${peso(-remaining)} over your total budget`
            : `${peso(remaining)} unallocated`}
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {rows.length === 0 && (
            <div className="rounded-xl border border-dashed border-gala-line px-4 py-4 text-sm text-gala-muted">
              No categories yet. Add one to start allocating.
            </div>
          )}

          {rows.map((row, i) => {
            const share =
              total > 0
                ? Math.round(((Number(row.amount) || 0) / total) * 100)
                : 0;
            return (
              <div key={i} className="flex items-center gap-3">
                <input
                  value={row.name}
                  onChange={(e) => onChange(i, "name", e.target.value)}
                  placeholder="Category"
                  aria-label={`Category ${i + 1} name`}
                  className="glass-input min-w-0 flex-1 rounded-xl px-4 py-3"
                />
                <div className="relative w-36 shrink-0 sm:w-44">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gala-muted">
                    ₱
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={row.amount}
                    onChange={(e) => onChange(i, "amount", e.target.value)}
                    placeholder="0"
                    aria-label={`${row.name || `Category ${i + 1}`} amount`}
                    className="glass-input w-full rounded-xl py-3 pl-7 pr-3"
                  />
                </div>
                <span className="hidden w-10 shrink-0 text-right text-xs text-gala-muted sm:block">
                  {share}%
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  aria-label={`Remove ${row.name || "category"}`}
                  className="h-12 w-12 shrink-0 rounded-xl border border-gala-line bg-gala-raised/60 text-xl transition hover:bg-gala-raised"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <FieldError id="allocation-error">{error}</FieldError>
    </div>
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
    location: null,
    image: null,
    startDate: "",
    endDate: "",
    activities: [],
    notes: "",
    budget: "",
    allocations: [], // [{ name, amount }]
  });

  const template = useMemo(
    () => TEMPLATES[selectedTemplate],
    [selectedTemplate],
  );

  const totalBudget = Number(form.budget) || 0;

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
      allocations: toAllocations(t.budgetCategories),
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

  /* ---- budget allocation ---- */
  function clearAllocationError() {
    if (errors.allocation) setErrors((e) => ({ ...e, allocation: undefined }));
  }

  function updateAllocation(index, field, value) {
    setForm((c) => ({
      ...c,
      allocations: c.allocations.map((a, i) =>
        i === index ? { ...a, [field]: value } : a,
      ),
    }));
    clearAllocationError();
  }

  function addAllocation() {
    setForm((c) => ({
      ...c,
      allocations: [...c.allocations, { name: "", amount: "" }],
    }));
  }

  function removeAllocation(index) {
    setForm((c) => ({
      ...c,
      allocations: c.allocations.filter((_, i) => i !== index),
    }));
    clearAllocationError();
  }

  function splitAllocationsEvenly() {
    setForm((c) => {
      const count = c.allocations.length;
      const total = Number(c.budget) || 0;
      if (count === 0 || total <= 0) return c;
      const base = Math.floor(total / count);
      const extra = total - base * count; // remainder goes to the first row
      return {
        ...c,
        allocations: c.allocations.map((a, i) => ({
          ...a,
          amount: String(base + (i === 0 ? extra : 0)),
        })),
      };
    });
    clearAllocationError();
  }

  function validate() {
    const next = {};
    if (!form.destination.trim()) next.destination = "Enter a destination.";
    if (!form.startDate) next.startDate = "Pick a start date.";
    if (!form.endDate) next.endDate = "Pick an end date.";
    else if (form.startDate && form.endDate < form.startDate)
      next.endDate = "End date can't be before the start date.";

    const allocated = form.allocations.reduce(
      (sum, a) => sum + (Number(a.amount) || 0),
      0,
    );
    if (form.allocations.some((a) => Number(a.amount) > 0 && !a.name.trim()))
      next.allocation = "Give every allocated amount a category name.";
    else if (allocated > totalBudget)
      next.allocation = `Allocations are ${peso(allocated - totalBudget)} over your total budget. Lower an amount or raise the budget.`;
    return next;
  }

  async function savePlan(event) {
    event.preventDefault();

    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) return;

    const budgetAllocations = form.allocations
      .filter((a) => a.name.trim() !== "")
      .map((a) => ({
        category: a.name.trim(),
        amount: Number(a.amount) || 0,
      }));

    const payload = {
      title: form.destination.trim(),
      destination: form.destination.trim(),
      image: form.image,
      startDate: form.startDate,
      endDate: form.endDate,
      activities: form.activities.filter((a) => a.trim() !== ""),
      notes: form.notes,
      budget: totalBudget,
      templateType: selectedTemplate,
      budgetAllocations,
    };

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Create plan failed:", result);

        setErrors((prev) => ({
          ...prev,
          submit:
            result.message || result.error?.message || "Failed to save plan.",
        }));
        return;
      }

      if (onSave) {
        await onSave(result);
      } else {
        router.push("/my-plans");
      }
    } catch (error) {
      console.error("Failed to save plan:", error);

      setErrors((prev) => ({
        ...prev,
        submit: "Unable to save plan. Please try again.",
      }));
    }
  }

  function handleCancel() {
    if (onCancel) onCancel();
    else router.push("/dashboard");
  }

  return (
    <Background>
      <div className={`${PAGE_WRAP} text-gala-text`}>
        <Navbar />

        <main className="flex flex-1 flex-col gap-6">
          <PageHeader
            title="New Plan"
            subtitle={
              step === 1
                ? "Step 1 of 2: choose a template"
                : "Step 2 of 2: plan details"
            }
            action={
              <button type="button" onClick={handleCancel} className={ghostBtn}>
                Cancel
              </button>
            }
          />

          <StepIndicator step={step} />

          {/* ---------------- STEP 1 ---------------- */}
          {step === 1 && (
            <section className="flex flex-col gap-6">
              <div className={GRID}>
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

              <p className="text-gala-muted">
                The selected template pre-fills these. Everything stays
                editable.
              </p>

              <div className="grid gap-5 md:grid-cols-3">
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

              <div className="flex justify-end">
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
              className={`${PANEL} flex w-full flex-col gap-6 p-6 md:p-8`}
            >
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-gala-muted">Template</span>
                <strong className="rounded-full border border-gala-line bg-gala-raised/60 px-3 py-1 text-gala-text">
                  {selectedTemplate}
                </strong>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gala-aqua underline underline-offset-4 transition hover:text-gala-accent"
                >
                  Change
                </button>
              </div>

              <div className="relative z-30">
                <label htmlFor="destination" className={label}>
                  Destination
                </label>
                <LocationSearch
                  id="destination"
                  value={form.destination}
                  invalid={!!errors.destination}
                  onChange={(text) => {
                    setForm((c) => ({
                      ...c,
                      destination: text,
                      location: null,
                      image: null,
                    }));
                  }}
                  onSelect={(loc) => {
                    setForm((c) => ({
                      ...c,
                      destination: loc.label,
                      location: loc,
                      image: loc.image || null,
                    }));

                    setErrors((e) => ({
                      ...e,
                      destination: undefined,
                    }));
                  }}
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
                  <FieldError id="startDate-error">
                    {errors.startDate}
                  </FieldError>
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
                  <span className="text-sm font-medium text-gala-text/80">
                    Activities
                  </span>
                  <button
                    type="button"
                    onClick={addActivity}
                    className={smallBtn}
                  >
                    + Add activity
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {form.activities.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gala-line px-4 py-4 text-sm text-gala-muted">
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
                        className="h-12 w-12 shrink-0 rounded-xl border border-gala-line bg-gala-raised/60 text-xl transition hover:bg-gala-raised"
                      >
                        <Icon name="close" className="h-4 w-4" />
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
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gala-muted">
                    ₱
                  </span>
                  <input
                    id="budget"
                    type="number"
                    min="0"
                    step="1"
                    value={form.budget}
                    onChange={(e) => updateForm("budget", e.target.value)}
                    placeholder="25000"
                    className="glass-input w-full rounded-xl py-3 pl-8 pr-4"
                  />
                </div>
                <p className="mt-2 text-sm text-gala-muted">
                  This is the total amount the Budget tab compares your spending
                  against.
                </p>
              </div>

              <BudgetAllocation
                rows={form.allocations}
                total={totalBudget}
                error={errors.allocation}
                onChange={updateAllocation}
                onAdd={addAllocation}
                onRemove={removeAllocation}
                onSplit={splitAllocationsEvenly}
              />

              {errors.submit && (
                <p className="text-sm text-red-300">{errors.submit}</p>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={ghostBtn}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon name="arrowLeft" className="h-4 w-4" />
                    Back
                  </span>
                </button>
                <button type="submit" className={primaryBtn}>
                  Save plan
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </Background>
  );
}