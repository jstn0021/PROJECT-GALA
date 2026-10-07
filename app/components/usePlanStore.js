"use client";

import { useState, useEffect, useCallback } from "react";

export const PLANS_KEY = "travel-plans";
export const BUCKET_KEY = "bucket-list";

export const SEED_PLANS = [
  {
    id: "seed-1",
    title: "Siargao Getaway",
    destination: "Siargao, Surigao del Norte",
    startDate: "2026-12-10",
    endDate: "2026-12-14",
    budget: 25000,
    spent: 8000,
    status: "Upcoming",
    color: "from-cyan-400 to-teal-500",
  },
];

export function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Returns [value, setValue, ready]
// ready = true na kapag nabasa na ang localStorage (iwas hydration flicker)
export function useStoredState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) setValue(JSON.parse(item));
    } catch (err) {
      console.error(`Failed to read "${key}"`, err);
    }
    setReady(true);
  }, [key]);

  const setStoredValue = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch (err) {
          console.error(`Failed to write "${key}"`, err);
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, setStoredValue, ready];
}
