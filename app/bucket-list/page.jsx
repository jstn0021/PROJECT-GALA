"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Background } from "@/app/components/AuthCard";
import Navbar from "@/app/components/Navbar";
import LocationSearch from "@/app/components/LocationSearch";
import {
  GRID,
  PAGE_WRAP,
  PageHeader,
  CardImage,
  cardAction,
  Icon,
} from "@/app/components/ui";

/* Bucket List-only na styles. Kapareho na ng Dashboard, My Plans, New Plan,
   Profile, Journal at Landing ang panels, buttons at shadows.
   Hindi ginagalaw ang ui.jsx, kaya hindi apektado ang ibang pages. */
const PANEL =
  "rounded-3xl border border-gala-aqua/30 bg-linear-to-br from-gala-surface/90 via-gala-surface/85 to-[#172B3A]/90 backdrop-blur-md shadow-card";
const CARD = `group relative flex flex-col overflow-hidden ${PANEL} transition duration-300 hover:-translate-y-1 hover:shadow-lift`;
const gradientBtn =
  "bg-gala-accent font-bold text-gala-bg shadow-accent transition hover:scale-105 hover:brightness-110 hover:shadow-lift active:scale-95";
const primaryBtn = `rounded-full px-6 py-3 ${gradientBtn}`;

// Color names from the API -> card gradients (full class names so Tailwind keeps them)
const GRADIENTS = {
  coral: "from-gala-gold to-gala-muted",
  lime: "from-gala-accent to-gala-teal",
  blue: "from-gala-aqua to-gala-teal",
  green: "from-gala-teal to-gala-raised",
};

export default function BucketListPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
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
        body: JSON.stringify({
          name: value,
          image: selectedPlace?.image || null,
          location: selectedPlace?.location || selectedPlace?.label || null,
        }),
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
      setSelectedPlace(null);
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
      <div className={`${PAGE_WRAP} text-gala-text`}>
        <Navbar />

        <main className="flex flex-1 flex-col gap-6">
          <PageHeader
            title="Bucket List"
            subtitle={
              loading
                ? "Loading your places..."
                : `${doneCount} of ${places.length} places done`
            }
          />

          <form
            onSubmit={addPlace}
            className="flex w-full max-w-2xl items-center gap-2 rounded-full p-1.5"
          >
            <div className="relative min-w-0 flex-1">
              <LocationSearch
                value={name}
                onChange={(text) => {
                  setName(text);
                  setSelectedPlace(null);
                }}
                onSelect={(place) => {
                  setName(place.label || place.name);
                  setSelectedPlace(place);
                }}
                placeholder="Search Philippine destinations..."
              />
            </div>

            <button
              type="submit"
              disabled={adding || !selectedPlace || !name.trim()}
              className={`${primaryBtn} disabled:cursor-not-allowed disabled:opacity-50`}
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
            <div className={GRID}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`${PANEL} h-[380px] animate-pulse`} />
              ))}
            </div>
          ) : places.length === 0 ? (
            <div
              className={`${PANEL} mx-auto my-8 flex max-w-lg flex-col items-center p-10 text-center`}
            >
              <span className="grid h-16 w-16 place-items-center rounded-2xl border border-gala-line bg-gala-raised text-gala-accent shadow-card">
                <Icon name="bookmark" className="h-8 w-8" />
              </span>
              <h2 className="mt-4 text-2xl font-bold text-gala-text">No places yet</h2>
              <p className="mt-2 text-sm text-gala-muted">
                Add one above, or save places you like from Explore.
              </p>
              <Link href="/explore" className={`mt-6 ${primaryBtn}`}>
                Go to Explore
              </Link>
            </div>
          ) : (
            <div className={GRID}>
              {places.map((place) => (
                <article key={place.id} className={CARD}>
                  <CardImage
                    src={place.image}
                    alt={place.name}
                    gradient={GRADIENTS[place.color] ?? GRADIENTS.green}
                    dim={place.completed}
                  >
                    {place.completed && (
                      <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-gala-bg/70 px-2.5 py-1 text-xs font-semibold text-gala-accent backdrop-blur-md">
                        <Icon name="check" className="h-3.5 w-3.5" />
                        Done
                      </span>
                    )}
                  </CardImage>

                  <div className="flex flex-1 flex-col p-5">
                    <h3
                      className={`text-xl font-bold tracking-tight transition group-hover:text-gala-accent ${
                        place.completed
                          ? "text-gala-muted line-through"
                          : "text-gala-text"
                      }`}
                    >
                      {place.name}
                    </h3>
                    {place.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gala-aqua">
                        <Icon name="pin" className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{place.location}</span>
                      </p>
                    )}

                    <div className="mt-auto pt-4">
                      <div className="flex items-center gap-2 border-t border-gala-line pt-3">
                        <button
                          type="button"
                          onClick={() => toggleDone(place)}
                          className={`flex-1 ${cardAction} ${
                            place.completed
                              ? "border-gala-accent bg-gala-accent/20 text-gala-accent"
                              : ""
                          }`}
                        >
                          {place.completed ? (
                            <span className="inline-flex items-center justify-center gap-1">
                              <Icon name="check" className="h-3.5 w-3.5" />
                              Done
                            </span>
                          ) : (
                            "Mark as done"
                          )}
                        </button>
                        <Link
                          href={`/newplan?destination=${encodeURIComponent(place.name)}`}
                          className={`flex-1 rounded-full py-2 text-center text-xs ${gradientBtn}`}
                        >
                          Plan trip
                        </Link>
                        <button
                          type="button"
                          onClick={() => removePlace(place)}
                          aria-label={`Remove ${place.name}`}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gala-line bg-gala-raised/60 text-gala-text transition hover:bg-red-500/30"
                        >
                          <Icon name="trash" className="h-3.5 w-3.5" />
                        </button>
                      </div>
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