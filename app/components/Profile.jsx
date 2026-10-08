"use client";

/**
 * app/components/ProfileMenu.jsx
 * Account dropdown for the navbar (like Google / Facebook / Messenger).
 * Click the avatar to open: profile photo, trip reminders, manage account,
 * help, and log out. The panel has a solid background, so page content never
 * shows through it.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ---------------- small helpers ---------------- */

function usePersisted(key, fallback) {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw));
    } catch {}
  }, [key]);

  const update = (next) => {
    setValue(next);
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  };
  return [value, update];
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

function Icon({ d, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  camera:
    "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  chevron: "m9 18 6-6-6-6",
};

function Avatar({ photo, name, size = 40 }) {
  const initial = (name?.trim()[0] || "?").toUpperCase();
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

const rowBase =
  "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-white/10";
const iconBubble =
  "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10";

/* ---------------- component ---------------- */

export default function ProfileMenu({
  user = { name: "Your name", email: "name@company.com" },
  profileHref = "/profile",
  helpHref = "/help",
  onLogout,
  logoutSlot, // optional: render your own <LogoutButton /> in the Log out row
}) {
  const router = useRouter();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const fileRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = usePersisted("gala-avatar", null);
  const [reminders, setReminders] = usePersisted("gala-reminders", true);
  const [photoError, setPhotoError] = useState("");
  const [savedName] = usePersisted("gala-name", null);
  const displayName = savedName || user.name;

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

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
      setPhoto(await resizeToSquare(file));
      setPhotoError("");
    } catch {
      setPhotoError("Couldn't read that image.");
    }
  }

  function handleLogout() {
    setOpen(false);
    // Replace /login with wherever your app sends logged-out users
    if (onLogout) onLogout();
    else router.push("/login");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="rounded-full border border-white/40 p-0.5 transition hover:border-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
      >
        <Avatar photo={photo} name={displayName} size={36} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Account"
          // Solid background (no transparency or blur) so nothing shows through
          className="absolute right-0 top-full z-50 mt-3 w-88 max-w-[calc(100vw-2rem)] rounded-3xl border border-white/25 bg-linear-to-br from-[#16265a] to-[#0a1230] p-3 text-white shadow-2xl shadow-black/60"
        >
          {/* Profile header */}
          <div className="flex flex-col items-center px-3 pb-3 pt-4 text-center">
            <div className="relative">
              <div className="rounded-full border border-white/40 p-1">
                <Avatar photo={photo} name={displayName} size={80} />
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Change profile photo"
                className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border border-white/40 bg-teal-500 text-teal-50 shadow transition hover:bg-teal-400"
              >
                <Icon d={ICONS.camera} className="h-4 w-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="sr-only"
                tabIndex={-1}
                aria-hidden
              />
            </div>

            <p className="mt-3 max-w-full truncate text-lg font-semibold">
              {displayName}
            </p>
            <p className="max-w-full truncate text-sm text-white/65">
              {user.email}
            </p>

            {photo && (
              <button
                type="button"
                onClick={() => {
                  setPhoto(null);
                  setPhotoError("");
                }}
                className="mt-2 text-xs text-white/60 underline underline-offset-4 transition hover:text-white"
              >
                Remove photo
              </button>
            )}
            {photoError && (
              <p role="alert" className="mt-2 text-xs text-red-200">
                {photoError}
              </p>
            )}

            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="mt-4 rounded-full border border-white/35 bg-white/10 px-5 py-2 text-sm font-medium transition hover:bg-white/20"
            >
              Manage your account
            </Link>
          </div>

          <div className="my-1 h-px bg-white/15" />

          {/* Settings */}
          <div className="flex flex-col py-1">
            <div className={rowBase}>
              <span className={iconBubble}>
                <Icon d={ICONS.bell} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">Trip reminders</span>
                <span className="block text-xs text-white/60">
                  Notify me before a trip starts
                </span>
              </span>
              <Switch
                checked={!!reminders}
                onChange={setReminders}
                label="Trip reminders"
              />
            </div>

            <Link
              href={helpHref}
              onClick={() => setOpen(false)}
              className={rowBase}
            >
              <span className={iconBubble}>
                <Icon d={ICONS.help} />
              </span>
              <span className="flex-1 text-sm font-medium">Help &amp; support</span>
              <Icon d={ICONS.chevron} className="h-4 w-4 text-white/50" />
            </Link>
          </div>

          <div className="my-1 h-px bg-white/15" />

          {logoutSlot ? (
            <div className="flex justify-center px-3 py-2">{logoutSlot}</div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className={`${rowBase} text-red-200`}
            >
              <span className={iconBubble}>
                <Icon d={ICONS.logout} />
              </span>
              <span className="text-sm font-medium">Log out</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}