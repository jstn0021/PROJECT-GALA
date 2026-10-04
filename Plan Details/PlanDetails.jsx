import React, { useMemo, useState } from "react";
import "./PlanDetails.css";

const BUDGET_CATEGORIES = [
  "Transport",
  "Stay",
  "Food",
  "Activities",
  "Shopping",
  "Other",
];

function getStatus(startDate, endDate) {
  const today = new Date();

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);

  if (today < start) return "Upcoming";
  if (today > end) return "Completed";

  return "Ongoing";
}

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return "";

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const startDay = start.getDate();
  const endDay = end.getDate();

  const startMonth = start.toLocaleDateString(
    "en-US",
    {
      month: "short",
    }
  );

  const endMonth = end.toLocaleDateString(
    "en-US",
    {
      month: "short",
    }
  );

  return `${startDay} ${startMonth} to ${endDay} ${endMonth}`;
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function getDifference(estimated, actual) {
  return Number(estimated || 0) - Number(actual || 0);
}

/* =========================================
   HEADER
========================================= */

function PlanHeader({
  plan,
  onBack,
  onEdit,
  onDelete,
}) {
  const status = getStatus(
    plan.startDate,
    plan.endDate
  );

  return (
    <>
      <button
        className="pd-back-button"
        onClick={onBack}
      >
        ← Back
      </button>

      <header className="pd-header">
        <div className="pd-plan-heading">
          <div
            className={`pd-plan-thumbnail ${
              plan.color || "blue"
            }`}
          />

          <div>
            <div className="pd-title-row">
              <h1>{plan.title}</h1>

              <span
                className={`pd-status ${
                  status.toLowerCase()
                }`}
              >
                {status}
              </span>
            </div>

            <p>
              {plan.destination} ·{" "}
              {formatDateRange(
                plan.startDate,
                plan.endDate
              )}
            </p>
          </div>
        </div>

        <div className="pd-header-actions">
          <button
            className="pd-edit-button"
            onClick={onEdit}
          >
            Edit
          </button>

          <button
            className="pd-delete-button"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </header>
    </>
  );
}

/* =========================================
   TABS
========================================= */

