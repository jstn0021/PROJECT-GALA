"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import LogoutButton from "@/app/components/LogoutButton";

const CHANGE_PASSWORD_HREF = "/forgot-password"; // gumagana na; palitan kapag may sariling page
const LOGIN_HREF = "/login";

const STYLES = ["Weekend", "Solo", "Family", "Adventure"];
const EMPTY = { birthday: "", style: "" };

async function patchMe(fields) {
  const res = await fetch("/api/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error("Save failed");
}

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
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
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

function Section({ title, subtitle, children, onSave, saved, error }) {
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
          {error && (
            <span role="alert" className="text-sm text-red-200">
              {error}
            </span>
          )}
        </div>
      )}
    </section>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [reminders, setReminders] = useState(true);
  const [savedId, setSavedId] = useState("");
  const [saveError, setSaveError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [navKey, setNavKey] = useState(0); // remount ng Navbar para mag-refetch

  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => {
        if (!alive) return;
        setEmail(d.email ?? "");
        setName(d.name ?? "");
        setPhoto(d.avatarUrl ?? null);
        setReminders(d.reminders ?? true);
        setForm({ birthday: d.birthday ?? "", style: d.travelStyle ?? "" });
        setLoaded(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const refreshNav = () => setNavKey((k) => k + 1);

  async function saveBasic() {
    try {
      setSaveError("");
      await patchMe({ name: name.trim(), birthday: form.birthday || null });
      refreshNav();
      setSavedId("basic");
      setTimeout(() => setSavedId(""), 2500);
    } catch {
      setSaveError("Couldn't save. Try again.");
    }
  }

  async function chooseStyle(style) {
    const prev = form.style;
    const next = prev === style ? "" : style;
    setForm((f) => ({ ...f, style: next }));
    try {
      await patchMe({ travelStyle: next || null });
    } catch {
      setForm((f) => ({ ...f, style: prev }));
    }
  }

  async function handlePhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return setPhotoError("Choose an image file.");
    if (file.size > 5 * 1024 * 1024)
      return setPhotoError("Image must be under 5 MB.");
    try {
      setPhotoError("");
      const blob = await resizeToSquare(file);
      const fd = new FormData();
      fd.append("file", blob, "avatar.jpg");
      const res = await fetch("/api/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      await patchMe({ avatarUrl: data.url });
      setPhoto(data.url);
      refreshNav();
    } catch (err) {
      setPhotoError(err.message || "Couldn't upload that image.");
    }
  }

  async function removePhoto() {
    try {
      await patchMe({ avatarUrl: null });
      setPhoto(null);
      setPhotoError("");
      refreshNav();
    } catch {
      setPhotoError("Couldn't remove the photo.");
    }
  }

  async function toggleReminders(next) {
    setReminders(next);
    try {
      await patchMe({ reminders: next });
    } catch {
      setReminders(!next);
    }
  }

  async function deleteAccount() {
    if (confirmText !== "DELETE") return;
    const res = await fetch("/api/me", { method: "DELETE" });
    if (!res.ok) return;
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    router.push(LOGIN_HREF);
  }

  return (
    <main
      className="relative isolate min-h-screen w-full overflow-hidden px-4 py-6 md:px-8"
      style={{
        background:
          "radial-gradient(ellipse at top left, rgba(194,125,40,0.75), transparent 45%), radial-gradient(ellipse at bottom right, rgba(168,85,190,0.55), transparent 50%), linear-gradient(180deg, #0b3a66 0%, #0a5a82 70%, #0b7a93 100%)",
      }}
    >
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
          <Section
            title="Basic info"
            subtitle="How you appear in Project-Gala."
            onSave={loaded ? saveBasic : undefined}
            saved={savedId === "basic"}
            error={saveError}
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

            <Field
              label="Email"
              hint="Your email is tied to your login, so it can't be changed here."
            >
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, birthday: e.target.value }))
                }
                autoComplete="bday"
                className={`${inputClass} scheme-dark`}
              />
            </Field>
          </Section>

          <div className="flex flex-col gap-5 [&>section:last-child]:flex-1">
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

            <Section
              title="Account"
              subtitle="Password, sign out, and account removal."
            >
              <div className="flex items-center justify-between gap-3 rounded-2xl glass-dark px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-white/60">
                    We'll email you a reset link.
                  </p>
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
                      This disables your account and signs you out.
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
