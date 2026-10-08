"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";
import ProfileMenu from "@/app/components/Profile";

const baseLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My plans", href: "/my-plans", also: ["/newplan"] },
  { label: "Bucket list", href: "/bucket-list" },
  { label: "Journal", href: "/journal" },
];

const adminLink = { label: "Admin", href: "/admin" };

function isActive(pathname, link) {
  const paths = [link.href, ...(link.also ?? [])];
  return paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default function Navbar() {
  const pathname = usePathname() ?? "";
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState({ name: "Traveler", email: "" });

  // Superadmin lang ang makakakita ng "Admin" tab.
  // Also loads the name/email for the profile menu, if /api/me returns them.
  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => {
        if (!alive) return;
        setIsAdmin(d.role === "superadmin");
        if (d.name || d.email) {
          setUser((u) => ({
            name: d.name ?? u.name,
            email: d.email ?? u.email,
          }));
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const links = isAdmin ? [...baseLinks, adminLink] : baseLinks;

  return (
    // relative z-40 keeps the profile dropdown above the page cards below
    <header className="glass relative z-40 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-2xl px-6 py-3">
      <Link
        href="/dashboard"
        className="text-xl font-bold tracking-tight text-white"
      >
        PROJECT-GALA
      </Link>

      <nav className="flex items-center gap-2 text-sm">
        {links.map((l) => {
          const active = isActive(pathname, l);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={
                "rounded-xl px-4 py-2 transition " +
                (active
                  ? "bg-white/15 font-medium text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white")
              }
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      {/* Avatar on every page: opens the menu with "Manage your account" → /profile.
          Your existing LogoutButton is reused inside the menu, so logging out
          works exactly as before. */}
      <ProfileMenu
        user={user}
        profileHref="/profile"
        logoutSlot={<LogoutButton />}
      />
    </header>
  );
}