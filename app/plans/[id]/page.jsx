"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

const peso = (n) => `₱${Number(n || 0).toLocaleString("en-PH")}`;

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
            <div className="flex min-h-screen items-center justify-center text-white">
                <p className="animate-pulse">Loading trip details...</p>
            </div>
        );
    }

    if (!tripData) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center text-white">
                <p>Trip plan not found.</p>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="mt-4 rounded-full bg-indigo-500 px-6 py-2 text-sm font-semibold"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full px-4 py-6 text-white md:px-8 xl:px-12">
            {/* HEADER NAVIGATION */}
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={() => router.push("/dashboard")}
                    className="glass-dark flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition hover:bg-white/10"
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* HERO BANNER */}
            <div
                className="glass-dark relative overflow-hidden rounded-3xl p-6 md:p-10"
                style={{
                    backgroundImage: `linear-gradient(180deg, rgba(12,18,70,0.4) 0%, rgba(12,18,70,0.95) 100%), url(${tripData.destinationPhoto || "/baguio.jpg"
                        })`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="mt-16">
                    <span className="rounded-full bg-indigo-500/40 px-3.5 py-1 text-xs font-semibold tracking-wide text-indigo-200">
                        📍 {tripData.destination}
                    </span>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">
                        {tripData.title}
                    </h1>
                    <p className="mt-2 text-sm text-sky-200">
                        📅 {tripData.startDate} - {tripData.endDate}
                    </p>
                </div>
            </div>

            {/* QUICK STATS STRIP */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="glass-dark rounded-2xl p-4 text-center">
                    <div className="text-xs text-white/60">Total Budget</div>
                    <div className="mt-1 text-xl font-bold">{peso(tripData.budget)}</div>
                </div>
                <div className="glass-dark rounded-2xl p-4 text-center">
                    <div className="text-xs text-white/60">Amount Spent</div>
                    <div className="mt-1 text-xl font-bold text-amber-300">
                        {peso(tripData.spent)}
                    </div>
                </div>
                <div className="glass-dark rounded-2xl p-4 text-center">
                    <div className="text-xs text-white/60">Remaining Balance</div>
                    <div className="mt-1 text-xl font-bold text-emerald-300">
                        {peso(tripData.budget - tripData.spent)}
                    </div>
                </div>
                <div className="glass-dark rounded-2xl p-4 text-center">
                    <div className="text-xs text-white/60">Status</div>
                    <div className="mt-1 text-xl font-bold text-indigo-300">
                        {tripData.status}
                    </div>
                </div>
            </div>

            {/* TABS NAVIGATION */}
            <div className="mt-8 flex border-b border-white/10">
                <button
                    onClick={() => setActiveTab("itinerary")}
                    className={`pb-3 px-6 text-sm font-semibold transition ${activeTab === "itinerary"
                            ? "border-b-2 border-indigo-400 text-indigo-300"
                            : "text-white/60 hover:text-white"
                        }`}
                >
                    🧭 Itinerary Schedule
                </button>
                <button
                    onClick={() => setActiveTab("packing")}
                    className={`pb-3 px-6 text-sm font-semibold transition ${activeTab === "packing"
                            ? "border-b-2 border-indigo-400 text-indigo-300"
                            : "text-white/60 hover:text-white"
                        }`}
                >
                    🎒 Packing Checklist
                </button>
            </div>

            {/* TAB 1: ITINERARY TIMELINE */}
            {activeTab === "itinerary" && (
                <div className="mt-6 flex flex-col gap-4">
                    {tripData.itineraryItems && tripData.itineraryItems.length > 0 ? (
                        tripData.itineraryItems.map((act) => (
                            <div
                                key={act.id}
                                className="glass-dark flex items-center justify-between rounded-2xl border border-white/10 p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="rounded-xl bg-indigo-500/30 px-3 py-1.5 text-xs font-bold text-indigo-200">
                                        {act.time}
                                    </span>
                                    <div>
                                        <h3 className="font-semibold">{act.activityTitle}</h3>
                                        <p className="text-xs text-white/60">📍 {act.location}</p>
                                    </div>
                                </div>
                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                                    {act.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-sm text-white/50">No itinerary items found.</p>
                    )}
                </div>
            )}

            {/* TAB 2: PACKING LIST */}
            {activeTab === "packing" && (
                <div className="glass-dark mt-6 rounded-3xl p-6">
                    <h2 className="mb-4 text-lg font-bold">Essential Items</h2>
                    {tripData.packingItems && tripData.packingItems.length > 0 ? (
                        <ul className="divide-y divide-white/10">
                            {tripData.packingItems.map((item) => (
                                <li key={item.id} className="flex items-center justify-between py-3">
                                    <span className={item.isPacked ? "line-through text-white/50" : "text-white"}>
                                        {item.itemName}
                                    </span>
                                    <input
                                        type="checkbox"
                                        defaultChecked={item.isPacked}
                                        className="h-5 w-5 rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-0"
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-white/50">No packing items found.</p>
                    )}
                </div>
            )}
        </div>
    );
}