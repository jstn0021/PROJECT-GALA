import React, { useMemo, useState } from "react";
import "./NewPlan.css";

const TEMPLATES = {
  Blank: {
    description: "Start empty",
    color: "blank",
    activities: [],
    notes: "",
    budgetCategories: [],
  },

  Weekend: {
    description: "A quick weekend escape",
    color: "weekend",
    activities: [
      "Explore the city",
      "Local food experience",
      "Relax and unwind",
    ],
    notes: "Keep the itinerary flexible and leave room for spontaneous plans.",
    budgetCategories: [
      "Accommodation",
      "Food",
      "Activities",
    ],
  },

  Solo: {
    description: "A trip built around you",
    color: "solo",
    activities: [
      "Explore independently",
      "Local food experience",
      "Personal free time",
    ],
    notes: "Prioritize experiences that you can enjoy at your own pace.",
    budgetCategories: [
      "Accommodation",
      "Food",
      "Transport",
    ],
  },

  Family: {
    description: "Something for everyone",
    color: "family",
    activities: [
      "Family attraction",
      "Kid-friendly activity",
      "Family meal",
    ],
    notes: "Leave some downtime between activities for the family.",
    budgetCategories: [
      "Accommodation",
      "Food",
      "Family activities",
    ],
  },

  Adventure: {
    description: "Make the most of the outdoors",
    color: "adventure",
    activities: [
      "Outdoor adventure",
      "Local exploration",
      "Adventure activity",
    ],
    notes: "Check weather and equipment requirements before activities.",
    budgetCategories: [
      "Accommodation",
      "Transport",
      "Adventure",
    ],
  },
};

