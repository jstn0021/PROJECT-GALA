"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Background } from "@/app/components/AuthCard";
import Navbar from "@/app/components/Navbar";

// Color names from the API -> card gradients (full class names so Tailwind keeps them)
const GRADIENTS = {
  coral: "from-rose-400 to-orange-300",
  lime: "from-yellow-300 to-emerald-300",
  blue: "from-cyan-300 to-indigo-400",
  green: "from-emerald-300 to-teal-500",
};

const primaryBtn =
  "rounded-full bg-linear-to-r from-indigo-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.6)] transition hover:scale-105 active:scale-95 disabled:opacity-60";

export default function BucketListPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    try {
      setError("");
      const res = await fetch("/api/bucket-list", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.error || `Request failed (${res.status})`);
      setPlaces(data.places ?? []);
    } catch (err) {
      setError(err.message || "Couldn't load your bucket list.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addPlace(e) {
    e.preventDefault();
    const value = name.trim();
    if (!value) return;

    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/bucket-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setError("That place is already on your list.");
        return;
      }
      if (!res.ok) {
        throw new Error(
          data.error || data.errors?.name || "Couldn't add that place.",
        );
      }
      setPlaces((p) => [...p, data]);
      setName("");
    } catch (err) {
      setError(err.message || "Couldn't add that place.");
    } finally {
      setAdding(false);
    }
  }

  async function toggleDone(place) {
    const next = !place.completed;
    // Optimistic update, revert if the request fails
    setPlaces((p) =>
      p.map((x) => (x.id === place.id ? { ...x, completed: next } : x)),
    );
    try {
      const res = await fetch(`/api/bucket-list/${place.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: next }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch {
      setPlaces((p) =>
        p.map((x) =>
          x.id === place.id ? { ...x, completed: place.completed } : x,
        ),
      );
      setError("Couldn't update that place. Please try again.");
    }
  }

  async function removePlace(place) {
    const before = places;
    setPlaces((p) => p.filter((x) => x.id !== place.id));
    try {
      const res = await fetch(`/api/bucket-list/${place.id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 404) throw new Error("Delete failed");
    } catch {
      setPlaces(before);
      setError("Couldn't remove that place. Please try again.");
    }
  }

  const doneCount = places.filter((p) => p.completed).length;

  return (
    <Background>
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 text-white md:px-8 md:py-6 xl:px-12">
        <Navbar />

        <main className="flex flex-1 flex-col gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Bucket List
            </h1>
            <p className="mt-2 text-white/70">
              {loading
                ? "Loading your places..."
                : `${doneCount} of ${places.length} places done`}
            </p>
          </div>

          <form
            onSubmit={addPlace}
            className="glass-input flex max-w-2xl items-center gap-2 rounded-full p-1.5"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Add a place (e.g. Kyoto)"
              maxLength={150}
              aria-label="Place name"
              className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-white placeholder:text-white/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={adding || !name.trim()}
              className={primaryBtn}
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </form>

          {error && (
            <div className="rounded-2xl border border-red-400/40 bg-red-500/20 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-dark h-36 animate-pulse rounded-3xl"
                />
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="glass-dark mx-auto my-8 flex max-w-lg flex-col items-center rounded-3xl p-10 text-center">
              <span className="text-5xl">🔖</span>
              <h2 className="mt-4 text-2xl font-bold">No places yet</h2>
              <p className="mt-2 text-sm text-white/70">
                Add one above, or save places you like from Explore.
              </p>
              <Link href="/explore" className={`mt-6 ${primaryBtn}`}>
                Go to Explore
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {places.map((place) => (
                <article
                  key={place.id}
                  className="glass-dark flex flex-col overflow-hidden rounded-3xl"
                >
                  <div
                    className={`relative h-44 bg-linear-to-br ${
                      GRADIENTS[place.color] ?? GRADIENTS.green
                    }`}
                  >
                    {place.image && (
                      <img
                        src={place.image}
                        alt={place.name}
                        loading="lazy"
                        onError={(e) => {
                          // Broken link: hide it so the gradient shows instead
                          e.currentTarget.style.display = "none";
                        }}
                        className={`absolute inset-0 h-full w-full object-cover ${
                          place.completed ? "saturate-50" : ""
                        }`}
                      />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-black/20" />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div>
                      <h3
                        className={`text-xl font-bold tracking-tight ${
                          place.completed ? "text-white/50 line-through" : ""
                        }`}
                      >
                        {place.name}
                      </h3>
                      {place.location && (
                        <p className="mt-1 truncate text-xs font-medium text-sky-300">
                          📍 {place.location}
                        </p>
                      )}
                    </div>
                    <div className="mt-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDone(place)}
                        className={`flex-1 rounded-full border px-3 py-2 text-sm transition ${
                          place.completed
                            ? "border-indigo-300 bg-indigo-500/40"
                            : "border-white/25 bg-white/10 hover:bg-white/20"
                        }`}
                      >
                        {place.completed ? "✓ Done" : "Mark as done"}
                      </button>
                      <Link
                        href={`/newplan?destination=${encodeURIComponent(place.name)}`}
                        className="rounded-full border border-white/25 bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20"
                      >
                        Plan
                      </Link>
                      <button
                        type="button"
                        onClick={() => removePlace(place)}
                        aria-label={`Remove ${place.name}`}
                        className="h-9 w-9 rounded-full border border-white/25 bg-white/10 transition hover:bg-white/20"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </Background>
  );
}