function PlanTabs({
  activeTab,
  onChange,
}) {
  const tabs = [
    "Overview",
    "Activities",
    "Notes",
    "Budget",
  ];

  return (
    <div className="pd-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={
            activeTab === tab
              ? "active"
              : ""
          }
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

/* =========================================
   OVERVIEW
========================================= */

function OverviewTab({ plan }) {
  return (
    <section className="pd-overview">
      <div className="overview-grid">
        <div className="overview-card">
          <span>Destination</span>
          <strong>{plan.destination}</strong>
        </div>

        <div className="overview-card">
          <span>Dates</span>
          <strong>
            {formatDateRange(
              plan.startDate,
              plan.endDate
            )}
          </strong>
        </div>

        <div className="overview-card">
          <span>Status</span>
          <strong>
            {getStatus(
              plan.startDate,
              plan.endDate
            )}
          </strong>
        </div>

        <div className="overview-card">
          <span>Total budget</span>
          <strong>
            {formatMoney(plan.budget)}
          </strong>
        </div>
      </div>

      <div className="summary-card">
        <h2>Summary</h2>

        <p>
          {plan.summary ||
            `Your ${plan.title} trip to ${
              plan.destination
            } is planned for ${formatDateRange(
              plan.startDate,
              plan.endDate
            )}.`}
        </p>
      </div>
    </section>
  );
}

/* =========================================
   ACTIVITIES
========================================= */

function ActivitiesTab({
  activities = [],
  onChange,
}) {
  const [newActivity, setNewActivity] =
    useState("");

  function addActivity() {
    const value = newActivity.trim();

    if (!value) return;

    onChange([
      ...activities,
      {
        id: Date.now(),
        title: value,
        completed: false,
      },
    ]);

    setNewActivity("");
  }

  function updateActivity(id, value) {
    onChange(
      activities.map((activity) =>
        activity.id === id
          ? {
              ...activity,
              title: value,
            }
          : activity
      )
    );
  }

  function toggleActivity(id) {
    onChange(
      activities.map((activity) =>
        activity.id === id
          ? {
              ...activity,
              completed:
                !activity.completed,
            }
          : activity
      )
    );
  }

  function removeActivity(id) {
    onChange(
      activities.filter(
        (activity) =>
          activity.id !== id
      )
    );
  }

  return (
    <section className="pd-activities">
      <div className="section-heading">
        <div>
          <h2>Activities</h2>
          <p>
            Add and manage activities for
            this plan.
          </p>
        </div>
      </div>

      <div className="activity-list">
        {activities.length === 0 && (
          <div className="pd-empty">
            No activities yet.
          </div>
        )}

        {activities.map((activity) => (
          <div
            className={`activity-item ${
              activity.completed
                ? "completed"
                : ""
            }`}
            key={activity.id}
          >
            <button
              className="activity-check"
              onClick={() =>
                toggleActivity(
                  activity.id
                )
              }
              aria-label="Toggle activity"
            >
              {activity.completed
                ? "✓"
                : ""}
            </button>

            <input
              value={activity.title}
              onChange={(event) =>
                updateActivity(
                  activity.id,
                  event.target.value
                )
              }
            />

            <button
              className="activity-remove"
              onClick={() =>
                removeActivity(
                  activity.id
                )
              }
              aria-label="Remove activity"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="add-activity">
        <input
          value={newActivity}
          onChange={(event) =>
            setNewActivity(
              event.target.value
            )
          }
          placeholder="Add an activity..."
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              addActivity();
            }
          }}
        />

        <button
          onClick={addActivity}
        >
          + Add activity
        </button>
      </div>
    </section>
  );
}

/* =========================================
   NOTES
========================================= */

function NotesTab({
  notes,
  onChange,
}) {
  return (
    <section className="pd-notes">
      <div className="section-heading">
        <div>
          <h2>Notes</h2>
          <p>
            Keep useful information about
            this trip here.
          </p>
        </div>
      </div>

      <textarea
        value={notes || ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Write notes about your plan..."
      />

      <div className="notes-hint">
        Changes are saved automatically.
      </div>
    </section>
  );
}

/* =========================================
   BUDGET
========================================= */

function buildBudgetRows(expenses = []) {
  return BUDGET_CATEGORIES.map(
    (category) => {
      const categoryExpenses =
        expenses.filter(
          (expense) =>
            expense.category ===
            category
        );

      const estimated =
        categoryExpenses
          .filter(
            (expense) =>
              expense.type ===
              "estimated"
          )
          .reduce(
            (total, expense) =>
              total +
              Number(expense.amount),
            0
          );

      const actual =
        categoryExpenses
          .filter(
            (expense) =>
              expense.type === "actual"
          )
          .reduce(
            (total, expense) =>
              total +
              Number(expense.amount),
            0
          );

      return {
        category,
        estimated,
        actual,
        difference:
          estimated - actual,
      };
    }
  );
}

function BudgetTable({
  expenses,
}) {
  const rows = buildBudgetRows(
    expenses
  );

  const totalEstimated =
    rows.reduce(
      (total, row) =>
        total + row.estimated,
      0
    );

  const totalActual =
    rows.reduce(
      (total, row) =>
        total + row.actual,
      0
    );

  const totalDifference =
    totalEstimated - totalActual;

  return (
    <div className="budget-table-wrapper">
      <table className="budget-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Estimated</th>
            <th>Actual</th>
            <th>Difference</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.category}>
              <td>{row.category}</td>

              <td>
                {formatMoney(
                  row.estimated
                )}
              </td>

              <td>
                {formatMoney(
                  row.actual
                )}
              </td>

              <td
                className={
                  row.difference < 0
                    ? "negative"
                    : "positive"
                }
              >
                {row.difference >= 0
                  ? "+"
                  : "−"}
                {formatMoney(
                  Math.abs(
                    row.difference
                  )
                )}
              </td>
            </tr>
          ))}

          <tr className="total-row">
            <td>Total</td>

            <td>
              {formatMoney(
                totalEstimated
              )}
            </td>

            <td>
              {formatMoney(
                totalActual
              )}
            </td>

            <td
              className={
                totalDifference < 0
                  ? "negative"
                  : "positive"
              }
            >
              {totalDifference >= 0
                ? "+"
                : "−"}
              {formatMoney(
                Math.abs(
                  totalDifference
                )
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function BudgetSummary({
  budget,
  expenses,
  onAddExpense,
}) {
  const actual = expenses
    .filter(
      (expense) =>
        expense.type === "actual"
    )
    .reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0
    );

  const totalBudget =
    Number(budget) || 0;

  const difference =
    totalBudget - actual;

  const percentage =
    totalBudget > 0
      ? Math.min(
          (actual / totalBudget) *
            100,
          100
        )
      : 0;

  const isOverBudget =
    difference < 0;

  return (
    <div
      className={`budget-summary ${
        isOverBudget
          ? "over-budget"
          : ""
      }`}
    >
      <div className="budget-summary-top">
        <strong>
          {formatMoney(actual)} spent of{" "}
          {formatMoney(totalBudget)} total
          budget
        </strong>

        <button
          onClick={onAddExpense}
        >
          + Add expense
        </button>
      </div>

      <div className="budget-progress">
        <div
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p
        className={
          isOverBudget
            ? "over-text"
            : "under-text"
        }
      >
        {isOverBudget
          ? `Over budget by ${formatMoney(
              Math.abs(difference)
            )}`
          : `Under budget by ${formatMoney(
              difference
            )}`}
      </p>
    </div>
  );
}

function BudgetTab({
  plan,
  expenses,
  onAddExpense,
}) {
  return (
    <section className="pd-budget">
      <BudgetTable
        expenses={expenses}
      />

      <BudgetSummary
        budget={plan.budget}
        expenses={expenses}
        onAddExpense={onAddExpense}
      />

      <p className="budget-note">
        Difference = Estimated − Actual.
      </p>
    </section>
  );
}

/* =========================================
   ADD EXPENSE MODAL
========================================= */

function AddExpenseModal({
  onCancel,
  onAdd,
}) {
  const [form, setForm] =
    useState({
      category: "Transport",
      description: "",
      amount: "",
      type: "actual",
    });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function submit(event) {
    event.preventDefault();

    if (
      !form.description.trim() ||
      Number(form.amount) <= 0
    ) {
      return;
    }

    onAdd({
      id: Date.now(),
      category: form.category,
      description:
        form.description.trim(),
      amount: Number(form.amount),
      type: form.type,
    });
  }

  return (
    <div
      className="pd-modal-overlay"
      onClick={onCancel}
    >
      <div
        className="expense-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">
              Budget
            </span>

            <h2>Add expense</h2>
          </div>

          <button
            className="modal-close"
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-field">
            <label>
              Category
            </label>

            <select
              value={form.category}
              onChange={(event) =>
                update(
                  "category",
                  event.target.value
                )
              }
            >
              {BUDGET_CATEGORIES.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="modal-field">
            <label>
              Description
            </label>

            <input
              value={form.description}
              onChange={(event) =>
                update(
                  "description",
                  event.target.value
                )
              }
              placeholder="e.g. Hotel deposit"
            />
          </div>

          <div className="modal-field">
            <label>
              Amount
            </label>

            <div className="modal-money-input">
              <span>$</span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  update(
                    "amount",
                    event.target.value
                  )
                }
                placeholder="0"
              />
            </div>
          </div>

          <div className="modal-field">
            <label>
              Expense type
            </label>

            <div className="expense-type-options">
              <button
                type="button"
                className={
                  form.type ===
                  "estimated"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  update(
                    "type",
                    "estimated"
                  )
                }
              >
                Estimated
              </button>

              <button
                type="button"
                className={
                  form.type === "actual"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  update(
                    "type",
                    "actual"
                  )
                }
              >
                Actual
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="modal-add"
            >
              Add expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================
   DELETE MODAL
========================================= */

function DeletePlanModal({
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="pd-modal-overlay"
      onClick={onCancel}
    >
      <div
        className="delete-plan-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="delete-icon">
          !
        </div>

        <h2>Delete this plan?</h2>

        <p>
          This will permanently delete the
          plan and remove its Journal entry.
          This action cannot be undone.
        </p>

        <div className="delete-modal-actions">
          <button
            className="modal-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="modal-delete"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   MAIN COMPONENT
========================================= */

export default function PlanDetails({
  plan,
  onBack,
  onEdit,
  onDelete,
  onPlanChange,
}) {
  const [activeTab, setActiveTab] =
    useState("Budget");

  const [showExpenseModal, setShowExpenseModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [expenses, setExpenses] =
    useState(plan.expenses || []);

  const [activities, setActivities] =
    useState(
      plan.activities || []
    );

  const [notes, setNotes] = useState(
    plan.notes || ""
  );

  function updatePlan(changes) {
    onPlanChange({
      ...plan,
      ...changes,
    });
  }

  function handleActivitiesChange(
    updatedActivities
  ) {
    setActivities(updatedActivities);

    updatePlan({
      activities:
        updatedActivities,
    });
  }

  function handleNotesChange(
    updatedNotes
  ) {
    setNotes(updatedNotes);

    updatePlan({
      notes: updatedNotes,
    });
  }

  function addExpense(expense) {
    const updatedExpenses = [
      ...expenses,
      expense,
    ];

    setExpenses(updatedExpenses);

    updatePlan({
      expenses: updatedExpenses,
    });

    setShowExpenseModal(false);
  }

  function confirmDelete() {
    setShowDeleteModal(false);

    /*
     * onDelete should remove this plan
     * from the main plans collection.
     *
     * Because the Journal derives its entries
     * from completed plans, deleting the plan
     * also removes its Journal entry.
     */
    onDelete(plan);
  }

  return (
    <div className="plan-details-page">
      <main className="plan-details-container">
        <PlanHeader
          plan={plan}
          onBack={onBack}
          onEdit={onEdit}
          onDelete={() =>
            setShowDeleteModal(true)
          }
        />

        <PlanTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="pd-tab-content">
          {activeTab === "Overview" && (
            <OverviewTab plan={plan} />
          )}

          {activeTab === "Activities" && (
            <ActivitiesTab
              activities={activities}
              onChange={
                handleActivitiesChange
              }
            />
          )}

          {activeTab === "Notes" && (
            <NotesTab
              notes={notes}
              onChange={
                handleNotesChange
              }
            />
          )}

          {activeTab === "Budget" && (
            <BudgetTab
              plan={plan}
              expenses={expenses}
              onAddExpense={() =>
                setShowExpenseModal(true)
              }
            />
          )}
        </div>
      </main>

      {showExpenseModal && (
        <AddExpenseModal
          onCancel={() =>
            setShowExpenseModal(false)
          }
          onAdd={addExpense}
        />
      )}

      {showDeleteModal && (
        <DeletePlanModal
          onCancel={() =>
            setShowDeleteModal(false)
          }
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}