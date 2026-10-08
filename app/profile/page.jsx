"use client";

/**
 * app/profile/page.jsx
 * Personal info page (front-end only: everything is saved in this browser's
 * localStorage for now). Sections:
 *   1. Basic info   2. Travel preferences   3. Account
 *
 * The navbar avatar refreshes by remounting <Navbar /> after each save, so
 * this is the only file you need to change.
 *
 * Redirects:
 *   - Log out        -> handled by your existing <LogoutButton />
 *   - Change password -> CHANGE_PASSWORD_HREF
 *   - Delete account  -> LOGIN_HREF (after clearing the local data)
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import LogoutButton from "@/app/components/LogoutButton";

/* ---- change these if your routes are named differently ---- */
const CHANGE_PASSWORD_HREF = "/change-password";
const LOGIN_HREF = "/login";

const PROFILE_KEY = "gala-profile";
const STYLES = ["Weekend", "Solo", "Family", "Adventure"];
const EMPTY = {
  birthday: "",
  style: "",
};

/* ---------------- helpers ---------------- */

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Crop to a centered square and shrink, so the saved photo stays small
async function resizeToSquare(file, size = 192) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas
    .getContext("2d")
    .drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size,
    );
  return canvas.toDataURL("image/jpeg", 0.85);
}

const inputClass = "glass-input w-full rounded-xl px-4 py-2.5 text-sm";
const ghostButton =
  "rounded-full border border-white/35 bg-white/10 px-5 py-2 text-sm font-medium transition hover:bg-white/20";

function Avatar({ photo, name, size = 88 }) {
  const initial = (name?.trim()[0] || "T").toUpperCase();
  return photo ? (
    <img
      src={photo}
      alt=""
      style={{ width: size, height: size }}
      className="rounded-full object-cover"
    />
  ) : (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      className="grid place-items-center rounded-full bg-linear-to-br from-teal-300 to-indigo-500 font-semibold text-white"
    >
      {initial}
    </span>
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
        checked
          ? "border-teal-200/60 bg-teal-500/70"
          : "border-white/30 bg-white/15"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-white/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-white/55">{hint}</span>}
    </label>
  );
}

function Section({ title, subtitle, children, onSave, saved }) {
  return (
    <section className="glass flex flex-col gap-5 rounded-3xl p-6">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-white/65">{subtitle}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
      {onSave && (
        <div className="mt-auto flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onSave}
            className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-semibold shadow-[0_0_18px_rgba(20,184,166,0.45)] transition hover:bg-teal-400 active:scale-95"
          >
            Save changes
          </button>
          <span role="status" className="text-sm text-teal-100">
            {saved ? "Saved ✓" : ""}
          </span>
        </div>
      )}
    </section>
  );
}

