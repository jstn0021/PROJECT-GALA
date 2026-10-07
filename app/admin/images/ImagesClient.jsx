"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImagesClient({ slots, custom }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  async function send(slot, init) {
    setBusy(slot);
    setError("");
    try {
      const res = await fetch(`/api/admin/images/${slot}`, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error_message || "Something went wrong");
      else router.refresh();
    } catch {
      setError("Something went wrong");
    }
    setBusy(null);
  }

  function onPick(slot, e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    send(slot, { method: "POST", body });
  }

  function onRemove(slot, label) {
    if (
      !window.confirm(
        `Remove the custom image for "${label}"? It will go back to the default.`,
      )
    )
      return;
    send(slot, { method: "DELETE" });
  }

  return (
    <>
      {error && (
        <p className="mt-4 rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2 text-sm text-red-100">
          {error}
        </p>
      )}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {slots.map((s) => {
          const url = custom[s.slot];
          return (
            <article key={s.slot} className="glass overflow-hidden rounded-3xl">
              <div
                className="aspect-[16/10] bg-linear-to-br from-teal-500 to-indigo-800 bg-cover bg-center"
                style={{ backgroundImage: `url('${url ?? s.fallback}')` }}
              />
              <div className="p-4">
                <h3 className="font-semibold">{s.label}</h3>
                <p className="mt-0.5 text-xs text-white/60">
                  {url ? "Custom image" : "Default image"}
                </p>
                <div className="mt-3 flex gap-2">
                  <label
                    className={`cursor-pointer rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-sm transition hover:bg-white/20 ${
                      busy === s.slot ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    {busy === s.slot
                      ? "Working..."
                      : url
                        ? "Replace"
                        : "Upload"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => onPick(s.slot, e)}
                    />
                  </label>
                  {url && (
                    <button
                      type="button"
                      disabled={busy === s.slot}
                      onClick={() => onRemove(s.slot, s.label)}
                      className="rounded-lg border border-red-200/50 bg-red-500/30 px-3 py-1.5 text-sm transition hover:bg-red-500/50 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
