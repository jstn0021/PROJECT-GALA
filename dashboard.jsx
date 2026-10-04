import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  // Sample dashboard data
  const upcomingTrips = [
    {
      id: 1,
      title: "Kyoto spring trip",
      dates: "12 to 18 Mar",
      color: "pink",
    },
    {
      id: 2,
      title: "Lisbon food trip",
      dates: "2 to 6 Jun",
      color: "green",
    },
  ];

  const bucketPlaces = [
    { id: 1, name: "El Nido", color: "teal" },
    { id: 2, name: "Bali", color: "orange" },
    { id: 3, name: "Cusco", color: "blue" },
    { id: 4, name: "Lisbon", color: "yellow" },
  ];

  const recentActivities = [
    {
      id: 1,
      text: "Added expense to Bali trip",
      destination: "/plans/bali",
    },
    {
      id: 2,
      text: "Marked Santorini as done",
      destination: "/bucket-list",
    },
    {
      id: 3,
      text: "Created plan from Weekend template",
      destination: "/plans",
    },
  ];

  const completedTrips = [
    {
      id: 1,
      title: "Santorini getaway",
      subtitle: "Opens its journal entry",
    },
  ];

  const bucketCompleted = 3;
  const bucketTotal = 10;
  const bucketPercentage = (bucketCompleted / bucketTotal) * 100;

  return (
    <div className="dashboard-page">

      {/* ================= NAVIGATION ================= */}
      <header className="dashboard-nav">

        <div
          className="nav-logo"
          onClick={() => navigate("/dashboard")}
        >
          Logo
        </div>

        <nav className="nav-links">
          <button
            className="nav-link active"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          <button
            className="nav-link"
            onClick={() => navigate("/plans")}
          >
            My plans
          </button>

          <button
            className="nav-link"
            onClick={() => navigate("/bucket-list")}
          >
            Bucket list
          </button>

          <button
            className="nav-link"
            onClick={() => navigate("/journal")}
          >
            Journal
          </button>

          <button
            className="nav-link"
            onClick={() => navigate("/explore")}
          >
            Explore ▼
          </button>
        </nav>

        <button
          className="profile-button"
          aria-label="Profile"
          onClick={() => navigate("/profile")}
        >
          <span></span>
        </button>

      </header>


      {/* ================= WELCOME SECTION ================= */}
      <section className="welcome-section">

        <div>
          <h1>Welcome back, Name</h1>
        </div>

        <button
          className="new-plan-button"
          onClick={() => navigate("/new-plan")}
        >
          + New plan
        </button>

      </section>


      {/* ================= SUMMARY CARDS ================= */}
      <section className="summary-grid">

        <button
          className="summary-card"
          onClick={() => navigate("/plans?filter=upcoming")}
        >
          <strong>2</strong>
          <span>Upcoming trips</span>
        </button>

        <button
          className="summary-card"
          onClick={() => navigate("/bucket-list")}
        >
          <strong>8</strong>
          <span>Bucket list places</span>
        </button>

        <button
          className="summary-card"
          onClick={() => navigate("/bucket-list")}
        >
          <strong>
            {bucketCompleted} of {bucketTotal}
          </strong>
          <span>Bucket list done</span>
        </button>

        <button
          className="summary-card"
          onClick={() => navigate("/journal")}
        >
          <strong>3</strong>
          <span>Completed trips</span>
        </button>

      </section>


      {/* ================= TOP CONTENT ================= */}
      <section className="dashboard-top-grid">

        {/* UPCOMING TRIPS */}
        <div className="dashboard-section">

          <div className="section-title">
            <h2>Upcoming trips</h2>
          </div>

          <div className="trip-list">

            {upcomingTrips.map((trip) => (
              <button
                className="trip-card"
                key={trip.id}
                onClick={() => navigate(`/plans/${trip.id}`)}
              >

                <div className={`trip-thumbnail ${trip.color}`}>
                  <span></span>
                </div>

                <div className="trip-information">
                  <strong>{trip.title}</strong>
                  <span>{trip.dates}</span>
                </div>

              </button>
            ))}

          </div>

        </div>


        {/* BUCKET LIST PROGRESS */}
        <div className="dashboard-section">

          <div className="section-title">
            <h2>Bucket list progress</h2>
          </div>

          <div className="bucket-progress-card">

            <div className="progress-text">
              {bucketCompleted} of {bucketTotal} completed
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${bucketPercentage}%` }}
              ></div>
            </div>

            <button
              className="open-button"
              onClick={() => navigate("/bucket-list")}
            >
              Open bucket list
            </button>

          </div>

        </div>

      </section>


      {/* ================= BUCKET LIST ================= */}
      <section className="dashboard-section bucket-section">

        <div className="section-heading-row">
          <h2>From your bucket list</h2>

          <button
            className="text-button"
            onClick={() => navigate("/bucket-list")}
          >
            Open bucket list
          </button>
        </div>


        <div className="bucket-grid">

          {bucketPlaces.map((place) => (
            <button
              className="bucket-tile"
              key={place.id}
              onClick={() =>
                navigate(`/destination/${place.id}`)
              }
            >

              <div
                className={`bucket-image ${place.color}`}
              ></div>

              <span>{place.name}</span>

            </button>
          ))}

        </div>

      </section>


      {/* ================= LOWER CONTENT ================= */}
      <section className="dashboard-bottom-grid">

        {/* RECENT ACTIVITY */}
        <div className="dashboard-section">

          <div className="section-heading-row">
            <h2>Recent activity</h2>

            <button
              className="text-button"
              onClick={() => navigate("/activity")}
            >
              View all activity
            </button>
          </div>

          <div className="activity-list">

            {recentActivities.map((activity) => (
              <button
                className="activity-row"
                key={activity.id}
                onClick={() => navigate(activity.destination)}
              >
                {activity.text}
              </button>
            ))}

          </div>

        </div>


        {/* COMPLETED TRIPS */}
        <div className="dashboard-section">

          <div className="section-heading-row">
            <h2>Completed trips</h2>

            <button
              className="text-button"
              onClick={() => navigate("/journal")}
            >
              Open journal
            </button>
          </div>

          <div className="completed-list">

            {completedTrips.map((trip) => (
              <button
                className="completed-card"
                key={trip.id}
                onClick={() =>
                  navigate(`/journal/${trip.id}`)
                }
              >

                <div className="completed-thumbnail">
                  <span></span>
                </div>

                <div>
                  <strong>{trip.title}</strong>
                  <small>{trip.subtitle}</small>
                </div>

              </button>
            ))}

          </div>

        </div>

      </section>


      {/* ================= EMPTY STATE ================= */}
      <section className="empty-state">

        <p>Empty state for new users</p>

        <h2>Create your first trip</h2>

        <div className="empty-buttons">

          <button
            className="new-plan-button"
            onClick={() => navigate("/new-plan")}
          >
            + New plan
          </button>

          <button
            className="explore-button"
            onClick={() => navigate("/explore")}
          >
            Explore
          </button>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;