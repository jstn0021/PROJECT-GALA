"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={logout}
      className="glass rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-white/20"
    >
      Log out
    </button>
  );
}
