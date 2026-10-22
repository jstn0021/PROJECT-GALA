"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Background } from "@/app/components/AuthCard";
import Navbar from "@/app/components/Navbar";
import { Icon } from "@/app/components/ui";

/* Explore styles, matched to the Dashboard look (gala-* tokens, flat panels).
   Page background comes from <Background> (same as the other pages).
   Every surface below shares SURFACE_BG.
   Hindi ginagalaw ang ui.jsx kaya hindi apektado ang ibang pages. */
const SURFACE_BG =
  "bg-linear-to-br from-gala-surface/90 via-gala-surface/85 to-[#172B3A]/90";
const PANEL = `rounded-3xl border border-gala-aqua/30 ${SURFACE_BG} backdrop-blur-md shadow-card`;
const MODAL = `${PANEL} border-gala-line bg-gala-surface shadow-lift`;
const CARD = `group relative flex flex-col overflow-hidden ${PANEL} transition duration-300 hover:shadow-lift`;
const GRID = "grid gap-4 sm:grid-cols-2 xl:grid-cols-4";

const primaryBtn =
  "bg-gala-accent font-bold text-gala-bg shadow-accent transition hover:scale-105 hover:brightness-110 hover:shadow-lift active:scale-95";
const outlineBtn =
  "border border-gala-aqua bg-gala-bg/50 font-semibold text-gala-text backdrop-blur transition hover:bg-gala-raised";
const subtleBtn =
  "border border-gala-line bg-gala-raised/60 text-gala-text transition hover:bg-gala-raised active:scale-95";

// Preset quick-search suggestions for rapid user discovery
const QUICK_SUGGESTIONS = [
  { label: "Boracay", query: "Boracay" },
  { label: "El Nido", query: "El Nido" },
  { label: "Baguio", query: "Baguio" },
  { label: "Siargao", query: "Siargao" },
  { label: "Batanes", query: "Batanes" },
  { label: "Bohol", query: "Chocolate Hills" },
  { label: "Camiguin", query: "Camiguin" },
  { label: "Mayon", query: "Mayon Volcano" },
  { label: "Vigan", query: "Vigan" },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "beaches", label: "Beaches & Islands" },
  { id: "mountains", label: "Mountains & Nature" },
  { id: "heritage", label: "Heritage & Culture" },
  { id: "cities", label: "Cities & Food" },
];

// Freemium search limit for guests
const GUEST_SEARCH_LIMIT = 10;
const GUEST_SEARCH_KEY = "gala_guest_search_count";

