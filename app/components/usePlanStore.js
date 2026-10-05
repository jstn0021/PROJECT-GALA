"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/*
 * Pansamantalang shared storage (localStorage) para magkakonekta ang
 * My plans, Bucket list at Journal. Papalitan ng database mamaya.
 */

export const PLANS_KEY = "gala:plans:v3";
export const BUCKET_KEY = "gala:bucket:v3";

export function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Parang useState, pero naka-save sa localStorage at naka-share sa lahat ng page.
// Ang 3rd value (ready) ay true na kapag nabasa na ang saved data sa browser.
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());

function subscribe(callback) {
  listeners.add(callback);
  window.addEventListener("storage", callback);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

const subscribeNone = () => () => {};

function readRaw(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function useStoredState(key, initial) {
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => null);
  const ready = useSyncExternalStore(subscribeNone, () => true, () => false);

  const value = useMemo(() => {
    if (raw === null) return initial;

    try {
      return JSON.parse(raw);
    } catch {
      return initial;
    }
  }, [raw, initial]);

  const setValue = useCallback(
    (next) => {
      let current = initial;
      const rawNow = readRaw(key);

      if (rawNow !== null) {
        try {
          current = JSON.parse(rawNow);
        } catch {}
      }

      const resolved = typeof next === "function" ? next(current) : next;

      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {}

      emit();
    },
    [key, initial]
  );

  return [value, setValue, ready];
}

// Sample plans (galing sa my-plans mo). Burahin ang mga pang-test pag okay na.
export const SEED_PLANS = [
  {
    id: 1,
    title: "Kyoto spring trip",
    destination: "Kyoto, Japan",
    startDate: "2026-10-01",
    endDate: "2026-10-05",
    spent: 1250,
    budget: 2200,
    color: "from-rose-400 to-orange-300",
    bucketId: 1,
  },
  {
    id: 2,
    title: "Lisbon food trip",
    destination: "Lisbon, Portugal",
    startDate: "2026-06-02",
    endDate: "2026-06-06",
    spent: 540,
    budget: 1200,
    color: "from-yellow-300 to-lime-300",
    bucketId: 2,
  },
  {
    id: 3,
    title: "Bali week",
    destination: "Bali, Indonesia",
    startDate: "2026-10-08",
    endDate: "2026-10-14",
    spent: 800,
    budget: 1700,
    color: "from-cyan-300 to-indigo-400",
  },
  {
    id: 4,
    title: "Banff road trip",
    destination: "Banff, Canada",
    startDate: "2027-01-03",
    endDate: "2027-01-09",
    spent: 2600,
    budget: 2600,
    color: "from-emerald-300 to-teal-400",
  },
  // ---- Pang-test lang ----
  {
    id: 7,
    title: "Baguio weekend",
    destination: "Baguio, Philippines",
    startDate: "2026-10-04",
    endDate: "2026-10-08",
    spent: 3200,
    budget: 5000,
    color: "from-emerald-300 to-sky-400",
  },
  {
    id: 8,
    title: "Tagaytay day trip",
    destination: "Tagaytay, Philippines",
    startDate: "2026-09-20",
    endDate: "2026-09-22",
    spent: 1800,
    budget: 1500,
    color: "from-amber-300 to-rose-400",
  }, 
];