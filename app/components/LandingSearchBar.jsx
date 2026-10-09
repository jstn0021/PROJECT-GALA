"use client";

import { useState } from "react";
import Link from "next/link";

const MAX_FREE_SEARCHES = 3;

export default function LandingSearchBar() {
  const [query, setQuery] = useState("");
  const [searchCount, setSearchCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewResults, setPreviewResults] = useState([]);
  const [searchedKeyword, setSearchedKeyword] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    // Enforce the per-session guest search limit
    if (searchCount >= MAX_FREE_SEARCHES) {
      setShowModal(true);
      return;
    }

    setSearchCount((c) => c + 1);
    setIsLoading(true);
    setSearchedKeyword(query.trim());

    try {
      // ── Route through our own PH-restricted API ──────────────────────────
      const res = await fetch(
        `/api/search-places?q=${encodeURIComponent(query.trim())}`,
      );
      if (res.ok) {
        const data = await res.json();
        setPreviewResults(data.places ?? []);
      }
    } catch (err) {
      console.error("Preview fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const remainingSearches = Math.max(0, MAX_FREE_SEARCHES - searchCount);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <form
        id="landing-search-form"
        onSubmit={handleSearch}
        className="glass-input mt-8 flex w-full max-w-xl items-center gap-2 rounded-full p-1.5"
      >
        <span className="pl-4 text-xl" aria-hidden="true">🔍</span>
        <input
          id="landing-search-input"
          name="q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Where do you want to go in the Philippines?"
          aria-label="Search for a Philippine destination"
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-white placeholder:text-white/70 focus:outline-none"
        />
        <button
          id="landing-search-btn"
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-slate-900/70 px-6 py-2.5 font-medium text-white transition hover:bg-slate-900 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? "Searching…" : "Search"}
        </button>
      </form>

      {/* ── Guest limit indicator ────────────────────────────────────────────── */}
      <p className="mt-2 text-xs text-white/60">
        Free Guest Searches:{" "}
        <strong className="text-amber-300">{remainingSearches}</strong>{" "}
        of {MAX_FREE_SEARCHES} remaining
      </p>

      {/* ── Explore link ────────────────────────────────────────────────────── */}
      <div className="mt-5 text-center">
        <Link
          href="/signup"
          className="inline-block rounded-full bg-slate-900/70 px-6 py-2.5 font-medium text-white transition hover:bg-slate-900"
        >
          Explore destinations
        </Link>
      </div>

      {/* ── Preview results grid ─────────────────────────────────────────────── */}
      {searchedKeyword && (
        <div className="mt-6 w-full animate-fadeIn">
          <p className="text-sm text-white/80 mb-3 text-center">
            Results for{" "}
            <strong className="text-teal-300">"{searchedKeyword}"</strong>:
          </p>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <span className="text-teal-300 animate-pulse text-sm">
                Searching Philippine destinations… 🧭
              </span>
            </div>
          ) : previewResults.length === 0 ? (
            <p className="text-xs text-white/50 text-center py-4">
              No locations found. Try a city, province, or landmark name.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {previewResults.map((place, idx) => (
                <div
                  key={place.id ?? idx}
                  className="glass relative overflow-hidden rounded-2xl border border-white/20 p-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-800">
                      <img
                        src={place.image || "/destinations/elnido.jpg"}
                        alt={place.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/destinations/elnido.jpg";
                        }}
                      />
                    </div>
                    <h4 className="mt-2 font-bold text-white text-base">
                      {place.name}
                    </h4>
                    <p className="text-xs text-teal-200">
                      📍 {place.location || "Philippines"}
                    </p>
                  </div>

                  {/* Lock-details CTA */}
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-xl bg-teal-500/30 border border-teal-300/40 py-2 text-xs font-semibold text-teal-100 transition hover:bg-teal-500/50"
                  >
                    <span>🔒 View full details · Log in</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Login prompt modal ───────────────────────────────────────────────── */}
      {showModal && (
        <div
          id="landing-search-limit-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-limit-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="glass relative z-10 w-full max-w-sm rounded-3xl px-8 py-8 text-center shadow-2xl border border-white/20">
            <div className="mb-4 text-5xl" aria-hidden="true">🔒</div>

            <h2 id="search-limit-title" className="text-xl font-bold text-white">
              Search limit reached
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-white/75">
              You have used all{" "}
              <strong className="text-amber-300">{MAX_FREE_SEARCHES}</strong>{" "}
              free guest searches. Log in or sign up to explore without limits!
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                id="search-limit-login-btn"
                href="/login"
                className="rounded-full bg-amber-400 px-6 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-300"
              >
                Log in
              </a>
              <a
                id="search-limit-signup-btn"
                href="/signup"
                className="rounded-full border border-white/40 bg-white/15 px-6 py-2.5 font-semibold text-white transition hover:bg-white/25"
              >
                Sign up — it is free
              </a>
            </div>

            <button
              id="search-limit-dismiss-btn"
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-4 text-xs text-white/45 underline-offset-2 transition hover:text-white/70 hover:underline"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
