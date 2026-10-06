"use client";

import { useEffect, useRef, useState } from "react";

function buildLabel(p) {
  const parts = [p.name, p.city, p.state, p.country].filter(Boolean);
  return [...new Set(parts)].join(", ");
}

export default function LocationSearch({
  value,
  onChange, // (text) => void, tinatawag habang nagta-type
  onSelect, // (location) => void, tinatawag kapag pumili
  onOpenChange, // (isOpen) => void, para i-hide ang nasa ilalim habang bukas
  placeholder = "Search a place, e.g. Kyoto",
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

  // Ipaalam sa parent kung bukas o sarado ang listahan
  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // Mag-search 350ms matapos tumigil sa pag-type
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
          `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();

        setResults(
          (data.features ?? []).map((f) => ({
            name: f.properties.name || buildLabel(f.properties),
            label: buildLabel(f.properties),
            country: f.properties.country ?? "",
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          })),
        );
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

  // Isara kapag nag-click sa labas
  useEffect(() => {
    function onDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function choose(place) {
    if (place.label !== value) skipRef.current = true;
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
          className={`glass-input h-11 w-full rounded-xl pl-11 pr-10 ${invalid ? "is-error" : ""}`}
        />
        {loading && (
          <span className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        )}
      </div>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/20 bg-indigo-950 shadow-2xl shadow-black/50"
        >
          {error && <li className="px-4 py-3 text-sm text-red-200">{error}</li>}

          {!error && results.length === 0 && !loading && (
            <li className="px-4 py-3 text-sm text-white/60">
              No places found.
            </li>
          )}

          {results.map((place, index) => (
            <li
              key={`${place.lat}-${place.lng}-${index}`}
              role="option"
              aria-selected={index === active}
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(place)}
                onMouseEnter={() => setActive(index)}
                className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition ${
                  index === active ? "bg-white/15" : "hover:bg-white/10"
                }`}
              >
                <span aria-hidden="true" className="mt-0.5">
                  📍
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {place.name}
                  </span>
                  <span className="block truncate text-xs text-white/60">
                    {place.label}
                  </span>
                </span>
              </button>
            </li>
          ))}

          <li className="border-t border-white/10 px-4 py-1.5 text-[10px] text-white/40">
            © OpenStreetMap contributors
          </li>
        </ul>
      )}
    </div>
  );
}
