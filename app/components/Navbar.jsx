"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileMenu from "@/app/components/Profile";
import { Logo } from "@/app/components/AuthCard";

const baseLinks = [
  { label: "Dashboard", icon: "🏠", href: "/dashboard" },
  { label: "My Plans", icon: "📅", href: "/my-plans" },
  { label: "New Plan", icon: "✈️", href: "/newplan" },
  { label: "Bucket List", icon: "🔖", href: "/bucket-list" },
  { label: "Journal", icon: "📓", href: "/journal" },
  { label: "Explore", icon: "🧭", href: "/explore" },
];

const adminLink = { label: "Admin", icon: "🛡️", href: "/admin" };

// Mga role na may access sa Admin tab
const ADMIN_ROLES = ["admin", "superadmin"];

function isActive(pathname, link) {
  const paths = [link.href, ...(link.also ?? [])];
  return paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default function Navbar() {
  const pathname = usePathname() ?? "";
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState({
    name: "Traveler",
    email: "",
    avatarUrl: null,
    reminders: true,
  });

  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => {
        if (!alive) return;
        setIsAdmin(ADMIN_ROLES.includes(d.role));
        if (d.name || d.email || d.avatarUrl) {
          setUser({
            name: d.name || "Traveler",
            email: d.email ?? "",
            avatarUrl: d.avatarUrl ?? null,
            reminders: d.reminders ?? true,
          });
        }
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  const links = isAdmin ? [...baseLinks, adminLink] : baseLinks;

  return (
    <header className="glass-dark relative z-40 flex w-full items-center gap-4 rounded-full px-6 py-3">
      <Link href="/dashboard" aria-label="Dashboard">
        <Logo />
      </Link>

      <nav className="ml-2 flex items-center gap-1 overflow-x-auto lg:ml-6 lg:gap-2">
        {links.map((l) => {
          const active = isActive(pathname, l);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              aria-label={l.label}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm transition hover:bg-white/10 lg:px-4 ${
                active
                  ? "bg-indigo-500/40 font-semibold shadow-[0_0_18px_rgba(99,102,241,0.5)]"
                  : "text-white/80"
              }`}
            >
              <span>{l.icon}</span>
              <span className="hidden md:inline">{l.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto">
        <ProfileMenu user={user} profileHref="/profile" />
      </div>
    </header>
  );
}
