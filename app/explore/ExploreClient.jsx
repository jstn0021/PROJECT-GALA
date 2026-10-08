"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Background } from "@/app/components/AuthCard";
import Navbar from "@/app/components/Navbar";

// Preset quick-search suggestions for rapid user discovery
const QUICK_SUGGESTIONS = [
  { label: "🏝️ Boracay", query: "Boracay" },
  { label: "🌊 El Nido", query: "El Nido" },
  { label: "🍓 Baguio", query: "Baguio" },
  { label: "🏄 Siargao", query: "Siargao" },
  { label: "🌋 Batanes", query: "Batanes" },
  { label: "🍫 Bohol", query: "Chocolate Hills" },
  { label: "🌸 Kyoto", query: "Kyoto" },
  { label: "🗼 Tokyo", query: "Tokyo" },
  { label: "🏖️ Bali", query: "Bali" },
];

const CATEGORIES = [
  { id: "all", label: "Lahat (All)" },
  { id: "beaches", label: "🏝️ Beaches & Islands" },
  { id: "mountains", label: "⛰️ Mountains & Nature" },
  { id: "heritage", label: "🏛️ Heritage & Culture" },
  { id: "cities", label: "🌆 Cities & Food" },
];

// Freemium Search Limit Constants para sa mga Guest
const GUEST_SEARCH_LIMIT = 3;
const GUEST_SEARCH_KEY = "gala_guest_search_count";