/* ---------------- page ---------------- */

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [reminders, setReminders] = useState(true);
  const [savedId, setSavedId] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  // Changing this remounts <Navbar key={navKey} />, so the avatar shows the new photo/name
  const [navKey, setNavKey] = useState(0);

  function persist(key, value) {
    write(key, value);
    setNavKey((k) => k + 1);
  }

  // Load saved values, and the email/name from /api/me
  useEffect(() => {
    setPhoto(read("gala-avatar", null));
    setName(read("gala-name", null) ?? "");
    setReminders(read("gala-reminders", true));
    setForm({ ...EMPTY, ...read(PROFILE_KEY, {}) });

    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => {
        if (!alive) return;
        setEmail(d.email ?? "");
        setName((n) => n || d.name || "");
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Saves only the fields that belong to one section
  function save(id, keys) {
    const next = { ...read(PROFILE_KEY, {}) };
    keys.forEach((k) => {
      next[k] = form[k];
    });
    persist(PROFILE_KEY, next);
    if (id === "basic") persist("gala-name", name.trim() || null);
    setSavedId(id);
    setTimeout(() => setSavedId((cur) => (cur === id ? "" : cur)), 2500);
  }

  // Travel style: updates the screen AND saves right away (like the reminders
  // switch), so a click is never lost if "Save changes" isn't pressed.
  function chooseStyle(style) {
    const next = form.style === style ? "" : style; // click again to deselect
    setForm((f) => ({ ...f, style: next }));
    write(PROFILE_KEY, { ...read(PROFILE_KEY, {}), style: next });
  }

  async function handlePhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow choosing the same file again
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be under 5 MB.");
      return;
    }
    try {
      const dataUrl = await resizeToSquare(file);
      setPhoto(dataUrl);
      persist("gala-avatar", dataUrl);
      setPhotoError("");
    } catch {
      setPhotoError("Couldn't read that image.");
    }
  }

  function removePhoto() {
    setPhoto(null);
    persist("gala-avatar", null);
    setPhotoError("");
  }

  function toggleReminders(next) {
    setReminders(next);
    persist("gala-reminders", next);
  }

  // Front-end only: clears this browser's saved profile data.
  // Replace with a real API call that deletes the account.
  function deleteAccount() {
    if (confirmText !== "DELETE") return;
    [PROFILE_KEY, "gala-avatar", "gala-name", "gala-reminders"].forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {}
    });
    setNavKey((k) => k + 1);
    router.push(LOGIN_HREF);
  }

  return (
    <main
      className="relative isolate min-h-screen w-full overflow-hidden px-4 py-6 md:px-8"
      // Same palette as your other pages. If you already have a shared
      // background (the world map), put it here instead of this gradient.
      style={{
        background:
          "radial-gradient(ellipse at top left, rgba(194,125,40,0.75), transparent 45%), radial-gradient(ellipse at bottom right, rgba(168,85,190,0.55), transparent 50%), linear-gradient(180deg, #0b3a66 0%, #0a5a82 70%, #0b7a93 100%)",
      }}
    >
      {/* Floating color blobs from globals.css (behind everything, no clicks) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-float absolute -left-24 top-24 h-80 w-80 rounded-full bg-amber-400/30 blur-3xl" />
        <div className="animate-float-slow absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="animate-float absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-300/25 blur-3xl" />
      </div>

      <Navbar key={navKey} />

      <div className="mx-auto mt-10 w-full max-w-6xl pb-16">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-white/80 transition hover:text-white"
        >
          ← Back
        </button>

        <p className="mt-6 text-white/70">Your account</p>
        <h1 className="text-4xl font-bold tracking-tight">Profile</h1>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {/* 1. BASIC INFO */}
          <Section
            title="Basic info"
            subtitle="How you appear in Project-Gala."
            onSave={() => save("basic", ["birthday"])}
            saved={savedId === "basic"}
          >
            <div className="flex items-center gap-5">
              <div className="rounded-full border border-white/40 p-1">
                <Avatar photo={photo} name={name} size={88} />
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={ghostButton}
                  >
                    Change photo
                  </button>
                  {photo && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="rounded-full px-3 py-2 text-sm text-white/70 underline underline-offset-4 transition hover:text-white"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                />
                {photoError ? (
                  <p role="alert" className="text-xs text-red-200">
                    {photoError}
                  </p>
                ) : (
                  <p className="text-xs text-white/55">
                    JPG or PNG, up to 5 MB.
                  </p>
                )}
              </div>
            </div>

            <Field label="Display name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className={inputClass}
              />
            </Field>

            <Field label="Email" hint="Your email is tied to your login, so it can't be changed here.">
              <input
                type="email"
                value={email}
                readOnly
                aria-readonly="true"
                placeholder="Loading…"
                className={`${inputClass} cursor-not-allowed opacity-70`}
              />
            </Field>

            <Field label="Birthday (optional)">
              <input
                type="date"
                value={form.birthday}
                onChange={set("birthday")}
                autoComplete="bday"
                className={`${inputClass} scheme-dark`}
              />
            </Field>
          </Section>

          {/* Right column: Travel preferences + Account stacked. Basic info stretches
              to the full row height, so its bottom lines up with the bottom of Account.
              (The last card also grows, so the bottoms match even if Basic info is taller.) */}
          <div className="flex flex-col gap-5 [&>section:last-child]:flex-1">
          {/* 2. TRAVEL PREFERENCES (both controls save instantly) */}
          <Section
            title="Travel preferences"
            subtitle="Helps us suggest the right plan templates. Saved right away."
          >
            <div>
              <span
                id="travel-style-label"
                className="mb-1.5 block text-sm text-white/80"
              >
                Preferred travel style
              </span>
              <div
                role="group"
                aria-labelledby="travel-style-label"
                className="flex flex-wrap gap-2"
              >
                {STYLES.map((s) => {
                  const on = form.style === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => chooseStyle(s)}
                      className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition active:scale-95 ${
                        on
                          ? "border-teal-100 bg-teal-500 font-semibold shadow-[0_0_14px_rgba(20,184,166,0.55)]"
                          : "border-white/30 bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {on ? "✓ " : ""}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl glass-dark px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Trip reminders</p>
                <p className="text-xs text-white/60">
                  Notify me before a trip starts.
                </p>
              </div>
              <Switch
                checked={!!reminders}
                onChange={toggleReminders}
                label="Trip reminders"
              />
            </div>
          </Section>

          {/* 3. ACCOUNT */}
          <Section title="Account" subtitle="Password, sign out, and account removal.">
            <div className="flex items-center justify-between gap-3 rounded-2xl glass-dark px-4 py-3">
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-white/60">Choose a new password.</p>
              </div>
              <Link href={CHANGE_PASSWORD_HREF} className={ghostButton}>
                Change password
              </Link>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl glass-dark px-4 py-3">
              <div>
                <p className="text-sm font-medium">Sign out</p>
                <p className="text-xs text-white/60">
                  End your session on this device.
                </p>
              </div>
              <LogoutButton />
            </div>

            <div className="rounded-2xl border border-red-300/40 bg-red-500/10 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-red-100">
                    Delete account
                  </p>
                  <p className="text-xs text-red-100/70">
                    This removes your profile data and can't be undone.
                  </p>
                </div>
                {!confirmingDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className="rounded-full border border-red-300/60 px-5 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/30"
                  >
                    Delete account
                  </button>
                )}
              </div>

              {confirmingDelete && (
                <div className="mt-4 flex flex-col gap-3">
                  <Field label="Type DELETE to confirm">
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      autoComplete="off"
                      className={inputClass}
                    />
                  </Field>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={deleteAccount}
                      disabled={confirmText !== "DELETE"}
                      className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold transition enabled:hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete my account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmingDelete(false);
                        setConfirmText("");
                      }}
                      className={ghostButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Section>
          </div>
        </div>
      </div>
    </main>
  );
}