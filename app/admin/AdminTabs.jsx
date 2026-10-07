import Link from "next/link";

const TABS = [
  { key: "users", label: "Users", href: "/admin" },
  { key: "images", label: "Site images", href: "/admin/images" },
  { key: "credits", label: "Credits", href: "/admin/credits" },
];

export default function AdminTabs({ active }) {
  return (
    <nav className="mt-3 flex flex-wrap gap-2 text-sm">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={
            "rounded-full border px-4 py-1.5 transition " +
            (t.key === active
              ? "border-white/60 bg-white/25"
              : "border-white/20 bg-white/5 text-white/75 hover:bg-white/10")
          }
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
