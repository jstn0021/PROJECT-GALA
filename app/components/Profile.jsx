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
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
};

// Kapareho ng avatar sa Profile page: solid teal na may cream na initial
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
      className="grid place-items-center rounded-full bg-gala-teal font-semibold text-gala-text"
    >
      {initial}
    </span>
  );
}

const rowBase =
  "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-gala-raised";
const iconBubble =
  "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gala-line bg-gala-raised";

export default function ProfileMenu({
  user = { name: "Traveler", email: "", avatarUrl: null },
  profileHref = "/profile",
  onLogout, // optional: palitan ang default na logout
}) {
  const router = useRouter();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  const [open, setOpen] = useState(false);

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
        className="rounded-full border border-gala-accent/60 p-0.5 transition hover:border-gala-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gala-accent"
      >
        <Avatar photo={photo} name={displayName} size={36} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Account"
          className="absolute right-0 top-full z-50 mt-3 w-88 max-w-[calc(100vw-2rem)] rounded-3xl border border-gala-line bg-gala-surface p-3 text-gala-text shadow-lift"
        >
          {/* Profile header */}
          <div className="flex flex-col items-center px-3 pb-3 pt-4 text-center">
            <div className="rounded-full border border-gala-accent/60 p-1">
              <Avatar photo={photo} name={displayName} size={80} />
            </div>

            <p className="mt-3 max-w-full truncate text-lg font-semibold text-gala-text">
              {displayName}
            </p>
            <p className="max-w-full truncate text-sm text-gala-muted">
              {user.email}
            </p>

            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="mt-4 rounded-full border border-gala-line bg-gala-raised/60 px-5 py-2 text-sm font-medium text-gala-text transition hover:bg-gala-raised active:scale-95"
            >
              Manage your account
            </Link>
          </div>

          <div className="my-1 h-px bg-gala-line" />

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