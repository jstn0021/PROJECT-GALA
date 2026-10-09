"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
 * HELPERS
 * ───────────────────────────────────────────────────────────────────────────*/

/**
 * Builds the dropdown label from a mapped place object returned by
 * /api/search-places.  Falls back gracefully when fields are missing.
 *
 * @param {Object} p
 * @returns {string}
 */
function buildLabel(p) {
  // `label` is already a formatted PH address from the API
  return p.label || p.name || "Unknown Place";
}

/* ─────────────────────────────────────────────────────────────────────────────
 * COMPONENT
 * ───────────────────────────────────────────────────────────────────────────*/

/**
 * Typeahead destination search restricted to the Philippines.
 *
 * Props:
 *   value        {string}   – controlled input value
 *   onChange     {Function} – (text: string) => void  — fires on every keystroke
 *   onSelect     {Function} – (location: Object) => void — fires on item pick
 *   onOpenChange {Function} – (isOpen: boolean) => void — optional
 *   placeholder  {string}
 *   id           {string}
 *   invalid      {boolean}
 *   autoFocus    {boolean}
 */
export default function LocationSearch({
  value,
  onChange,
  onSelect,
  onOpenChange,
  placeholder = "Search a Philippine destination…",
  id,
  invalid = false,
  autoFocus = false,
}) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState(-1);

  const boxRef = useRef(null);
  const skipRef = useRef(false);

  // Notify parent when dropdown opens/closes
  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // Debounced search — fires 350 ms after the user stops typing
  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }

    const q = value.trim();
    if (q.length < 3) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/search-places?q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const places = data.places ?? [];

        setResults(places);
        setActive(-1);
        setOpen(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Couldn't load suggestions. Try again.");
          setOpen(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function choose(place) {
    const label = buildLabel(place);
    if (label !== value) skipRef.current = true;
    onSelect(place);
    setOpen(false);
    setResults([]);
  }

  function onKeyDown(e) {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      setOpen(false);
      return;
    }
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      choose(results[active]);
    }
  }

  return (
    <div ref={boxRef} className="relative">
      {/* Input */}
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
        >
          📍
        </span>
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-invalid={invalid}
          autoComplete="off"
          autoFocus={autoFocus}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          className={`glass-input h-11 w-full rounded-xl pl-11 pr-10 ${
            invalid ? "is-error" : ""
          }`}
        />
        {loading && (
          <span className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/20 bg-indigo-950 shadow-2xl shadow-black/50"
        >
          {/* Error state */}
          {error && <li className="px-4 py-3 text-sm text-red-200">{error}</li>}

          {/* Empty state */}
          {!error && results.length === 0 && !loading && (
            <li className="px-4 py-3 text-sm text-white/60">
              No Philippine destinations found.
            </li>
          )}

          {/* Results */}
          {results.map((place, index) => (
            <li
              key={place.id ?? `${place.lat}-${place.lng}-${index}`}
              role="option"
              aria-selected={index === active}
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(place)}
                onMouseEnter={() => setActive(index)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${
                  index === active ? "bg-white/15" : "hover:bg-white/10"
                }`}
              >
                {/* Thumbnail */}
                <img
                  src={place.image || "/destinations/elnido.jpg"}
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-14 shrink-0 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/destinations/elnido.jpg";
                  }}
                />

                {/* Text */}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">
                    {place.name}
                  </span>
                  <span className="block truncate text-xs text-white/55">
                    {buildLabel(place)}
                  </span>
                </span>

                {/* Type badge */}
                {place.type && place.type !== "place" && (
                  <span className="shrink-0 rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-white/40 capitalize">
                    {place.type}
                  </span>
                )}
              </button>
            </li>
          ))}

          {/* Attribution */}
          <li className="border-t border-white/10 px-4 py-1.5 text-[10px] text-white/40">
            © OpenStreetMap contributors · Wikimedia Commons
          </li>
        </ul>
      )}
    </div>
  );
}
