import { redirect } from "next/navigation";
import { getSession } from "../../../lib/session.js";
import { Background } from "../../components/AuthCard";
import Navbar from "../../components/Navbar";

const trips = [
  {
    place: "Palawan",
    dates: "Dec 12 - 16",
    emoji: "🏝️",
    tag: "Island hopping",
  },
  { place: "Siargao", dates: "Jan 8 - 12", emoji: "🏄", tag: "Surf trip" },
  { place: "Baguio", dates: "Feb 14 - 16", emoji: "🌲", tag: "Cool getaway" },
  { place: "Tokyo", dates: "Apr 3 - 10", emoji: "🗼", tag: "Cherry blossom" },
];

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");

  const firstName = String(session.name || "").split(" ")[0];

  return (
    <Background>
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 md:px-8 md:py-6 xl:px-12">
        <Navbar />

        <main className="flex flex-1 flex-col">
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
            Where to next, {firstName}? ✈️
          </h1>
          <p className="mt-2 text-white/70">Your upcoming adventures</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {trips.map((t) => (
              <div
                key={t.place}
                className="glass rounded-3xl p-6 transition hover:-translate-y-1 hover:bg-white/10"
              >
                <div className="text-5xl">{t.emoji}</div>
                <h3 className="mt-4 text-2xl font-semibold">{t.place}</h3>
                <p className="text-white/70">{t.dates}</p>
                <span className="mt-3 inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs">
                  {t.tag}
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </Background>
  );
}
