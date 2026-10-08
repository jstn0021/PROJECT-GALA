"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });

      window.localStorage.removeItem("gala-avatar");
      window.localStorage.removeItem("gala-name");
      window.localStorage.removeItem("gala-reminders");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error during logout:", error);
    }
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
