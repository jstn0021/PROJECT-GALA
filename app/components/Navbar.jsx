"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "app/components/LogoutButton";

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

  // Superadmin lang ang makakakita ng "Admin" tab.
  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => alive && setIsAdmin(d.role === "superadmin"))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const links = isAdmin ? [...baseLinks, adminLink] : baseLinks;

  return (
    <header className="glass mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-2xl px-6 py-3">
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

      <LogoutButton />
    </header>
  );
}
