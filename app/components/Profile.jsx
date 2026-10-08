"use client";

/**
 * app/components/ProfileMenu.jsx
 * Navbar avatar. Clicking it goes straight to the profile page (no dropdown).
 * The photo and name come from the same localStorage keys the profile page
 * saves to, so the avatar stays in sync after every save there.
 *
 * Props are kept the same as before, so <Navbar /> doesn't need to change.
 * Only `user` and `profileHref` are used now; the rest are ignored.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ---------------- small helpers ---------------- */

function usePersisted(key, fallback) {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw));
    } catch {}
  }, [key]);

  return value;
}

function Avatar({ photo, name, size = 36 }) {
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

/* ---------------- component ---------------- */

export default function ProfileMenu({
  user = { name: "Your name", email: "name@company.com" },
  profileHref = "/profile",
}) {
  const pathname = usePathname();
  const photo = usePersisted("gala-avatar", null);
  const savedName = usePersisted("gala-name", null);
  const displayName = savedName || user.name;
  const onProfilePage = pathname === profileHref;

  return (
    <Link
      href={profileHref}
      aria-label="Profile"
      aria-current={onProfilePage ? "page" : undefined}
      className={`block rounded-full border p-0.5 transition hover:border-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
        onProfilePage ? "border-white/80" : "border-white/40"
      }`}
    >
      <Avatar photo={photo} name={displayName} size={36} />
    </Link>
  );
}