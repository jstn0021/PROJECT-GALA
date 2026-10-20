"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProfileMenu from "@/app/components/Profile";
import { Logo } from "@/app/components/AuthCard";
import { Icon } from "@/app/components/ui";

const baseLinks = [
  { label: "Dashboard", icon: "home", href: "/dashboard" },
  { label: "My Plans", icon: "calendar", href: "/my-plans" },
  { label: "New Plan", icon: "plane", href: "/newplan" },
  { label: "Bucket List", icon: "bookmark", href: "/bucket-list" },
  { label: "Journal", icon: "book", href: "/journal" },
  { label: "Explore", icon: "compass", href: "/explore" },
];

const adminLink = { label: "Admin", icon: "shield", href: "/admin" };

// Mga role na may access sa Admin tab
const ADMIN_ROLES = ["admin", "superadmin"];

function isActive(pathname, link) {
  const paths = [link.href, ...(link.also ?? [])];
  return paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState({
    name: "Traveler",
    email: "",
    avatarUrl: null,
    reminders: true,
  });

  // Walang back button sa Dashboard (ito na ang home)
  const showBack = pathname !== "/dashboard";

  function goBack() {
    // Kung wala nang babalikan (hal. direct link), balik sa dashboard
    if (window.history.length > 1) router.back();
    else router.push("/dashboard");
  }

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
    // Hindi na gumagamit ng .glass-dark; kapareho na ng dashboard panels ang style.
    <header className="relative z-40 flex w-full items-center gap-4 rounded-full border border-gala-aqua/30 bg-linear-to-r from-gala-surface/90 via-gala-surface/85 to-[#172B3A]/90 px-6 py-3 text-gala-text shadow-card backdrop-blur-md">
      {showBack && (
        <button
          type="button"
          onClick={goBack}
          aria-label="Go back"
          title="Back"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gala-line bg-gala-raised/60 text-gala-text transition hover:bg-gala-raised active:scale-95"
        >
          <Icon name="arrowLeft" className="h-4 w-4" />
        </button>
      )}

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
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm transition lg:px-4 ${
                active
                  ? "bg-gala-accent font-semibold text-gala-bg"
                  : "text-gala-aqua hover:bg-gala-raised hover:text-gala-text"
              }`}
            >
              <Icon name={l.icon} className="h-4 w-4 shrink-0" />
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