function formatDate(date) {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function TemplateCard({
  name,
  template,
  selected,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={`template-card ${
        selected ? "selected" : ""
      }`}
      onClick={() => onSelect(name)}
    >
      <div className={`template-preview ${template.color}`}>
        {name === "Blank" && (
          <div className="blank-preview" />
        )}
      </div>

      <div className="template-card-content">
        <strong>{name}</strong>
        <span>{template.description}</span>
      </div>
    </button>
  );
}

function PreviewSection({
  title,
  children,
}) {
  return (
    <div className="preview-section">
      <h3>{title}</h3>

      <div className="preview-lines">
        {children}
      </div>
    </div>
  );
}

function TemplatePreview({
  template,
}) {
  return (
    <section className="template-preview-grid">
      <PreviewSection title="Activities">
        {template.activities.length > 0 ? (
          template.activities.slice(0, 3).map(
            (activity, index) => (
              <div
                className="preview-line"
                key={index}
              >
                {activity}
              </div>
            )
          )
        ) : (
          <>
            <div className="preview-line" />
            <div className="preview-line short" />
            <div className="preview-line shorter" />
          </>
        )}
      </PreviewSection>

      <PreviewSection title="Notes">
        {template.notes ? (
          <>
            <div className="preview-line">
              {template.notes}
            </div>
            <div className="preview-line short" />
          </>
        ) : (
          <>
            <div className="preview-line" />
            <div className="preview-line short" />
          </>
        )}
      </PreviewSection>

      <PreviewSection title="Budget categories">
        {template.budgetCategories.length > 0 ? (
          template.budgetCategories.slice(0, 3).map(
            (category, index) => (
              <div
                className="preview-line"
                key={index}
              >
                {category}
              </div>
            )
          )
        ) : (
          <>
            <div className="preview-line" />
            <div className="preview-line short" />
            <div className="preview-line shorter" />
          </>
        )}
      </PreviewSection>
    </section>
  );
}

function StepIndicator({ step }) {
  return (
    <div className="step-indicator">
      <span className={step === 1 ? "active" : ""}>
        Step 1
      </span>

      <div className="step-divider" />

      <span className={step === 2 ? "active" : ""}>
        Step 2
      </span>
    </div>
  );
}

export default function NewPlan({
  onCancel,
  onSave,
  initialDestination = "",
}) {
  const [step, setStep] = useState(1);

  const [selectedTemplate, setSelectedTemplate] =
    useState("Blank");

  const [form, setForm] = useState({
    destination: initialDestination,
    startDate: "",
    endDate: "",
    activities: [],
    notes: "",
    budget: "",
  });

  const selectedTemplateData = useMemo(
    () => TEMPLATES[selectedTemplate],
    [selectedTemplate]
  );

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function selectTemplate(name) {
    const template = TEMPLATES[name];

    setSelectedTemplate(name);

    setForm((current) => ({
      ...current,

      // Preserve destination because it may have
      // been supplied by Destination Viewing.
      destination:
        current.destination || initialDestination,

      activities: [...template.activities],

      notes: template.notes,

      // The categories themselves are retained here
      // so they can later be connected to a budget model.
      budgetCategories: [
        ...template.budgetCategories,
      ],
    }));
  }

  function continueToForm() {
    const template = TEMPLATES[selectedTemplate];

    setForm((current) => ({
      ...current,
      activities: [...template.activities],
      notes: template.notes,
      budgetCategories: [
        ...template.budgetCategories,
      ],
    }));

    setStep(2);
  }

  function addActivity() {
    setForm((current) => ({
      ...current,
      activities: [
        ...current.activities,
        "",
      ],
    }));
  }

  function updateActivity(index, value) {
    setForm((current) => ({
      ...current,
      activities: current.activities.map(
        (activity, activityIndex) =>
          activityIndex === index
            ? value
            : activity
      ),
    }));
  }

  function removeActivity(index) {
    setForm((current) => ({
      ...current,
      activities: current.activities.filter(
        (_, activityIndex) =>
          activityIndex !== index
      ),
    }));
  }

  function savePlan(event) {
    event.preventDefault();

    if (
      !form.destination ||
      !form.startDate ||
      !form.endDate
    ) {
      return;
    }

    const newPlan = {
      id: Date.now(),

      title:
        form.destination || "New plan",

      destination: form.destination,

      startDate: form.startDate,

      endDate: form.endDate,

      activities: form.activities.filter(
        (activity) => activity.trim() !== ""
      ),

      notes: form.notes,

      budget: Number(form.budget) || 0,

      spent: 0,

      budgetCategories:
        form.budgetCategories || [],

      template: selectedTemplate,
    };

    onSave(newPlan);
  }

  return (
    <div className="new-plan-page">
      <header className="new-plan-navbar">
        <div className="new-plan-logo">
          Logo
        </div>

        <nav>
          <button>Dashboard</button>
          <button className="active">
            My plans
          </button>
          <button>Bucket list</button>
          <button>Journal</button>
          <button>
            Explore <span>▾</span>
          </button>
        </nav>

        <button
          className="profile-circle"
          aria-label="Profile"
        />
      </header>

      <main className="new-plan-content">
        <div className="new-plan-heading">
          <div>
            <h1>New plan</h1>

            <p>
              {step === 1
                ? "Step 1 of 2: choose a template"
                : "Step 2 of 2: plan details"}
            </p>
          </div>

          <button
            className="cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>

        <StepIndicator step={step} />

        {step === 1 && (
          <section className="step-one">
            <div className="template-grid">
              {Object.entries(TEMPLATES).map(
                ([name, template]) => (
                  <TemplateCard
                    key={name}
                    name={name}
                    template={template}
                    selected={
                      selectedTemplate === name
                    }
                    onSelect={selectTemplate}
                  />
                )
              )}
            </div>

            <p className="template-helper">
              The selected template pre-fills these.
              Everything stays editable.
            </p>

            <TemplatePreview
              template={selectedTemplateData}
            />

            <p className="template-footer">
              Choosing a card opens Step 2, the plan
              form. Blank skips the pre-fill.
            </p>

            <div className="step-actions">
              <button
                className="continue-button"
                onClick={continueToForm}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <form
            className="plan-form"
            onSubmit={savePlan}
          >
            <div className="selected-template-label">
              <span>
                Template
              </span>

              <strong>
                {selectedTemplate}
              </strong>

              <button
                type="button"
                onClick={() => setStep(1)}
              >
                Change
              </button>
            </div>

            <div className="form-field">
              <label htmlFor="destination">
                Destination
              </label>

              <input
                id="destination"
                value={form.destination}
                onChange={(event) =>
                  updateForm(
                    "destination",
                    event.target.value
                  )
                }
                placeholder="e.g. Kyoto, Japan"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="startDate">
                  Start date
                </label>

                <input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    updateForm(
                      "startDate",
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="endDate">
                  End date
                </label>

                <input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  min={form.startDate}
                  onChange={(event) =>
                    updateForm(
                      "endDate",
                      event.target.value
                    )
                  }
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <div className="field-heading">
                <label>
                  Activities
                </label>

                <button
                  type="button"
                  className="add-button"
                  onClick={addActivity}
                >
                  + Add activity
                </button>
              </div>

              <div className="activities-editor">
                {form.activities.length === 0 && (
                  <div className="empty-form-row">
                    No activities yet. Add one to get
                    started.
                  </div>
                )}

                {form.activities.map(
                  (activity, index) => (
                    <div
                      className="activity-row"
                      key={index}
                    >
                      <input
                        value={activity}
                        onChange={(event) =>
                          updateActivity(
                            index,
                            event.target.value
                          )
                        }
                        placeholder="Activity"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeActivity(index)
                        }
                        aria-label="Remove activity"
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="notes">
                Notes
              </label>

              <textarea
                id="notes"
                value={form.notes}
                onChange={(event) =>
                  updateForm(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Add notes for this plan..."
                rows={5}
              />
            </div>

            <div className="form-field">
              <label htmlFor="budget">
                Total budget
              </label>

              <div className="budget-input">
                <span>$</span>

                <input
                  id="budget"
                  type="number"
                  min="0"
                  step="1"
                  value={form.budget}
                  onChange={(event) =>
                    updateForm(
                      "budget",
                      event.target.value
                    )
                  }
                  placeholder="2500"
                />
              </div>

              <small>
                This is the total amount the Budget tab
                compares your spending against.
              </small>
            </div>

            <div className="form-footer">
              <button
                type="button"
                className="back-step-button"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>

              <button
                type="submit"
                className="save-plan-button"
              >
                Save plan
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}