export default function ExploreClient({ initialIsLoggedIn = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("query") || "";

  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [guestSearchCount, setGuestSearchCount] = useState(0);

  // Auth restriction modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("search_limit"); // "search_limit" | "save_place"
  const [attemptedPlace, setAttemptedPlace] = useState(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [places, setPlaces] = useState([]);
  const [featuredBackup, setFeaturedBackup] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [savedBucketMap, setSavedBucketMap] = useState({});
  const [isShuffling, setIsShuffling] = useState(false);
  const [searchError, setSearchError] = useState("");

  const searchDebounceRef = useRef(null);
  const searchInputRef = useRef(null);
  const [, startTransition] = useTransition();

  // Re-verify session dynamically from /api/session
  useEffect(() => {
    async function verifySession() {
      try {
        const res = await fetch("/api/session");
        if (res.ok) {
          const data = await res.json();
          if (typeof data.isLoggedIn === "boolean") {
            setIsLoggedIn(data.isLoggedIn);
          }
        }
      } catch (err) {
        console.warn("Could not check session:", err);
      }
    }
    verifySession();
  }, []);

  // Load guest search count from localStorage
  useEffect(() => {
    try {
      const storedCount = localStorage.getItem(GUEST_SEARCH_KEY);
      const parsed = parseInt(storedCount || "0", 10);
      setGuestSearchCount(Number.isNaN(parsed) ? 0 : parsed);
    } catch (e) {
      console.warn("Could not read guest search count from localStorage", e);
    }
  }, []);

  // Load saved places from the API (name -> id), so Explore matches the Bucket List page
  useEffect(() => {
    if (!isLoggedIn) return;
    let alive = true;

    fetch("/api/bucket-list", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { places: [] }))
      .then((d) => {
        if (!alive) return;
        const map = {};
        (d.places ?? []).forEach((p) => {
          if (p.name) map[p.name.toLowerCase()] = p.id;
        });
        setSavedBucketMap(map);
      })
      .catch((e) => console.warn("Could not load bucket list", e));

    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  // Fetch initial featured places on page mount
  useEffect(() => {
    async function loadInitial() {
      setIsLoading(true);
      try {
        if (initialQuery.trim().length >= 2) {
          // Query passed from the landing page search form
          await performSearch(initialQuery.trim());
        } else {
          await loadFeaturedPlaces("all", false);
        }
      } catch (err) {
        console.error("Initial load failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Close the auth modal with the Escape key
  useEffect(() => {
    if (!showAuthModal) return;
    function onKey(e) {
      if (e.key === "Escape") closeAuthModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showAuthModal]);

  // Close the place detail modal with the Escape key
  useEffect(() => {
    if (!selectedPlace) return;
    function onKey(e) {
      if (e.key === "Escape") setSelectedPlace(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedPlace]);

  function closeAuthModal() {
    setShowAuthModal(false);
    setAttemptedPlace(null);
  }

  // Fetch featured places from backend endpoint
  async function loadFeaturedPlaces(category = "all", isRandom = false) {
    try {
      setIsLoading(true);
      setSearchError("");
      const params = new URLSearchParams();
      if (isRandom) params.set("random", "true");
      if (category && category !== "all") params.set("category", category);
      params.set("limit", "16");

      const res = await fetch(`/api/featured-places?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load destinations");
      const data = await res.json();
      const list = data.places || data.data || [];
      setPlaces(list);
      setFeaturedBackup(list);
    } catch (err) {
      console.error("Error fetching destinations:", err);
      setSearchError("Couldn't load destinations. Please try again.");
    } finally {
      setIsLoading(false);
      setIsShuffling(false);
    }
  }

  // Search via backend (OpenStreetMap / Nominatim) with guest limit check
  async function performSearch(query) {
    const q = query.trim();
    if (!q || q.length < 2) {
      if (featuredBackup.length > 0) {
        setPlaces(featuredBackup);
      } else {
        await loadFeaturedPlaces(activeCategory, false);
      }
      setIsSearching(false);
      return;
    }

    // -------------------------------------------------------------
    // Freemium search limit (guests / logged-out users only)
    // -------------------------------------------------------------
    if (!isLoggedIn) {
      let currentCount = 0;
      try {
        currentCount = parseInt(
          localStorage.getItem(GUEST_SEARCH_KEY) || "0",
          10,
        );
        if (Number.isNaN(currentCount)) currentCount = 0;
      } catch (e) {
        currentCount = guestSearchCount;
      }

      // Guest has reached the limit: show the auth modal
      if (currentCount >= GUEST_SEARCH_LIMIT) {
        setAuthModalReason("search_limit");
        setShowAuthModal(true);
        setIsSearching(false);
        return;
      }

      // Increment the count in localStorage
      const nextCount = currentCount + 1;
      try {
        localStorage.setItem(GUEST_SEARCH_KEY, nextCount.toString());
      } catch (e) {
        console.warn("Could not update guest search count", e);
      }
      setGuestSearchCount(nextCount);
    }
    // Logged-in users skip the block above and go straight to the search below.

    try {
      setIsSearching(true);
      setSearchError("");
      const res = await fetch(`/api/search-places?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Search request failed");
      const data = await res.json();
      const results = data.places || data.data || [];
      setPlaces(results);
    } catch (err) {
      console.error("Search error:", err);
      setSearchError("Couldn't search OpenStreetMap. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  // Handle typing in the search bar (debounced, with guest limit check)
  function handleSearchInputChange(e) {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!val.trim()) {
      performSearch("");
      return;
    }

    if (!isLoggedIn && guestSearchCount >= GUEST_SEARCH_LIMIT) {
      setAuthModalReason("search_limit");
      setShowAuthModal(true);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      startTransition(() => {
        performSearch(val);
      });
    }, 450);
  }

  // UI handlers used by the search bar, category chips, and shuffle button.
  function handleSearchSubmit(event) {
    event.preventDefault();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    performSearch(searchQuery);
  }

  function handleClearSearch() {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setSearchQuery("");
    setActiveCategory("all");
    loadFeaturedPlaces("all", false);
  }

  function handleSelectSuggestion(chip) {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setSearchQuery(chip.query);
    performSearch(chip.query);
  }

  function handleCategoryChange(category) {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setSearchQuery("");
    setActiveCategory(category);
    loadFeaturedPlaces(category, false);
  }

  async function handleShufflePlaces() {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setSearchQuery("");
    setIsShuffling(true);
    await loadFeaturedPlaces(activeCategory, true);
  }

  // Toggle destination via the existing Bucket List API.
  async function handleSaveToBucketList(place, e) {
    e?.stopPropagation();

    // Guests can't save; show the login modal instead
    if (!isLoggedIn) {
      setAttemptedPlace(place);
      setAuthModalReason("save_place");
      setShowAuthModal(true);
      return;
    }

    const placeKey = place.name.toLowerCase();
    const savedId = savedBucketMap[placeKey];

    try {
      if (savedId) {
        // Remove
        const res = await fetch(`/api/bucket-list/${savedId}`, {
          method: "DELETE",
        });
        if (!res.ok && res.status !== 404) throw new Error("Delete failed");

        setSavedBucketMap((prev) => {
          const next = { ...prev };
          delete next[placeKey];
          return next;
        });
        showToast(`Removed ${place.name} from your Bucket List.`);
      } else {
        // Add
        const res = await fetch("/api/bucket-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: place.name,
            image: place.image || null,
            location: place.location || null,
          }),
        });

        if (res.status === 409) {
          // Already on the list: resync so the bookmark shows as saved
          const list = await fetch("/api/bucket-list", { cache: "no-store" })
            .then((r) => r.json())
            .catch(() => ({ places: [] }));
          const map = {};
          (list.places ?? []).forEach((p) => {
            if (p.name) map[p.name.toLowerCase()] = p.id;
          });
          setSavedBucketMap(map);
          showToast(`${place.name} is already on your Bucket List.`);
          return;
        }
        if (!res.ok) throw new Error("Save failed");

        const created = await res.json();
        setSavedBucketMap((prev) => ({ ...prev, [placeKey]: created.id }));
        showToast(`${place.name} saved to your Bucket List.`);
      }
    } catch (err) {
      console.error("Failed to update bucket list:", err);
      showToast("Couldn't update your Bucket List. Please try again.");
    }
  }

  // Toast notification
  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  }

  // Start trip planning from a place card
  function handlePlanTrip(place, e) {
    e?.stopPropagation();
    router.push(`/newplan?destination=${encodeURIComponent(place.name)}`);
  }

  const isSearchLimit = authModalReason === "search_limit";

  return (
    <Background>
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 text-gala-text md:px-8 md:py-6 xl:px-12">
        {/* NAV */}
        <Navbar />

        <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
          {/* HEADER + SEARCH */}
          <section className="px-2 py-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gala-text/40 bg-gala-text/10 px-5 py-2 text-sm font-semibold tracking-wider text-gala-text">
              <Icon name="compass" className="h-4 w-4" />
              DREAM · PLAN · GALA
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gala-text md:text-5xl">
              Find your <span className="text-gala-accent">Next na Gala</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-gala-aqua md:text-xl">
              Search popular spots and hidden gems in the Philippines and enjoy
              your trip
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearchSubmit}
              className={`mx-auto mt-6 flex max-w-3xl items-center gap-2 rounded-full border border-gala-aqua/30 ${SURFACE_BG} p-1.5 text-left backdrop-blur-md transition focus-within:border-gala-accent focus-within:ring-4 focus-within:ring-gala-accent/15`}
            >
              <span className="pl-4 text-gala-aqua" aria-hidden="true">
                <Icon name="pin" className="h-5 w-5" />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Where to? (e.g. Batanes, Palawan, Boracay)"
                className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-base text-gala-text placeholder:text-gala-muted focus:outline-none"
                aria-label="Search places and destinations"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gala-raised text-gala-text/70 transition hover:text-gala-text"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              )}

              <button
                type="submit"
                disabled={isSearching}
                className={`flex shrink-0 items-center gap-2 rounded-full px-6 py-2.5 disabled:opacity-70 ${primaryBtn}`}
              >
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin motion-reduce:animate-none rounded-full border-2 border-gala-bg/30 border-t-gala-bg" />
                    <span className="hidden sm:inline">Searching...</span>
                  </span>
                ) : (
                  <>
                    <Icon name="search" className="h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick suggestion chips */}
            <div className="mt-4 flex flex-col items-center gap-2 text-xs sm:text-sm">
              <span className="text-gala-muted">Popular:</span>

              {[QUICK_SUGGESTIONS.slice(0, 5), QUICK_SUGGESTIONS.slice(5)].map(
                (row, rowIdx) => (
                  <div
                    key={rowIdx}
                    className="flex flex-wrap items-center justify-center gap-2"
                  >
                    {row.map((chip) => (
                      <button
                        key={chip.query}
                        type="button"
                        onClick={() => handleSelectSuggestion(chip)}
                        className={`rounded-full px-3 py-1 font-medium ${subtleBtn}`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                ),
              )}
            </div>
          </section>

          {/* CATEGORIES + SHUFFLE */}
          <section
            className={`mx-auto flex w-full max-w-fit items-center gap-1 overflow-x-auto rounded-full border border-gala-aqua/30 ${SURFACE_BG} px-3 py-2 backdrop-blur-md lg:gap-2`}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id && !searchQuery;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? "bg-gala-accent font-semibold text-gala-bg"
                      : "text-gala-text/80 hover:bg-gala-raised"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}

            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm text-gala-text/80 transition hover:bg-gala-raised hover:text-gala-text"
              >
                <Icon name="close" className="h-3.5 w-3.5" />
                Back to featured
              </button>
            )}

            <button
              type="button"
              onClick={handleShufflePlaces}
              disabled={isShuffling}
              className="flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-gala-accent transition hover:bg-gala-raised active:scale-95"
              title="Show a different set of random destinations"
            >
              <Icon
                name="shuffle"
                className={`h-4 w-4 ${isShuffling ? "animate-spin motion-reduce:animate-none" : ""}`}
              />
              <span>Surprise me</span>
            </button>
          </section>

          {/* STATUS LINE */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-sm">
            <div className="flex flex-wrap items-center gap-2 font-medium">
              {searchQuery ? (
                <>
                  <span className="flex items-center gap-1.5 text-gala-accent">
                    <Icon name="search" className="h-4 w-4" />
                    Search results
                  </span>
                  <span className="text-gala-muted">for</span>
                  <span className="font-semibold text-gala-text">
                    "{searchQuery}"
                  </span>
                  <span className="rounded-full border border-gala-accent/50 bg-gala-accent/10 px-2.5 py-0.5 text-xs text-gala-accent">
                    {places.length} {places.length === 1 ? "place" : "places"}
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 text-gala-accent">
                    <Icon name="sparkle" className="h-4 w-4" />
                    Featured & random destinations
                  </span>
                  <span className="rounded-full border border-gala-accent/50 bg-gala-accent/10 px-2.5 py-0.5 text-xs text-gala-accent">
                    {places.length} {places.length === 1 ? "place" : "places"}
                  </span>
                </>
              )}
            </div>

            <span className="text-xs text-gala-muted">
              {searchQuery
                ? "Powered by OpenStreetMap (Nominatim)"
                : "Curated Unsplash travel photos"}
            </span>
          </div>

          {searchError && (
            <div className={`${PANEL} px-4 py-3 text-sm text-red-200`}>
              {searchError}
            </div>
          )}

          {/* PLACES GRID */}
          <main className="flex-1">
            {isLoading || isSearching ? (
              /* Loading skeleton */
              <div className={GRID}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${PANEL} h-[380px] animate-pulse motion-reduce:animate-none`}
                  />
                ))}
              </div>
            ) : places.length === 0 ? (
              /* Empty state */
              <div
                className={`${PANEL} mx-auto my-12 flex max-w-lg flex-col items-center p-10 text-center`}
              >
                <span className="grid h-16 w-16 place-items-center rounded-2xl border border-gala-line bg-gala-raised text-gala-accent">
                  <Icon name="search" className="h-8 w-8" />
                </span>
                <h3 className="mt-4 text-2xl font-bold text-gala-text">No places found</h3>
                <p className="mt-2 text-sm text-gala-text/75">
                  No matching destinations for "<strong>{searchQuery}</strong>".
                  Check the spelling or try a popular island or city.
                </p>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className={`mt-6 rounded-full px-6 py-2.5 ${primaryBtn}`}
                >
                  View featured places
                </button>
              </div>
            ) : (
              /* Destination cards */
              <div className={GRID}>
                {places.map((place) => {
                  const isSaved = !!savedBucketMap[place.name?.toLowerCase()];

                  return (
                    <article
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className={`${CARD} cursor-pointer`}
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/11] w-full overflow-hidden bg-gala-surface">
                        <img
                          src={place.image}
                          alt={place.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src =
                              place.fallbackImage || "/destinations/elnido.jpg";
                          }}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-linear-to-t from-gala-bg/90 via-transparent to-gala-bg/30" />

                        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                          <span className="flex items-center gap-1 rounded-full bg-gala-bg/70 px-2.5 py-1 text-xs font-semibold text-gala-gold backdrop-blur-md">
                            <Icon name="star" filled className="h-3.5 w-3.5" />
                            <span>{place.rating || "4.8"}</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleSaveToBucketList(place, e)}
                            aria-label={
                              isSaved
                                ? "Remove from bucket list"
                                : "Save to bucket list"
                            }
                            title={
                              !isLoggedIn
                                ? "Log in to save this to your Bucket List"
                                : isSaved
                                  ? "Saved to Bucket List"
                                  : "Save to Bucket List"
                            }
                            className={`flex h-9 w-9 items-center justify-center rounded-full border transition active:scale-90 ${
                              isSaved
                                ? "border-gala-accent bg-gala-accent text-gala-bg"
                                : "border-gala-line bg-gala-bg/70 text-gala-text/80 hover:bg-gala-raised hover:text-gala-text"
                            }`}
                          >
                            <Icon
                              name="bookmark"
                              filled={isSaved}
                              className="h-4 w-4"
                            />
                          </button>
                        </div>

                        {place.category && (
                          <div className="absolute bottom-3 left-3">
                            <span className="rounded-full border border-gala-aqua/40 bg-gala-bg/70 px-3 py-1 text-xs font-medium text-gala-aqua backdrop-blur-md">
                              {place.category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="text-xl font-semibold leading-tight tracking-tight text-gala-text transition group-hover:text-gala-accent">
                          {place.name}
                        </h3>

                        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gala-aqua">
                          <Icon name="pin" className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{place.location}</span>
                        </p>

                        <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-gala-text/75">
                          {place.description}
                        </p>

                        {Array.isArray(place.tags) && place.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {place.tags.slice(0, 3).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="rounded-full border border-gala-line bg-gala-raised px-2.5 py-0.5 text-xs text-gala-text/75"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto pt-4">
                          <div className="flex items-center gap-2 border-t border-gala-line pt-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPlace(place);
                              }}
                              className={`flex-1 rounded-full py-2 text-center text-xs ${subtleBtn}`}
                            >
                              Details
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handlePlanTrip(place, e)}
                              className={`flex-1 rounded-full py-2 text-center text-xs ${primaryBtn}`}
                            >
                              Plan trip
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {/* PLACE DETAIL MODAL */}
        {selectedPlace && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSelectedPlace(null);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-place-title"
              className={`${MODAL} max-h-[90vh] w-full max-w-2xl overflow-y-auto p-0`}
            >
              {/* Hero image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-gala-surface">
                <img
                  src={selectedPlace.image}
                  alt={selectedPlace.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      selectedPlace.fallbackImage || "/destinations/elnido.jpg";
                  }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

                <button
                  type="button"
                  onClick={() => setSelectedPlace(null)}
                  aria-label="Close"
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-gala-text transition hover:bg-black/70"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>

                <div className="absolute bottom-5 left-6 right-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-gala-accent/50 bg-gala-accent/15 px-3 py-1 text-xs font-semibold text-gala-accent">
                      {selectedPlace.category || "Destination"}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-gala-bg/70 px-2.5 py-1 text-xs font-medium text-gala-gold">
                      <Icon name="star" filled className="h-3.5 w-3.5" />
                      {selectedPlace.rating || "4.8"}
                    </span>
                  </div>
                  <h2
                    id="modal-place-title"
                    className="mt-2 text-3xl font-bold text-gala-text"
                  >
                    {selectedPlace.name}
                  </h2>
                  <p className="flex items-center gap-1.5 text-sm text-gala-aqua">
                    <Icon name="pin" className="h-4 w-4 shrink-0" />
                    <span>{selectedPlace.location}</span>
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-5 p-6 text-sm">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gala-aqua">
                    About
                  </h4>
                  <p className="mt-1.5 leading-relaxed text-gala-text/80">
                    {selectedPlace.description}
                  </p>
                </div>

                {selectedPlace.highlights &&
                  selectedPlace.highlights.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gala-aqua">
                        Highlights
                      </h4>
                      <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {selectedPlace.highlights.map((h, hIdx) => (
                          <li
                            key={hIdx}
                            className="flex items-center gap-2 rounded-xl border border-gala-line bg-gala-raised px-3 py-2 text-gala-text/90"
                          >
                            <Icon
                              name="check"
                              className="h-4 w-4 shrink-0 text-gala-accent"
                            />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedPlace.bestTimeToVisit && (
                  <div className="rounded-2xl border border-gala-line bg-gala-raised/60 p-4">
                    <span className="flex items-center gap-2 font-semibold text-gala-accent">
                      <Icon name="calendar" className="h-4 w-4" />
                      Best time to visit
                    </span>
                    <p className="mt-1 text-gala-text/80">
                      {selectedPlace.bestTimeToVisit}
                    </p>
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedPlace(null)}
                    className={`rounded-full px-5 py-2.5 ${subtleBtn}`}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSaveToBucketList(selectedPlace, e)}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm ${
                      savedBucketMap[selectedPlace.name?.toLowerCase()]
                        ? "border border-gala-accent bg-gala-accent/15 font-semibold text-gala-accent transition"
                        : outlineBtn
                    }`}
                  >
                    <Icon
                      name="bookmark"
                      filled={!!savedBucketMap[selectedPlace.name?.toLowerCase()]}
                      className="h-4 w-4"
                    />
                    {savedBucketMap[selectedPlace.name?.toLowerCase()]
                      ? "Remove from Bucket List"
                      : "Save to Bucket List"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanTrip(selectedPlace)}
                    className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm ${primaryBtn}`}
                  >
                    Plan your trip
                    <Icon name="plane" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUTH MODAL (guest search limit / save place) */}
        {showAuthModal && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeAuthModal();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              className={`${MODAL} relative w-full max-w-md p-8 text-center`}
            >
              <button
                type="button"
                onClick={closeAuthModal}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gala-raised text-gala-text/70 transition hover:text-gala-text"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-gala-line bg-gala-raised text-gala-accent">
                <Icon
                  name={isSearchLimit ? "search" : "bookmark"}
                  className="h-8 w-8"
                />
              </div>

              <h2
                id="auth-modal-title"
                className="mt-5 text-2xl font-bold tracking-tight text-gala-text"
              >
                {isSearchLimit ? (
                  <>
                    You've used your{" "}
                    <span className="text-gala-accent">
                      {GUEST_SEARCH_LIMIT} free searches
                    </span>
                  </>
                ) : (
                  <>
                    Log in to{" "}
                    <span className="text-gala-accent">save places</span>
                  </>
                )}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-gala-text/75">
                {isSearchLimit
                  ? "Create a free account or log in to keep searching destinations around the world."
                  : attemptedPlace?.name
                    ? `Create a free account or log in to save ${attemptedPlace.name} to your Bucket List and start planning your trip.`
                    : "Create a free account or log in to save destinations to your Bucket List."}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/signup"
                  className={`rounded-full px-6 py-2.5 text-center ${primaryBtn}`}
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  className={`rounded-full px-6 py-2.5 text-center ${outlineBtn}`}
                >
                  Log in
                </Link>
              </div>

              <button
                type="button"
                onClick={closeAuthModal}
                className="mt-4 text-sm text-gala-muted transition hover:text-gala-text"
              >
                {isSearchLimit ? "Maybe later" : "Keep browsing"}
              </button>
            </div>
          </div>
        )}

        {/* TOAST */}
        {toastMessage && (
          <div
            role="status"
            className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-full border border-gala-aqua/40 bg-gala-surface px-6 py-3 text-sm font-medium text-gala-text shadow-card backdrop-blur-md">
              <Icon name="check" className="h-4 w-4 text-gala-accent" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </Background>
  );
}