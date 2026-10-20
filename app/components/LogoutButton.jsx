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
      type="button"
      onClick={logout}
      className="rounded-full border border-gala-line bg-gala-raised/60 px-5 py-2 text-sm font-medium text-gala-text transition hover:bg-gala-raised active:scale-95"
    >
      Log out
    </button>
  );
}