"use client";

/**
 * app/components/ProfileMenu.jsx
 * Navbar avatar. Clicking it goes straight to the profile page (/profile).
 * No dropdown. Shows the saved profile photo, or the first letter of the name.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function ProfileMenu({
  user = { name: "Your name", email: "name@company.com" },
  profileHref = "/profile",
}) {
  const pathname = usePathname() ?? "";
  const photo = usePersisted("gala-avatar", null);
  const savedName = usePersisted("gala-name", null);
  const displayName = savedName || user.name;
  const onProfile =
    pathname === profileHref || pathname.startsWith(profileHref + "/");

  return (
    <Link
      href={profileHref}
      aria-label="Go to your profile"
      aria-current={onProfile ? "page" : undefined}
      className={`rounded-full border p-0.5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
        onProfile
          ? "border-white/90"
          : "border-white/40 hover:border-white/80"
      }`}
    >
      <Avatar photo={photo} name={displayName} size={36} />
    </Link>
  );
}