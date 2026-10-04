import React, { useEffect, useState } from "react";
import "./EditPlan.css";

const createInitialForm = (plan) => ({
  destination: plan?.destination || "",
  startDate: plan?.startDate || "",
  endDate: plan?.endDate || "",
  budget: plan?.budget ?? "",
  activities: plan?.activities || [],
  notes: plan?.notes || "",
});

function formatDisplayDate(date) {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatus(startDate, endDate) {
  const today = new Date();

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);

  if (today < start) return "Upcoming";
  if (today > end) return "Completed";

  return "Ongoing";
}

function normalizeActivity(activity, index) {
  if (typeof activity === "string") {
    return {
      id: `activity-${index}`,
      title: activity,
    };
  }

  return {
    id:
      activity.id ||
      `activity-${index}`,
    title: activity.title || "",
  };
}

export default function EditPlan({
  plan,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(
    () => createInitialForm(plan)
  );

  const [errors, setErrors] = useState({});

  /*
   * If the selected plan changes while this
   * component remains mounted, refresh the
   * form with the new plan.
   */
  useEffect(() => {
    setForm(createInitialForm(plan));
    setErrors({});
  }, [plan]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  }

  function addActivity() {
    setForm((current) => ({
      ...current,
      activities: [
        ...current.activities,
        {
          id: `activity-${Date.now()}`,
          title: "",
        },
      ],
    }));
  }

  function updateActivity(id, value) {
    setForm((current) => ({
      ...current,
      activities: current.activities.map(
        (activity) =>
          activity.id === id
            ? {
                ...activity,
                title: value,
              }
            : activity
      ),
    }));
  }

  function removeActivity(id) {
    setForm((current) => ({
      ...current,
      activities: current.activities.filter(
        (activity) =>
          activity.id !== id
      ),
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.destination.trim()) {
      nextErrors.destination =
        "Destination is required.";
    }

    if (!form.startDate) {
      nextErrors.startDate =
        "Start date is required.";
    }

    if (!form.endDate) {
      nextErrors.endDate =
        "End date is required.";
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      nextErrors.endDate =
        "End date must be after the start date.";
    }

    if (
      form.budget === "" ||
      Number(form.budget) < 0
    ) {
      nextErrors.budget =
        "Enter a valid budget.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    const cleanedActivities =
      form.activities
        .map((activity) => ({
          ...activity,
          title: activity.title.trim(),
        }))
        .filter(
          (activity) => activity.title
        );

    const updatedPlan = {
      ...plan,

      destination:
        form.destination.trim(),

      startDate: form.startDate,
      endDate: form.endDate,

      budget: Number(form.budget),

      activities: cleanedActivities,

      notes: form.notes,

      /*
       * Expenses are deliberately preserved.
       * Editing the total plan budget does not
       * delete existing spending records.
       */
      expenses: plan.expenses || [],

      /*
       * Status is always derived from dates.
       */
      status: getStatus(
        form.startDate,
        form.endDate
      ),
    };

    onSave(updatedPlan);
  }

  const normalizedActivities =
    form.activities.map(
      normalizeActivity
    );

  return (
    <div className="edit-plan-page">
      <main className="edit-plan-container">
        {/* ==================================
            HEADER
        ================================== */}

        <header className="edit-plan-header">
          <div>
            <h1>Edit plan</h1>

            <p>{plan?.title}</p>
          </div>

          <button
            type="button"
            className="edit-cancel-top"
            onClick={onCancel}
          >
            Cancel
          </button>
        </header>

        <form
          className="edit-plan-form"
          onSubmit={handleSubmit}
        >
          {/* ==================================
              LEFT COLUMN
          ================================== */}

          <section className="edit-plan-card">
            <div className="field-group">
              <label htmlFor="destination">
                Destination
              </label>

              <input
                id="destination"
                type="text"
                value={form.destination}
                onChange={(event) =>
                  updateField(
                    "destination",
                    event.target.value
                  )
                }
                className={
                  errors.destination
                    ? "input-error"
                    : ""
                }
                placeholder="e.g. Bali, Indonesia"
              />

              {errors.destination && (
                <span className="field-error">
                  {errors.destination}
                </span>
              )}
            </div>

            <div className="date-grid">
              <div className="field-group">
                <label htmlFor="startDate">
                  Start date
                </label>

                <input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    updateField(
                      "startDate",
                      event.target.value
                    )
                  }
                  className={
                    errors.startDate
                      ? "input-error"
                      : ""
                  }
                />

                {errors.startDate && (
                  <span className="field-error">
                    {errors.startDate}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="endDate">
                  End date
                </label>

                <input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(event) =>
                    updateField(
                      "endDate",
                      event.target.value
                    )
                  }
                  className={
                    errors.endDate
                      ? "input-error"
                      : ""
                  }
                />

                {errors.endDate && (
                  <span className="field-error">
                    {errors.endDate}
                  </span>
                )}
              </div>
            </div>

            <div className="field-group">
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
                    updateField(
                      "budget",
                      event.target.value
                    )
                  }
                  className={
                    errors.budget
                      ? "input-error"
                      : ""
                  }
                  placeholder="2,000"
                />
              </div>

              {errors.budget && (
                <span className="field-error">
                  {errors.budget}
                </span>
              )}

              <p className="field-help">
                The Budget tab compares
                spending against this amount.
              </p>
            </div>
          </section>

          {/* ==================================
              RIGHT COLUMN
          ================================== */}

          <section className="edit-plan-card">
            <div className="field-group">
              <label>Activities</label>

              <div className="activity-chips">
                {normalizedActivities.map(
                  (activity) => (
                    <div
                      className="activity-chip"
                      key={activity.id}
                    >
                      <input
                        value={
                          activity.title
                        }
                        onChange={(event) =>
                          updateActivity(
                            activity.id,
                            event.target.value
                          )
                        }
                        aria-label="Activity"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeActivity(
                            activity.id
                          )
                        }
                        aria-label={`Remove ${activity.title}`}
                      >
                        ×
                      </button>
                    </div>
                  )
                )}

                <button
                  type="button"
                  className="add-activity-chip"
                  onClick={addActivity}
                >
                  + Add activity
                </button>
              </div>
            </div>

            <div className="field-group notes-group">
              <label htmlFor="notes">
                Notes
              </label>

              <textarea
                id="notes"
                value={form.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Add notes about this plan..."
              />
            </div>
          </section>

          {/* ==================================
              ACTIONS
          ================================== */}

          <div className="edit-plan-actions">
            <button
              type="submit"
              className="save-changes-button"
            >
              Save changes
            </button>

            <button
              type="button"
              className="edit-cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* ==================================
            FOOTER HELP
        ================================== */}

        <footer className="edit-plan-footer">
          <span>
            Save changes opens Plan details.
          </span>

          <span>
            Cancel returns to the page you
            came from.
          </span>

          <span>
            Dates automatically determine
            the plan status.
          </span>
        </footer>
      </main>
    </div>
  );
}