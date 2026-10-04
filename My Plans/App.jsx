import React, { useMemo, useState } from "react";
import "./App.css";

const initialPlans = [
  {
    id: 1,
    title: "Kyoto spring trip",
    destination: "Kyoto, Japan",
    startDate: "2027-03-12",
    endDate: "2027-03-18",
    spent: 1250,
    budget: 2200,
    color: "coral",
  },
  {
    id: 2,
    title: "Lisbon food trip",
    destination: "Lisbon, Portugal",
    startDate: "2027-06-02",
    endDate: "2027-06-06",
    spent: 540,
    budget: 1200,
    color: "yellow",
  },
  {
    id: 3,
    title: "Bali week",
    destination: "Bali, Indonesia",
    startDate: "2027-10-08",
    endDate: "2027-10-14",
    spent: 800,
    budget: 1700,
    color: "blue",
  },
  {
    id: 4,
    title: "Banff road trip",
    destination: "Banff, Canada",
    startDate: "2027-01-03",
    endDate: "2027-01-09",
    spent: 2600,
    budget: 2600,
    color: "green",
  },
  {
    id: 5,
    title: "Seoul city break",
    destination: "Seoul, South Korea",
    startDate: "2027-02-08",
    endDate: "2027-02-12",
    spent: 1800,
    budget: 1800,
    color: "green",
  },
  {
    id: 6,
    title: "Santorini getaway",
    destination: "Santorini, Greece",
    startDate: "2027-04-05",
    endDate: "2027-04-09",
    spent: 2100,
    budget: 2100,
    color: "yellow",
  },
];

const today = new Date();

function getStatus(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (today < start) return "Upcoming";
  if (today > end) return "Completed";
  return "Ongoing";
}

function formatDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  const startMonth = startDate.toLocaleDateString("en-US", {
    month: "short",
  });

  const endMonth = endDate.toLocaleDateString("en-US", {
    month: "short",
  });

  if (startMonth === endMonth) {
    return `${startDay} to ${endDay} ${startMonth}`;
  }

  return `${startDay} ${startMonth} to ${endDay} ${endMonth}`;
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function BudgetBar({ spent, budget }) {
  const percentage = Math.min((spent / budget) * 100, 100);

  return (
    <div className="budget-wrapper">
      <div className="budget-track">
        <div
          className="budget-progress"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  onOpen,
  onEdit,
  onDelete,
}) {
  const status = getStatus(plan.startDate, plan.endDate);

  return (
    <article
      className="plan-card"
      onClick={() => onOpen(plan)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen(plan);
      }}
    >
      <div className={`plan-thumbnail ${plan.color}`} />

      <div className="plan-content">
        <div className="plan-top">
          <div>
            <h3>{plan.title}</h3>
            <p className="destination">{plan.destination}</p>
            <p className="dates">
              {formatDateRange(plan.startDate, plan.endDate)}
            </p>
          </div>

          <span className={`status-pill ${status.toLowerCase()}`}>
            {status}
          </span>
        </div>

        <BudgetBar spent={plan.spent} budget={plan.budget} />

        <div
          className="card-actions"
          onClick={(event) => event.stopPropagation()}
        >
          <button onClick={() => onEdit(plan)}>Edit</button>
          <span>·</span>
          <button
            className="delete-link"
            onClick={() => onDelete(plan)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function DeleteModal({ item, onCancel, onConfirm }) {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="delete-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-icon">!</div>

        <h2>Delete this plan?</h2>

        <p>
          Are you sure you want to delete{" "}
          <strong>{item.title}</strong>? This action cannot be undone.
        </p>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onCancel}>
            Cancel
          </button>

          <button className="danger-button" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Header({ onNavigate }) {
  return (
    <header className="navbar">
      <div className="brand">Logo</div>

      <nav>
        <button onClick={() => onNavigate("dashboard")}>
          Dashboard
        </button>

        <button className="active">My plans</button>

        <button>Bucket list</button>
        <button>Journal</button>

        <button className="explore">
          Explore <span>▼</span>
        </button>
      </nav>

      <button className="profile-button" aria-label="Profile">
        <span />
      </button>
    </header>
  );
}

function PlanDetails({ plan, onBack, onEdit }) {
  const status = getStatus(plan.startDate, plan.endDate);
  const percentage = Math.min(
    Math.round((plan.spent / plan.budget) * 100),
    100
  );

  return (
    <main className="page">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <section className="details-panel">
        <div className={`details-image ${plan.color}`} />

        <div className="details-body">
          <span className={`status-pill ${status.toLowerCase()}`}>
            {status}
          </span>

          <h1>{plan.title}</h1>
          <p className="details-destination">{plan.destination}</p>

          <div className="detail-row">
            <span>Dates</span>
            <strong>
              {formatDateRange(plan.startDate, plan.endDate)}
            </strong>
          </div>

          <div className="detail-row">
            <span>Budget</span>
            <strong>{formatMoney(plan.budget)}</strong>
          </div>

          <div className="detail-row">
            <span>Spent</span>
            <strong>
              {formatMoney(plan.spent)} ({percentage}%)
            </strong>
          </div>

          <BudgetBar spent={plan.spent} budget={plan.budget} />

          <button
            className="primary-button"
            onClick={() => onEdit(plan)}
          >
            Edit plan
          </button>
        </div>
      </section>
    </main>
  );
}

function NewPlan({ onBack, templateMode = false, onCreate }) {
  const [title, setTitle] = useState(
    templateMode ? "New trip from template" : ""
  );
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!title || !destination || !startDate || !endDate) return;

    onCreate({
      id: Date.now(),
      title,
      destination,
      startDate,
      endDate,
      spent: 0,
      budget: Number(budget) || 0,
      color: "blue",
    });
  }

  return (
    <main className="page">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <section className="form-panel">
        <div className="form-heading">
          <span className="eyebrow">
            {templateMode ? "Template" : "Create"}
          </span>

          <h1>{templateMode ? "Start from a template" : "New plan"}</h1>
          <p>
            {templateMode
              ? "Customize the template for your next adventure."
              : "Create a plan for your next trip."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Plan name
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Japan adventure"
            />
          </label>

          <label>
            Destination
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Tokyo, Japan"
            />
          </label>

          <div className="form-grid">
            <label>
              Start date
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label>
              End date
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>

          <label>
            Total budget
            <input
              type="number"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="2200"
            />
          </label>

          <button className="primary-button full-width" type="submit">
            Create plan
          </button>
        </form>
      </section>
    </main>
  );
}

function EditPlan({ plan, onBack, onSave }) {
  const [form, setForm] = useState(plan);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave({
      ...form,
      budget: Number(form.budget),
      spent: Number(form.spent),
    });
  }

  return (
    <main className="page">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <section className="form-panel">
        <div className="form-heading">
          <span className="eyebrow">Plan</span>
          <h1>Edit plan</h1>
          <p>Update the details of your trip.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Plan name
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </label>

          <label>
            Destination
            <input
              value={form.destination}
              onChange={(e) =>
                update("destination", e.target.value)
              }
            />
          </label>

          <div className="form-grid">
            <label>
              Start date
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  update("startDate", e.target.value)
                }
              />
            </label>

            <label>
              End date
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  update("endDate", e.target.value)
                }
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Total budget
              <input
                type="number"
                value={form.budget}
                onChange={(e) =>
                  update("budget", e.target.value)
                }
              />
            </label>

            <label>
              Actual spending
              <input
                type="number"
                value={form.spent}
                onChange={(e) =>
                  update("spent", e.target.value)
                }
              />
            </label>
          </div>

          <button className="primary-button full-width" type="submit">
            Save changes
          </button>
        </form>
      </section>
    </main>
  );
}

