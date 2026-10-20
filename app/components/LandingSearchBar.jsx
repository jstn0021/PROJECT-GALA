"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/components/ui";

const MAX_FREE_SEARCHES = 10;

/* Kapareho na ng Dashboard, My Plans, New Plan, Profile, Journal at Landing ang
   panels, buttons at shadows. Hindi na umaasa sa .glass / .glass-input ng globals.css. */
const PANEL =
  "rounded-2xl border border-gala-aqua/30 bg-linear-to-br from-gala-surface/90 via-gala-surface/85 to-[#172B3A]/90 backdrop-blur-md shadow-card";
const MODAL =
  "rounded-3xl border border-gala-line bg-gala-surface shadow-lift";
const primaryBtn =
  "rounded-full bg-gala-accent font-bold text-gala-bg shadow-accent transition hover:scale-105 hover:brightness-110 hover:shadow-lift active:scale-95";
const ghostBtn =
  "rounded-full border border-gala-line bg-gala-raised/60 font-semibold text-gala-text transition hover:bg-gala-raised active:scale-95";

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
        className="mt-8 flex w-full max-w-xl items-center gap-2 rounded-full border border-gala-line bg-gala-surface/85 p-1.5 shadow-card backdrop-blur-md transition focus-within:border-gala-accent focus-within:ring-4 focus-within:ring-gala-accent/20"
      >
        <span className="pl-4 text-gala-aqua" aria-hidden="true">
          <Icon name="search" className="h-5 w-5" />
        </span>
        <input
          id="landing-search-input"
          name="q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Where do you want to go in the Philippines?"
          aria-label="Search for a Philippine destination"
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-gala-text placeholder:text-gala-muted focus:outline-none"
        />
        <button
          id="landing-search-btn"
          type="submit"
          disabled={isLoading}
          className={`${primaryBtn} px-6 py-2.5 disabled:opacity-50`}
        >
          {isLoading ? "Searching…" : "Search"}
        </button>
      </form>

      {/* ── Guest limit indicator ────────────────────────────────────────────── */}
      <p className="mt-2 text-xs text-gala-muted">
        Free Guest Searches:{" "}
        <strong className="text-gala-accent">{remainingSearches}</strong> of{" "}
        {MAX_FREE_SEARCHES} remaining
      </p>

      {/* ── Explore link ────────────────────────────────────────────────────── */}
      <div className="mt-5 text-center">
        <Link
          href="/signup"
          className={`${ghostBtn} inline-flex items-center gap-2 px-6 py-2.5`}
        >
          Explore destinations
          <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>

      {/* ── Preview results grid ─────────────────────────────────────────────── */}
      {searchedKeyword && (
        <div className="mt-6 w-full animate-fadeIn">
          <p className="mb-3 text-center text-sm text-gala-text/80">
            Results for{" "}
            <strong className="text-gala-accent">"{searchedKeyword}"</strong>:
          </p>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <span className="animate-pulse text-sm text-gala-aqua">
                Searching Philippine destinations…
              </span>
            </div>
          ) : previewResults.length === 0 ? (
            <p className="py-4 text-center text-xs text-gala-muted">
              No locations found. Try a city, province, or landmark name.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {previewResults.map((place, idx) => (
                <div
                  key={place.id ?? idx}
                  className={`${PANEL} relative flex flex-col justify-between overflow-hidden p-3 transition duration-300 hover:-translate-y-1 hover:shadow-lift`}
                >
                  <div>
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gala-line bg-gala-raised">
                      <img
                        src={place.image || "/destinations/elnido.jpg"}
                        alt={place.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/destinations/elnido.jpg";
                        }}
                      />
                    </div>
                    <h4 className="mt-2 text-base font-bold text-gala-text">
                      {place.name}
                    </h4>
                    <p className="flex items-center gap-1 text-xs text-gala-aqua">
                      <Icon name="pin" className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {place.location || "Philippines"}
                      </span>
                    </p>
                  </div>

                  {/* Lock-details CTA */}
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gala-accent/50 bg-gala-accent/15 py-2 text-xs font-semibold text-gala-accent transition hover:bg-gala-accent/25"
                  >
                    <Icon name="lock" className="h-3.5 w-3.5" />
                    <span>View full details · Log in</span>
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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div
            className={`${MODAL} relative z-10 w-full max-w-sm px-8 py-8 text-center text-gala-text`}
          >
            <div
              className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-gala-line bg-gala-raised text-gala-accent shadow-card"
              aria-hidden="true"
            >
              <Icon name="lock" className="h-8 w-8" />
            </div>

            <h2
              id="search-limit-title"
              className="text-xl font-bold text-gala-text"
            >
              Search limit reached
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-gala-text/75">
              You have used all{" "}
              <strong className="text-gala-accent">{MAX_FREE_SEARCHES}</strong>{" "}
              free guest searches. Log in or sign up to explore without limits!
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                id="search-limit-login-btn"
                href="/login"
                className={`${primaryBtn} px-6 py-2.5`}
              >
                Log in
              </a>
              <a
                id="search-limit-signup-btn"
                href="/signup"
                className={`${ghostBtn} px-6 py-2.5`}
              >
                Sign up — it is free
              </a>
            </div>

            <button
              id="search-limit-dismiss-btn"
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-4 text-xs text-gala-muted underline-offset-2 transition hover:text-gala-text hover:underline"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}