export default function ExploreClient({ initialIsLoggedIn = false, user = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("query") || "";

  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [currentUser, setCurrentUser] = useState(user);
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
            setCurrentUser(data.user);
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

  // Load existing bucket list from localStorage to know what's already saved
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bucket-list");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const map = {};
          parsed.forEach((item) => {
            if (item.name) map[item.name.toLowerCase()] = true;
          });
          setSavedBucketMap(map);
        }
      }
    } catch (e) {
      console.warn("Could not read bucket-list from localStorage", e);
    }
  }, []);

  // Fetch initial featured places on page mount
  useEffect(() => {
    async function loadInitial() {
      setIsLoading(true);
      try {
        if (initialQuery.trim().length >= 2) {
          // If query was passed from landing page form
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
      if (!res.ok) throw new Error("Failed to load mga galaan");
      const data = await res.json();
      const list = data.places || data.data || [];
      setPlaces(list);
      setFeaturedBackup(list);
    } catch (err) {
      console.error("Error fetching mga galaan:", err);
      setSearchError("Hindi ma-load ang mga galaan. Pakisubukan muli.");
    } finally {
      setIsLoading(false);
      setIsShuffling(false);
    }
  }

  // Search function connecting to backend Nominatim OpenStreetMap endpoint
  // with Freemium Search Limit check for Guest users
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
    // Freemium Search Limit Check (PARA LAMANG SA MGA HINDI NAKA-LOG IN / GUEST)
    // -------------------------------------------------------------
    if (!isLoggedIn) {
      let currentCount = 0;
      try {
        currentCount = parseInt(localStorage.getItem(GUEST_SEARCH_KEY) || "0", 10);
        if (Number.isNaN(currentCount)) currentCount = 0;
      } catch (e) {
        currentCount = guestSearchCount;
      }

      // Kapag Guest AT umabot na sa limit, tsaka lang ilalabas ang modal
      if (currentCount >= GUEST_SEARCH_LIMIT) {
        setAuthModalReason("search_limit");
        setShowAuthModal(true);
        setIsSearching(false);
        return;
      }

      // Dagdagan ang count sa localStorage
      const nextCount = currentCount + 1;
      try {
        localStorage.setItem(GUEST_SEARCH_KEY, nextCount.toString());
      } catch (e) {
        console.warn("Could not update guest search count", e);
      }
      setGuestSearchCount(nextCount);
    }
    // PAG NAKA-LOG IN (isLoggedIn === true), LALAMPASAN NIYA LANG ANG IF BLOCK SA TAAS AT DIRETSO AGAD SA SEARCH SA BABA!

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
      setSearchError("Nagka-problema sa paghahanap sa OpenStreetMap. Pakisubukan muli.");
    } finally {
      setIsSearching(false);
    }
  }

  // Handle typing in search bar with debounce & guest limit check
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

    // DAGDAGAN NG `!isLoggedIn &&` DITO PARA DITO RIN HINDI MAG-LOCK PAG NAKA-LOG IN
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

  // Explicit submit button or Enter key
  function handleSearchSubmit(e) {
    e?.preventDefault();
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // Guest search limit check bago mag-submit
    if (!isLoggedIn && guestSearchCount >= GUEST_SEARCH_LIMIT) {
      setAuthModalReason("search_limit");
      setShowAuthModal(true);
      return;
    }

    performSearch(searchQuery);
  }

  // Clear search bar
  function handleClearSearch() {
    setSearchQuery("");
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    loadFeaturedPlaces(activeCategory, false);
    searchInputRef.current?.focus();
  }

  // Click quick suggestion chip
  function handleSelectSuggestion(chip) {
    if (!isLoggedIn && guestSearchCount >= GUEST_SEARCH_LIMIT) {
      setAuthModalReason("search_limit");
      setShowAuthModal(true);
      return;
    }

    setSearchQuery(chip.query);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    performSearch(chip.query);
  }

  // Handle category filter tabs
  function handleCategoryChange(catId) {
    setActiveCategory(catId);
    setSearchQuery("");
    loadFeaturedPlaces(catId, false);
  }

  // Shuffle / Surprise Me (Random Places)
  function handleShufflePlaces() {
    setIsShuffling(true);
    setSearchQuery("");
    loadFeaturedPlaces(activeCategory, true);
  }

  // -------------------------------------------------------------
  // Save Place Restriction (Para sa mga Guest)
  // -------------------------------------------------------------
  function handleSaveToBucketList(place, e) {
    e?.stopPropagation();

    // Kapag guest, HUWAG itong i-save; mag-pop up ng login modal!
    if (!isLoggedIn) {
      setAttemptedPlace(place);
      setAuthModalReason("save_place");
      setShowAuthModal(true);
      return;
    }

    // Naka-log in ang user: I-save sa Bucket List
    try {
      const stored = localStorage.getItem("bucket-list");
      const list = stored ? JSON.parse(stored) : [];
      const placeKey = place.name.toLowerCase();

      if (savedBucketMap[placeKey]) {
        // Remove from bucket list
        const updated = list.filter((item) => item.name?.toLowerCase() !== placeKey);
        localStorage.setItem("bucket-list", JSON.stringify(updated));
        setSavedBucketMap((prev) => {
          const next = { ...prev };
          delete next[placeKey];
          return next;
        });
        showToast(`Inalis ang ${place.name} sa Bucket List.`);
      } else {
        // Add to bucket list
        const newItem = {
          id: Date.now(),
          name: place.name,
          priority: "want",
          note: place.description || `Mula sa Explore: ${place.location}`,
          color: ["coral", "lime", "blue", "green"][Math.floor(Math.random() * 4)],
          completed: false,
          visited: false,
        };
        const updated = [...list, newItem];
        localStorage.setItem("bucket-list", JSON.stringify(updated));
        setSavedBucketMap((prev) => ({ ...prev, [placeKey]: true }));
        showToast(`Nai-save ang ${place.name} sa iyong Bucket List! 🔖`);
      }
    } catch (err) {
      console.error("Failed to save to bucket-list:", err);
      showToast("Hindi ma-save ang destinasyon.");
    }
  }

  // Show toast notification
  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  }

  // Direct trip planning from a place card
  function handlePlanTrip(place, e) {
    e?.stopPropagation();
    router.push(`/newplan?destination=${encodeURIComponent(place.name)}`);
  }

  const isGuestLimitReached = !isLoggedIn && guestSearchCount >= GUEST_SEARCH_LIMIT;

  return (
    <Background>
      <div className="relative min-h-screen pb-24 text-white">
        {/* Navigation Bar */}
        <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6">
          <Navbar />
        </div>

        {/* Hero & Search Header */}
        <header className="mx-auto mt-6 max-w-5xl px-4 text-center sm:px-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-500/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-teal-200 backdrop-blur-md">
            <span>🧭</span>
            <span>Dream · Plan · Gala</span>
          </div>

          {/* Heading */}
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Hanapin ang Iyong{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-teal-300 to-amber-200 bg-clip-text text-transparent">
              Next na Gala
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-base text-white/80 sm:text-lg">
            Maghanap ng mga sikat na pasyalan at bagong lugar sa Pilipinas at sa buong mundo
            gamit ang real-time OpenStreetMap search.
          </p>

          {/* Prominent Search Bar */}
          <div className="mx-auto mt-8 max-w-2xl">
            <form
              onSubmit={handleSearchSubmit}
              className={`glass group relative flex items-center rounded-2xl p-2 shadow-2xl transition-all duration-300 focus-within:border-teal-300/80 focus-within:shadow-[0_0_35px_rgba(45,212,191,0.25)] sm:rounded-full "border-amber-400/50"`}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder={
                  "Saan ang gala nyo? (hal. Batanes, Palawan, Boracay,)"
                }
                className="w-full bg-transparent px-3 py-3 text-base text-white placeholder-white/55 outline-none focus:placeholder-white/40 sm:text-lg"
                aria-label="Search places and destinations"
              />

              {/* Clear button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white/70 transition hover:bg-white/30 hover:text-white"
                >
                  ✕
                </button>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSearching}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3 font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:from-teal-400 hover:to-emerald-400 active:scale-95 sm:rounded-full"
              >
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span className="hidden sm:inline">Searching...</span>
                  </span>
                ) : (
                  <span>Search</span>
                )}
              </button>
            </form>

            {/* Quick Suggestion Chips */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
              <span className="text-white/60">Sikat na lugar:</span>
              {QUICK_SUGGESTIONS.map((chip) => (
                <button
                  key={chip.query}
                  type="button"
                  onClick={() => handleSelectSuggestion(chip)}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium text-white/90 backdrop-blur-md transition hover:border-teal-300/50 hover:bg-teal-500/25 hover:text-teal-100"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Category Pills & Shuffle Controls */}
        <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
          <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-3 sm:rounded-full sm:px-6">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id && !searchQuery;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition sm:text-sm ${isActive
                      ? "bg-gradient-to-r from-teal-500/80 to-cyan-500/80 text-white shadow-md shadow-teal-500/30"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Surprise Me / Shuffle button */}
            <div className="flex items-center gap-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white/80 transition hover:bg-white/20 hover:text-white sm:text-sm"
                >
                  ✕ Ibalik sa Featured
                </button>
              )}

              <button
                type="button"
                onClick={handleShufflePlaces}
                disabled={isShuffling}
                className="flex items-center gap-2 rounded-full border border-teal-300/40 bg-teal-500/20 px-4 py-2 text-xs font-semibold text-teal-100 backdrop-blur-md transition hover:bg-teal-500/35 active:scale-95 sm:text-sm"
                title="Magpakita ng ibang mga random na destinasyon"
              >
                <span className={`text-base ${isShuffling ? "animate-spin" : ""}`}>🎲</span>
                <span>Surprise Me / Random Places</span>
              </button>
            </div>
          </div>

          {/* Status line */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 px-2 text-sm">
            <div className="flex items-center gap-2 font-medium">
              {searchQuery ? (
                <>
                  <span className="text-teal-300">🔍 Search Results</span>
                  <span className="text-white/60">para sa</span>
                  <span className="font-semibold text-white">"{searchQuery}"</span>
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-white/80">
                    {places.length} lugar
                  </span>
                </>
              ) : (
                <>
                  <span className="text-amber-300">✨ Featured & Random Destinations</span>
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-white/80">
                    {places.length} napiling lugar
                  </span>
                </>
              )}
            </div>

            <span className="text-xs text-white/50">
              {searchQuery ? "Powered by OpenStreetMap (Nominatim)" : "Curated Unsplash Travel Photos"}
            </span>
          </div>

          {searchError && (
            <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/20 px-4 py-3 text-sm text-red-200">
              {searchError}
            </div>
          )}
        </section>

        {/* Places Grid */}
        <main className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
          {isLoading || isSearching ? (
            /* Loading Skeleton Grid */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-dark flex h-[380px] animate-pulse flex-col overflow-hidden rounded-3xl p-3"
                >
                  <div className="h-48 w-full rounded-2xl bg-white/10" />
                  <div className="mt-4 h-6 w-3/4 rounded-lg bg-white/15" />
                  <div className="mt-2 h-4 w-1/2 rounded-md bg-white/10" />
                  <div className="mt-3 h-10 w-full rounded-md bg-white/5" />
                  <div className="mt-auto h-9 w-full rounded-xl bg-white/10" />
                </div>
              ))}
            </div>
          ) : places.length === 0 ? (
            /* Empty Search Results State */
            <div className="glass mx-auto my-12 flex max-w-lg flex-col items-center rounded-3xl p-10 text-center">
              <span className="text-6xl">🔍🍃</span>
              <h3 className="mt-4 text-2xl font-bold">Walang nahanap na lugar</h3>
              <p className="mt-2 text-sm text-white/70">
                Walang tugmang destinasyon para sa "<strong>{searchQuery}</strong>".
                Subukang i-check ang baybay o subukan ang mga tanyag na isla at lungsod.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="rounded-full bg-teal-500 px-6 py-2.5 font-medium text-white transition hover:bg-teal-400"
                >
                  Tingnan ang Featured Places
                </button>
              </div>
            </div>
          ) : (
            /* Destination Cards Grid */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {places.map((place) => {
                const isSaved = !!savedBucketMap[place.name?.toLowerCase()];

                return (
                  <article
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className="group glass-dark relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/20 transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-300/50 hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
                  >
                    {/* Image Container with overlays */}
                    <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-900">
                      <img
                        src={place.image}
                        alt={place.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = place.fallbackImage || "/destinations/elnido.jpg";
                        }}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                        {/* Rating pill */}
                        <span className="flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
                          <span>⭐</span>
                          <span>{place.rating || "4.8"}</span>
                        </span>

                        {/* Bookmark / Bucket list Button */}
                        <button
                          type="button"
                          onClick={(e) => handleSaveToBucketList(place, e)}
                          aria-label={isSaved ? "Remove from bucket list" : "Save to bucket list"}
                          title={
                            !isLoggedIn
                              ? "Mag-log in para mai-save ito sa Bucket List"
                              : isSaved
                                ? "Naka-save sa Bucket List"
                                : "I-save sa Bucket List"
                          }
                          className={`flex h-9 w-9 items-center justify-center rounded-full border transition active:scale-90 ${isSaved
                            ? "border-teal-300 bg-teal-500 text-white shadow-lg shadow-teal-500/50"
                            : "border-white/30 bg-black/50 text-white/80 hover:bg-black/70 hover:text-white"
                            }`}
                        >
                          {isSaved ? "🔖" : "🤍"}
                        </button>
                      </div>

                      {/* Category chip over image */}
                      {place.category && (
                        <div className="absolute bottom-3 left-3">
                          <span className="rounded-full bg-teal-950/70 px-3 py-1 text-[11px] font-medium text-teal-200 backdrop-blur-md border border-teal-500/30">
                            {place.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-1 flex-col p-5">
                      {/* Place Name */}
                      <h3 className="text-xl font-bold tracking-tight text-white transition group-hover:text-teal-300">
                        {place.name}
                      </h3>

                      {/* Location / Province */}
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-teal-200/90">
                        <span>📍</span>
                        <span className="truncate">{place.location}</span>
                      </p>

                      {/* Description */}
                      <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-white/75">
                        {place.description}
                      </p>

                      {/* Tags */}
                      {Array.isArray(place.tags) && place.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {place.tags.slice(0, 3).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/70"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Action Buttons Footer */}
                      <div className="mt-auto pt-4">
                        <div className="flex items-center gap-2 border-t border-white/10 pt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlace(place);
                            }}
                            className="flex-1 rounded-xl border border-white/25 bg-white/10 py-2 text-center text-xs font-medium text-white transition hover:bg-white/20"
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handlePlanTrip(place, e)}
                            className="flex-1 rounded-xl bg-gradient-to-r from-teal-500/80 to-emerald-500/80 py-2 text-center text-xs font-semibold text-white shadow-md transition hover:from-teal-400 hover:to-emerald-400"
                          >
                            Plan Trip
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

        {/* Place Detail Modal */}
        {selectedPlace && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedPlace(null);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-place-title"
              className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-0 shadow-2xl"
            >
              {/* Modal Hero Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                <img
                  src={selectedPlace.image}
                  alt={selectedPlace.name}
                  onError={(e) => {
                    e.currentTarget.src = selectedPlace.fallbackImage || "/destinations/elnido.jpg";
                  }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedPlace(null)}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-lg text-white/90 backdrop-blur-md transition hover:bg-black/90 hover:text-white"
                >
                  ✕
                </button>

                {/* Title on Image */}
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-teal-500/80 px-3 py-1 text-xs font-semibold text-white">
                      {selectedPlace.category || "Destinasyon"}
                    </span>
                    <span className="rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-amber-300">
                      ⭐ {selectedPlace.rating || "4.8"}
                    </span>
                  </div>
                  <h2 id="modal-place-title" className="mt-2 text-2xl font-bold sm:text-3xl">
                    {selectedPlace.name}
                  </h2>
                  <p className="flex items-center gap-1.5 text-sm text-teal-200">
                    <span>📍</span>
                    <span>{selectedPlace.location}</span>
                  </p>
                </div>
              </div>

              {/* Modal Details Body */}
              <div className="space-y-5 p-6 text-sm">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                    About
                  </h4>
                  <p className="mt-1.5 leading-relaxed text-white/85">
                    {selectedPlace.description}
                  </p>
                </div>

                {selectedPlace.highlights && selectedPlace.highlights.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                      Highlights
                    </h4>
                    <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {selectedPlace.highlights.map((h, hIdx) => (
                        <li
                          key={hIdx}
                          className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-white/90"
                        >
                          <span className="text-teal-400">✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedPlace.bestTimeToVisit && (
                  <div className="rounded-2xl border border-teal-500/30 bg-teal-950/40 p-4">
                    <span className="font-semibold text-teal-200">
                      🗓️ Best Time To Visit:
                    </span>
                    <p className="mt-1 text-white/80">{selectedPlace.bestTimeToVisit}</p>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedPlace(null)}
                    className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-white/80 transition hover:bg-white/20 hover:text-white"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSaveToBucketList(selectedPlace, e)}
                    className={`rounded-xl px-5 py-2.5 font-medium transition ${savedBucketMap[selectedPlace.name?.toLowerCase()]
                      ? "border border-teal-300 bg-teal-500/40 text-white"
                      : "border border-white/30 bg-white/15 text-white hover:bg-white/25"
                      }`}
                  >
                    {savedBucketMap[selectedPlace.name?.toLowerCase()]
                      ? "Inalis sa Bucket List 🔖"
                      : "I-save sa Bucket List 🔖"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanTrip(selectedPlace)}
                    className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:from-teal-400 hover:to-emerald-400"
                  >
                    Plan your trip ✈️
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-bounce">
            <div className="glass flex items-center gap-3 rounded-full border border-teal-400/50 bg-slate-950/90 px-6 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-xl">
              <span>✨</span>
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </Background>
  );
}
