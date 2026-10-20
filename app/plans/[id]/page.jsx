"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Background } from "@/app/components/AuthCard";
import { Icon } from "@/app/components/ui";

const peso = (n) => `₱${Number(n || 0).toLocaleString("en-PH")}`;

/* Kapareho na ng Dashboard, My Plans, New Plan, Profile, Journal at Explore ang
   panels, buttons at shadows. Hiwalay ang FILL para hindi mag-conflict ang
   radius/border/shadow kapag iba ang hugis. */
const FILL =
  "bg-linear-to-br from-gala-surface/90 via-gala-surface/85 to-[#172B3A]/90 backdrop-blur-md";
const PANEL = `rounded-3xl border border-gala-aqua/30 ${FILL} shadow-card`;
const TILE = `rounded-2xl border border-gala-aqua/30 ${FILL} shadow-card`;
const primaryBtn =
  "rounded-full bg-gala-accent px-6 py-2 text-sm font-bold text-gala-bg shadow-accent transition hover:scale-105 hover:brightness-110 hover:shadow-lift active:scale-95";
const ghostBtn =
  "flex items-center gap-2 rounded-full border border-gala-line bg-gala-raised/60 px-5 py-2 text-sm font-medium text-gala-text transition hover:bg-gala-raised active:scale-95";

export default function TripDetailsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("itinerary");
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await fetch(`/api/plans/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setTripData(data.plan);
        }
      } catch (err) {
        console.error("Failed to load plan:", err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchTrip();
    }
  }, [params.id]);

  if (loading) {
    return (
      <Background>
        <div className="flex min-h-screen items-center justify-center text-gala-text">
          <p className="animate-pulse text-gala-text/80">
            Loading trip details...
          </p>
        </div>
      </Background>
    );
  }

  if (!tripData) {
    return (
      <Background>
        <div className="flex min-h-screen flex-col items-center justify-center text-gala-text">
          <p className="text-gala-text/80">Trip plan not found.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className={`mt-4 ${primaryBtn}`}
          >
            Back to Dashboard
          </button>
        </div>
      </Background>
    );
  }

  const tabClass = (tab) =>
    `px-6 pb-3 text-sm font-semibold transition ${
      activeTab === tab
        ? "border-b-2 border-gala-accent text-gala-accent"
        : "text-gala-muted hover:text-gala-text"
    }`;

  return (
    <Background>
      <div className="min-h-screen w-full px-4 py-6 text-gala-text md:px-8 xl:px-12">
        {/* HEADER NAVIGATION */}
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")} className={ghostBtn}>
            <Icon name="arrowLeft" className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* HERO BANNER */}
        <div
          className="relative overflow-hidden rounded-3xl border border-gala-line p-6 shadow-card md:p-10"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(12,18,32,0.4) 0%, rgba(12,18,32,0.95) 100%), url(${
              tripData.destinationPhoto || "/baguio.jpg"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="mt-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gala-accent/50 bg-gala-accent/15 px-3.5 py-1 text-xs font-semibold tracking-wide text-gala-accent">
              <Icon name="pin" className="h-3.5 w-3.5" />
              {tripData.destination}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gala-text md:text-5xl">
              {tripData.title}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-gala-aqua">
              <Icon name="calendar" className="h-4 w-4" />
              {tripData.startDate} - {tripData.endDate}
            </p>
          </div>
        </div>

        {/* QUICK STATS STRIP */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className={`${TILE} p-4 text-center`}>
            <div className="text-xs text-gala-muted">Total Budget</div>
            <div className="mt-1 text-xl font-bold text-gala-text">
              {peso(tripData.budget)}
            </div>
          </div>
          <div className={`${TILE} p-4 text-center`}>
            <div className="text-xs text-gala-muted">Amount Spent</div>
            <div className="mt-1 text-xl font-bold text-gala-gold">
              {peso(tripData.spent)}
            </div>
          </div>
          <div className={`${TILE} p-4 text-center`}>
            <div className="text-xs text-gala-muted">Remaining Balance</div>
            <div className="mt-1 text-xl font-bold text-gala-accent">
              {peso(tripData.budget - tripData.spent)}
            </div>
          </div>
          <div className={`${TILE} p-4 text-center`}>
            <div className="text-xs text-gala-muted">Status</div>
            <div className="mt-1 text-xl font-bold text-gala-aqua">
              {tripData.status}
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="mt-8 flex border-b border-gala-line">
          <button
            onClick={() => setActiveTab("itinerary")}
            className={tabClass("itinerary")}
          >
            <span className="inline-flex items-center gap-2">
              <Icon name="compass" className="h-4 w-4" />
              Itinerary Schedule
            </span>
          </button>
          <button
            onClick={() => setActiveTab("packing")}
            className={tabClass("packing")}
          >
            <span className="inline-flex items-center gap-2">
              <Icon name="check" className="h-4 w-4" />
              Packing Checklist
            </span>
          </button>
        </div>

        {/* TAB 1: ITINERARY TIMELINE */}
        {activeTab === "itinerary" && (
          <div className="mt-6 flex flex-col gap-4">
            {tripData.itineraryItems && tripData.itineraryItems.length > 0 ? (
              tripData.itineraryItems.map((act) => (
                <div
                  key={act.id}
                  className={`${TILE} flex items-center justify-between p-4`}
                >
                  <div className="flex items-center gap-4">
                    <span className="rounded-xl border border-gala-line bg-gala-raised px-3 py-1.5 text-xs font-bold text-gala-accent">
                      {act.time}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gala-text">
                        {act.activityTitle}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gala-aqua">
                        <Icon name="pin" className="h-3.5 w-3.5 shrink-0" />
                        {act.location}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-gala-accent/40 bg-gala-accent/10 px-3 py-1 text-xs text-gala-accent">
                    {act.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-gala-muted">
                No itinerary items found.
              </p>
            )}
          </div>
        )}

        {/* TAB 2: PACKING LIST */}
        {activeTab === "packing" && (
          <div className={`${PANEL} mt-6 p-6`}>
            <h2 className="mb-4 text-lg font-bold text-gala-text">
              Essential Items
            </h2>
            {tripData.packingItems && tripData.packingItems.length > 0 ? (
              <ul className="divide-y divide-gala-line">
                {tripData.packingItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-3"
                  >
                    <span
                      className={
                        item.isPacked
                          ? "text-gala-muted line-through"
                          : "text-gala-text"
                      }
                    >
                      {item.itemName}
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked={item.isPacked}
                      aria-label={`Packed: ${item.itemName}`}
                      className="h-5 w-5 cursor-pointer rounded accent-gala-accent"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gala-muted">
                No packing items found.
              </p>
            )}
          </div>
        )}
      </div>
    </Background>
  );
}