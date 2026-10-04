import React, { useState } from "react";
import "./ProfileSettings.css";

export default function ProfileSettings({
  initialProfile = {
    name: "Your name",
    email: "name@company.com",
  },

  onBack,
  onLogout,
  onSave,
}) {
  const [name, setName] = useState(initialProfile.name);
  const [email, setEmail] = useState(initialProfile.email);
  const [password, setPassword] = useState("");

  const [saved, setSaved] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    const updatedProfile = {
      name,
      email,
      password,
    };

    setSaved(true);

    if (onSave) {
      onSave(updatedProfile);
    }

    // Password is cleared after saving.
    setPassword("");

    // Remove the success message after a short delay.
    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  function handleLogout() {
    /*
     * The parent application should switch to the
     * Front page visitor state here.
     */
    if (onLogout) {
      onLogout();
      return;
    }

    console.log("Logging out...");
  }

  return (
    <div className="profile-page">
      <main className="profile-shell">

        {/* ==========================================================
            TOP NAVIGATION
        ========================================================== */}

        <nav className="profile-nav">
          <div className="profile-logo">
            Logo
          </div>

          <button
            type="button"
            className="profile-nav-link"
          >
            Dashboard
          </button>

          <button
            type="button"
            className="profile-nav-link"
          >
            My plans
          </button>

          <button
            type="button"
            className="profile-nav-link"
          >
            Bucket list
          </button>

          <button
            type="button"
            className="profile-nav-link"
          >
            Journal
          </button>

          <button
            type="button"
            className="profile-nav-link profile-explore"
          >
            Explore <span>▾</span>
          </button>

          <button
            type="button"
            className="profile-avatar"
            aria-label="Profile"
          />
        </nav>

        {/* ==========================================================
            BACK
        ========================================================== */}

        <button
          type="button"
          className="profile-back"
          onClick={onBack}
        >
          ←&nbsp; Back
        </button>

        {/* ==========================================================
            PAGE TITLE
        ========================================================== */}

        <header className="profile-header">
          <h1>Profile &amp; settings</h1>
        </header>

        {/* ==========================================================
            PROFILE FORM
        ========================================================== */}

        <form
          className="profile-form"
          onSubmit={handleSubmit}
        >
          <div className="profile-card">

            {/* Name */}

            <div className="profile-field">
              <label htmlFor="profile-name">
                Name
              </label>

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            {/* Email */}

            <div className="profile-field">
              <label htmlFor="profile-email">
                Email
              </label>

              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="name@company.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}

            <div className="profile-field">
              <label htmlFor="profile-password">
                Change password
              </label>

              <input
                id="profile-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="New password"
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* ========================================================
              SAVE
          ======================================================== */}

          <div className="profile-actions">
            <button
              type="submit"
              className="save-profile-button"
            >
              Save changes
            </button>

            {saved && (
              <span className="save-message">
                Changes saved
              </span>
            )}
          </div>
        </form>

        {/* ==========================================================
            LOG OUT
        ========================================================== */}

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Log out
        </button>
      </main>
    </div>
  );
}