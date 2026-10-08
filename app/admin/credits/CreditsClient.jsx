"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const input = "glass-input h-10 w-full rounded-xl px-3 text-sm";
const btn =
  "glass-dark rounded-full px-3 py-1.5 text-sm transition hover:bg-white/10 disabled:opacity-50";
function initials(name) {
  const w = name.trim().split(/\s+/);
  return (
    (w[0]?.[0] ?? "") + (w.length > 1 ? w[w.length - 1][0] : "")
  ).toUpperCase();
}

function Avatar({ name, url, x = 50, y = 50 }) {
  return (
    <span
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-teal-300 bg-cover bg-center text-lg font-bold"
      style={
        url
          ? {
              backgroundImage: `url('${url}')`,
              backgroundPosition: `${x}% ${y}%`,
            }
          : undefined
      }
    >
      {!url && initials(name)}
    </span>
  );
}

// Same 4:3 frame as the landing card. Click / drag on it to move the focal point.
function PositionPicker({ c, pos, onChange, onSave, saving }) {
  function move(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.min(
      100,
      Math.max(0, Math.round(((e.clientX - r.left) / r.width) * 100)),
    );
    const y = Math.min(
      100,
      Math.max(0, Math.round(((e.clientY - r.top) / r.height) * 100)),
    );
    onChange({ photoX: x, photoY: y });
  }
  const changed = pos.photoX !== c.photoX || pos.photoY !== c.photoY;
  return (
    <div className="space-y-2">
      <div
        className="relative aspect-[4/3] w-full max-w-xs cursor-crosshair touch-none select-none overflow-hidden rounded-2xl border border-white/30 bg-cover"
        style={{
          backgroundImage: `url('${c.photoUrl}')`,
          backgroundPosition: `${pos.photoX}% ${pos.photoY}%`,
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons) move(e);
        }}
      >
        <span className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-white/30" />
        <span className="pointer-events-none absolute left-0 top-1/2 h-px w-full bg-white/30" />
      </div>
      <p className="text-xs text-white/60">
        Click or drag the preview to move the photo ({pos.photoX}%, {pos.photoY}
        %).
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className={btn}
          disabled={!changed || saving}
          onClick={onSave}
        >
          Save position
        </button>
        <button
          type="button"
          className={btn}
          disabled={saving || (pos.photoX === 50 && pos.photoY === 50)}
          onClick={() => onChange({ photoX: 50, photoY: 50 })}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default function CreditsClient({ credits }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState({}); // id -> { name, role }
  const [add, setAdd] = useState({
    name: "",
    role: "",
    description: "",
    file: null,
    key: 0,
  });

  async function send(key, url, init, onOk) {
    setBusy(key);
    setError("");
    try {
      const res = await fetch(url, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error_message || "Something went wrong");
      else {
        onOk?.();
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    }
    setBusy(null);
  }

  const [adjust, setAdjust] = useState({}); // id -> { photoX, photoY }, open picker
  const pos = (c) => adjust[c.id] ?? { photoX: c.photoX, photoY: c.photoY };

  function savePosition(c) {
    const body = new FormData();
    body.append("photoX", pos(c).photoX);
    body.append("photoY", pos(c).photoY);
    send(c.id, `/api/admin/credits/${c.id}`, { method: "PATCH", body }, () =>
      setAdjust((a) => {
        const { [c.id]: _, ...rest } = a;
        return rest;
      }),
    );
  }

  const draft = (c) =>
    drafts[c.id] ?? { name: c.name, role: c.role, description: c.description };
  const setDraft = (c, patch) =>
    setDrafts((d) => ({ ...d, [c.id]: { ...draft(c), ...patch } }));

  function save(c) {
    const body = new FormData();
    body.append("name", draft(c).name);
    body.append("role", draft(c).role);
    body.append("description", draft(c).description);
    send(c.id, `/api/admin/credits/${c.id}`, { method: "PATCH", body }, () =>
      setDrafts((d) => {
        const { [c.id]: _, ...rest } = d;
        return rest;
      }),
    );
  }

  function pickPhoto(c, e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    send(c.id, `/api/admin/credits/${c.id}`, { method: "PATCH", body });
  }

  function removePhoto(c) {
    const body = new FormData();
    body.append("removePhoto", "1");
    send(c.id, `/api/admin/credits/${c.id}`, { method: "PATCH", body });
  }

  function remove(c) {
    if (!window.confirm(`Remove ${c.name} from the credits?`)) return;
    send(c.id, `/api/admin/credits/${c.id}`, { method: "DELETE" });
  }

  function create(e) {
    e.preventDefault();
    const body = new FormData();
    body.append("name", add.name);
    body.append("role", add.role);
    body.append("description", add.description);
    if (add.file) body.append("file", add.file);
    send("new", "/api/admin/credits", { method: "POST", body }, () =>
      setAdd((a) => ({
        name: "",
        role: "",
        description: "",
        file: null,
        key: a.key + 1,
      })),
    );
  }

  return (
    <>
      {error && (
        <p className="mt-4 rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2 text-sm text-red-100">
          {error}
        </p>
      )}

      <form
        onSubmit={create}
        className="glass mt-6 grid gap-3 rounded-3xl p-4 sm:grid-cols-2 sm:items-end"
      >
        <label className="block text-sm">
          <span className="mb-1 block text-white/70">Full name</span>
          <input
            className={input}
            value={add.name}
            placeholder="ACE F GRAGASIN"
            onChange={(e) => setAdd({ ...add, name: e.target.value })}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-white/70">Role</span>
          <input
            className={input}
            value={add.role}
            placeholder="BACKEND DEVELOPER"
            onChange={(e) => setAdd({ ...add, role: e.target.value })}
            required
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-white/70">
            Description (optional, max 1000 characters)
          </span>
          <textarea
            className="glass-input w-full rounded-xl px-3 py-2 text-sm"
            rows={2}
            maxLength={1000}
            value={add.description}
            placeholder="Short intro about this person"
            onChange={(e) => setAdd({ ...add, description: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-white/70">Photo (optional)</span>
          <input
            key={add.key}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-xs text-white/80 file:mr-2 file:rounded-lg file:border-0 file:bg-white/15 file:px-3 file:py-2 file:text-white"
            onChange={(e) =>
              setAdd({ ...add, file: e.target.files?.[0] ?? null })
            }
          />
        </label>
        <button
          type="submit"
          disabled={busy === "new"}
          className={btn + " h-10"}
        >
          {busy === "new" ? "Adding..." : "Add member"}
        </button>
      </form>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {credits.length === 0 && (
          <p className="text-white/60">
            No members yet. Add the first one above.
          </p>
        )}
        {credits.map((c) => {
          const d = draft(c);
          const dirty =
            d.name !== c.name ||
            d.role !== c.role ||
            d.description !== c.description;
          return (
            <article key={c.id} className="glass flex gap-4 rounded-3xl p-4">
              <Avatar
                name={c.name}
                url={c.photoUrl}
                x={pos(c).photoX}
                y={pos(c).photoY}
              />
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  className={input}
                  value={d.name}
                  onChange={(e) => setDraft(c, { name: e.target.value })}
                  aria-label="Full name"
                />
                <input
                  className={input}
                  value={d.role}
                  onChange={(e) => setDraft(c, { role: e.target.value })}
                  aria-label="Role"
                />
                <textarea
                  className="glass-input w-full rounded-xl px-3 py-2 text-sm"
                  rows={2}
                  maxLength={1000}
                  value={d.description}
                  placeholder="Description (optional)"
                  onChange={(e) => setDraft(c, { description: e.target.value })}
                  aria-label="Description"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={btn}
                    disabled={!dirty || busy === c.id}
                    onClick={() => save(c)}
                  >
                    {busy === c.id ? "Working..." : "Save"}
                  </button>
                  <label className={btn + " cursor-pointer"}>
                    {c.photoUrl ? "Replace photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => pickPhoto(c, e)}
                    />
                  </label>
                  {c.photoUrl && (
                    <button
                      type="button"
                      className={btn}
                      onClick={() =>
                        setAdjust((a) =>
                          c.id in a
                            ? (({ [c.id]: _, ...r }) => r)(a)
                            : { ...a, [c.id]: pos(c) },
                        )
                      }
                    >
                      {c.id in adjust ? "Close adjust" : "Adjust photo"}
                    </button>
                  )}
                  {c.photoUrl && (
                    <button
                      type="button"
                      className={btn}
                      disabled={busy === c.id}
                      onClick={() => removePhoto(c)}
                    >
                      Remove photo
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy === c.id}
                    onClick={() => remove(c)}
                    className="rounded-lg border border-red-200/50 bg-red-500/30 px-3 py-1.5 text-sm transition hover:bg-red-500/50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
                {c.photoUrl && c.id in adjust && (
                  <PositionPicker
                    c={c}
                    pos={pos(c)}
                    saving={busy === c.id}
                    onChange={(patch) =>
                      setAdjust((a) => ({
                        ...a,
                        [c.id]: { ...pos(c), ...patch },
                      }))
                    }
                    onSave={() => savePosition(c)}
                  />
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
