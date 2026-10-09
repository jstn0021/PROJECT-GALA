"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
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

export default function ProfileMenu({
  user = { name: "Traveler", email: "", avatarUrl: null, reminders: true },
  profileHref = "/profile",
  onLogout, // optional: palitan ang default na logout
}) {
  const router = useRouter();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [reminders, setReminders] = useState(user.reminders ?? true);

  // Sumusunod sa value mula sa database kapag dumating na ang /api/me
  useEffect(() => {
    setReminders(user.reminders ?? true);
  }, [user.reminders]);

  const photo = user.avatarUrl;
  const displayName = user.name || "Traveler";

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
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

  async function toggleReminders(next) {
    setReminders(next);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminders: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setReminders(!next); // ibalik kung pumalya
    }
  }

  async function handleLogout() {
    setOpen(false);
    if (onLogout) return onLogout();
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.push("/");
      router.refresh();
    }
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
          className="absolute right-0 top-full z-50 mt-3 w-88 max-w-[calc(100vw-2rem)] rounded-3xl border border-white/25 bg-linear-to-br from-[#16265a] to-[#0a1230] p-3 text-white shadow-2xl shadow-black/60"
        >
          {/* Profile header */}
          <div className="flex flex-col items-center px-3 pb-3 pt-4 text-center">
            <div className="rounded-full border border-white/40 p-1">
              <Avatar photo={photo} name={displayName} size={80} />
            </div>

            <p className="mt-3 max-w-full truncate text-lg font-semibold">
              {displayName}
            </p>
            <p className="max-w-full truncate text-sm text-white/65">
              {user.email}
            </p>

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
                <span className="block text-sm font-medium">
                  Trip reminders
                </span>
                <span className="block text-xs text-white/60">
                  Notify me before a trip starts
                </span>
              </span>
              <Switch
                checked={!!reminders}
                onChange={toggleReminders}
                label="Trip reminders"
              />
            </div>
          </div>

          <div className="my-1 h-px bg-white/15" />

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
        </div>
      )}
    </div>
  );
}
