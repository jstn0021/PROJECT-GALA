"use client";

/**
 * Bucket list "New plan" page, with budget allocation added.
 * This is your bucket-list file plus:
 *   - BudgetAllocation component, peso formatter, toAllocations helper
 *   - form.allocations (replaces form.budgetCategories) + its handlers
 *   - allocation validation, saved as budgetAllocations
 *   - <BudgetAllocation /> in Step 2 under Total budget (inside the
 *     "invisible while searching" wrapper)
 *   - Family image path fixed to match the other four
 * Everything else (search overlap fix, place-name title, images) is unchanged.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Background } from "@/app/components/AuthCard";
import Navbar from "@/app/components/Navbar";
import LocationSearch from "@/app/components/LocationSearch";
import {
  useStoredState,
  PLANS_KEY,
  SEED_PLANS,
} from "@/app/components/usePlanStore";

/* ------------------------------------------------------------------ */
/* Templates                                                          */
/* ------------------------------------------------------------------ */
// Folder inside /public that holds the template photos.
// Change this one line if your folder has a different name.
const IMAGE_DIR = "/new-plan";

const TEMPLATES = {
  Blank: {
    description: "Start empty",
    image: `${IMAGE_DIR}/blank.jpg`,
    gradient: "",
    activities: [],
    notes: "",
    budgetCategories: [],
  },
  Weekend: {
    description: "A quick weekend escape",
    image: `${IMAGE_DIR}/weekend.jpg`,
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
    image: `${IMAGE_DIR}/solo.jpg`,
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
    image: `${IMAGE_DIR}/family.jpg`,
    gradient: "from-amber-300 to-emerald-400",
    activities: ["Family attraction", "Kid-friendly activity", "Family meal"],
    notes: "Leave some downtime between activities for the family.",
    budgetCategories: ["Accommodation", "Food", "Family activities"],
  },
  Adventure: {
    description: "Make the most of the outdoors",
    image: `${IMAGE_DIR}/adventure.jpg`,
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

const DEFAULT_GRADIENT = "from-teal-300 to-indigo-500";

// Mga reusable na class
const primaryBtn =
  "rounded-full bg-linear-to-r from-indigo-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.6)] transition hover:scale-105 active:scale-95";
const ghostBtn =
  "glass-dark rounded-full px-5 py-2.5 text-white/90 transition hover:bg-white/10";
const label = "mb-2 block text-sm font-medium text-white/80";

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
      {/* The <img> must sit INSIDE this relative box */}
      <div
        className={`relative h-32 overflow-hidden ${
          template.gradient
            ? `bg-gradient-to-br ${template.gradient}`
            : "border-b border-dashed border-white/30 bg-white/5"
        }`}
      >
        {template.image && (
          <img
            src={template.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
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
        <span className="text-sm font-medium text-white/80">
          Budget allocation
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSplit}
            disabled={total <= 0 || rows.length === 0}
            className="rounded-xl border border-white/30 bg-white/10 px-3 py-1.5 text-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Split evenly
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="glass-dark rounded-full px-3 py-1.5 text-sm transition hover:bg-white/10"
          >
            + Add category
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
        {total <= 0 && (
          <p className="mb-3 text-sm text-white/60">
            Enter a total budget above to start allocating it.
          </p>
        )}

        <div className="mb-1 flex justify-between text-xs text-white/65">
          <span>
            {peso(allocated)} of {peso(total)} allocated
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className={`h-full rounded-full transition-all ${
              over
                ? "bg-linear-to-r from-orange-300 to-red-400"
                : "bg-linear-to-r from-violet-400 via-blue-400 to-cyan-300"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p
          className={`mt-2 text-xs ${over ? "text-red-200" : "text-white/60"}`}
        >
          {over
            ? `${peso(-remaining)} over your total budget`
            : `${peso(remaining)} unallocated`}
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {rows.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/30 px-4 py-4 text-sm text-white/60">
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
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
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
                <span className="hidden w-10 shrink-0 text-right text-xs text-white/60 sm:block">
                  {share}%
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  aria-label={`Remove ${row.name || "category"}`}
                  className="h-12 w-12 shrink-0 rounded-xl border border-white/30 bg-white/10 text-xl transition hover:bg-white/20"
                >
                  ×
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
  const [, setPlans] = useStoredState(PLANS_KEY, SEED_PLANS);

  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState("Blank");
  const [errors, setErrors] = useState({});
  const [searching, setSearching] = useState(false);

  const [form, setForm] = useState({
    destination: initialDestination,
    location: null,
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

  function savePlan(event) {
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

    const newPlan = {
      id: Date.now(),
      title: form.location?.name || form.destination.trim() || "New plan",
      destination: form.destination.trim(),
      location: form.location,
      startDate: form.startDate,
      endDate: form.endDate,
      activities: form.activities.filter((a) => a.trim() !== ""),
      notes: form.notes,
      budget: totalBudget,
      spent: 0,
      // Same shape as before (array of names), so other pages keep working
      budgetCategories: budgetAllocations.map((a) => a.category),
      // How much of the budget goes to each category
      budgetAllocations,
      template: selectedTemplate,
      color: template.gradient || DEFAULT_GRADIENT, // kailangan ng My plans
    };

    if (onSave) {
      onSave(newPlan);
    } else {
      setPlans((cur) => [newPlan, ...cur]);
      router.push("/my-plans");
    }
  }

  function handleCancel() {
    if (onCancel) onCancel();
    else router.push("/dashboard");
  }

  return (
    <Background>
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 md:px-8 md:py-6 xl:px-12">
        <Navbar />

        <main className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
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
                The selected template pre-fills these. Everything stays
                editable.
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
              className="glass mt-8 flex w-full flex-col gap-6 rounded-3xl p-6 md:p-8"
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
                <LocationSearch
                  id="destination"
                  value={form.destination}
                  invalid={!!errors.destination}
                  onOpenChange={setSearching}
                  onChange={(text) => {
                    updateForm("destination", text);
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
                <FieldError id="destination-error">
                  {errors.destination}
                </FieldError>
              </div>

              {/* Nakatago habang bukas ang search results para walang overlap */}
              <div
                className={`flex flex-col gap-6 ${searching ? "invisible" : ""}`}
              >
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
                    <span className="text-sm font-medium text-white/80">
                      Activities
                    </span>
                    <button
                      type="button"
                      onClick={addActivity}
                      className="glass-dark rounded-full px-3 py-1.5 text-sm transition hover:bg-white/10"
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
                          onChange={(e) =>
                            updateActivity(index, e.target.value)
                          }
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
                  <p className="mt-2 text-sm text-white/60">
                    This is the total amount the Budget tab compares your
                    spending against.
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
              </div>
            </form>
          )}
        </main>
      </div>
    </Background>
  );
}
