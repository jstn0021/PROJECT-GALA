"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminClient({ users, currentId }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function call(id, init) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        headers: { "Content-Type": "application/json" },
        ...init,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error_message || "Something went wrong");
      else router.refresh();
    } catch {
      setError("Something went wrong");
    }
    setBusyId(null);
  }

  const toggle = (u) =>
    call(u.id, {
      method: "PATCH",
      body: JSON.stringify({ disabled: !u.disabled }),
    });

  const remove = (u) => {
    if (!window.confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    call(u.id, { method: "DELETE" });
  };

  return (
    <section className="glass mt-6 overflow-x-auto rounded-3xl p-2">
      {error && (
        <p className="m-3 rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2 text-sm text-red-100">
          {error}
        </p>
      )}
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="text-white/60">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const locked = u.id === currentId || u.role === "superadmin";
            return (
              <tr key={u.id} className="border-t border-white/10">
                <td className="px-4 py-3">{u.fullName}</td>
                <td className="px-4 py-3 text-white/80">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-0.5 text-xs">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.disabled ? (
                    <span className="text-red-200">Disabled</span>
                  ) : (
                    <span className="text-emerald-200">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {locked ? (
                    <span className="text-xs text-white/40">
                      {u.id === currentId ? "You" : "Protected"}
                    </span>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => toggle(u)}
                        className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 transition hover:bg-white/20 disabled:opacity-50"
                      >
                        {u.disabled ? "Enable" : "Disable"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => remove(u)}
                        className="rounded-lg border border-red-200/50 bg-red-500/30 px-3 py-1.5 transition hover:bg-red-500/50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