export default function App() {
  const [plans, setPlans] = useState(initialPlans);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [templateMode, setTemplateMode] = useState(false);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      if (filter === "All") return true;
      return getStatus(plan.startDate, plan.endDate) === filter;
    });
  }, [plans, filter]);

  function openPlan(plan) {
    setSelectedPlan(plan);
    setPage("details");
  }

  function editPlan(plan) {
    setSelectedPlan(plan);
    setPage("edit");
  }

  function savePlan(updatedPlan) {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === updatedPlan.id ? updatedPlan : plan
      )
    );

    setSelectedPlan(updatedPlan);
    setPage("details");
  }

  function deletePlan() {
    if (!deleteTarget) return;

    setPlans((current) =>
      current.filter((plan) => plan.id !== deleteTarget.id)
    );

    setDeleteTarget(null);
  }

  function createPlan(newPlan) {
    setPlans((current) => [newPlan, ...current]);
    setPage("plans");
  }

  function navigate(destination) {
    if (destination === "dashboard") {
      setPage("dashboard");
    }
  }

  if (page === "dashboard") {
    return (
      <div className="app-shell">
        <Header onNavigate={navigate} />

        <main className="page">
          <section className="placeholder-page">
            <span className="eyebrow">Home</span>
            <h1>Dashboard</h1>
            <p>
              Your dashboard home would appear here.
            </p>

            <button
              className="primary-button"
              onClick={() => setPage("plans")}
            >
              View my plans
            </button>
          </section>
        </main>
      </div>
    );
  }

  if (page === "details" && selectedPlan) {
    return (
      <div className="app-shell">
        <Header onNavigate={navigate} />

        <PlanDetails
          plan={selectedPlan}
          onBack={() => setPage("plans")}
          onEdit={() => setPage("edit")}
        />
      </div>
    );
  }

  if (page === "edit" && selectedPlan) {
    return (
      <div className="app-shell">
        <Header onNavigate={navigate} />

        <EditPlan
          plan={selectedPlan}
          onBack={() => setPage("details")}
          onSave={savePlan}
        />
      </div>
    );
  }

  if (page === "new") {
    return (
      <div className="app-shell">
        <Header onNavigate={navigate} />

        <NewPlan
          templateMode={templateMode}
          onBack={() => setPage("plans")}
          onCreate={createPlan}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header onNavigate={navigate} />

      <main className="page">
        <button
          className="back-button"
          onClick={() => setPage("dashboard")}
        >
          ← Back
        </button>

        <div className="page-heading">
          <div>
            <h1>My plans</h1>
          </div>

          <div className="heading-actions">
            <button
              className="secondary-button"
              onClick={() => {
                setTemplateMode(true);
                setPage("new");
              }}
            >
              From template
            </button>

            <button
              className="primary-button"
              onClick={() => {
                setTemplateMode(false);
                setPage("new");
              }}
            >
              + New plan
            </button>
          </div>
        </div>

        <div className="filter-tabs">
          {["All", "Upcoming", "Ongoing", "Completed"].map(
            (tab) => (
              <button
                key={tab}
                className={filter === tab ? "selected" : ""}
                onClick={() => setFilter(tab)}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {filteredPlans.length > 0 ? (
          <section className="plans-grid">
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onOpen={openPlan}
                onEdit={editPlan}
                onDelete={setDeleteTarget}
              />
            ))}
          </section>
        ) : (
          <section className="empty-state">
            <span className="empty-label">Empty state</span>
            <strong>Create your first plan</strong>

            <button
              onClick={() => {
                setTemplateMode(false);
                setPage("new");
              }}
            >
              Create plan
            </button>
          </section>
        )}
      </main>

      <DeleteModal
        item={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deletePlan}
      />
    </div>
  );
}