"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My plans", href: "/my-plans" },
  { label: "Bucket list", href: "/bucket-list" },
  { label: "Journal", href: "/journal" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="glass-dark flex w-full items-center justify-between gap-4 rounded-full px-6 py-3">
      <Link
        href="/dashboard"
        className="text-xl font-bold tracking-tight text-white"
      >
        PROJECT-GALA
      </Link>

      <nav className="hidden items-center gap-2 text-sm md:flex">
        {links.map((l) => {
          const active =
            pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-4 py-2 transition ${
                active
                  ? "bg-indigo-500/40 font-semibold text-white shadow-[0_0_18px_rgba(99,102,241,0.5)]"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
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
