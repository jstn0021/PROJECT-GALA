import Link from "next/link";

export const BRAND = "PROJECT-GALA";

const DESTINATIONS = [
  {
    name: "Baguio",
    file: "/destinations/baguio.jpg",
    grad: "from-emerald-700 to-indigo-900",
  },
  {
    name: "El Nido",
    file: "/destinations/elnido.jpg",
    grad: "from-teal-500 to-cyan-900",
  },
  {
    name: "Siargao",
    file: "/destinations/siargao.webp",
    grad: "from-lime-400 to-teal-700",
  },
  {
    name: "Cebu",
    file: "/destinations/cebu.jpg",
    grad: "from-sky-400 to-indigo-800",
  },
];

const FEATURES = [
  {
    title: "Plan trips",
    text: "Create and organize your itineraries with ease.",
    grad: "from-rose-400 to-orange-300",
    icon: "🗓️",
  },
  {
    title: "Budget",
    text: "Keep track of your travel expenses.",
    grad: "from-emerald-400 to-teal-600",
    icon: "📊",
  },
  {
    title: "Bucket list",
    text: "Save places you want to visit someday.",
    grad: "from-indigo-400 to-violet-600",
    icon: "🔖",
  },
  {
    title: "Journal",
    text: "Write and keep your travel memories.",
    grad: "from-teal-300 to-emerald-600",
    icon: "📝",
  },
];

const goldBtn =
  "rounded-full bg-amber-400 px-5 py-2 font-semibold text-slate-900 transition hover:bg-amber-300";

// Presentational lang (walang session / server logic) kaya magagamit sa landing
// at bilang naka-blur na backdrop ng login/signup pages.
export default function LandingContent() {
  return (
    <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 text-white md:px-8 md:py-6 xl:px-12">
      {/* Top bar */}
      <header className="glass flex items-center justify-between gap-4 rounded-full px-6 py-3">
        <div className="flex items-center gap-10">
          <span className="text-xl font-bold tracking-tight">{BRAND}</span>
          <nav className="hidden gap-6 text-sm text-white/80 sm:flex">
            <a href="#destinations" className="hover:text-white">
              Destinations
            </a>
            <a href="#how" className="hover:text-white">
              How it works
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-white/85 hover:text-white">
            Log in
          </Link>
          <Link href="/signup" className={goldBtn}>
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-indigo-500 via-teal-500 to-amber-300 px-6 py-12 sm:px-12 sm:py-16 xl:py-24"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(79,70,229,.85) 0%, rgba(20,184,166,.45) 55%, rgba(0,0,0,.05) 100%), url('/destinations/baguio.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p className="text-xs tracking-[0.35em] text-white/80">
          EXPLORE · PLAN · REMEMBER
        </p>
        <h1 className="mt-4 max-w-xl text-5xl font-extrabold leading-[1.05] sm:text-6xl">
          Plan your next{" "}
          <span className="bg-linear-to-r from-cyan-200 via-lime-200 to-amber-200 bg-clip-text text-transparent">
            adventure
          </span>
        </h1>
        <p className="mt-4 max-w-md text-white/90">
          Discover amazing destinations, organize your trips, and keep your
          travel memories, all in one place.
        </p>

        <form
          action="/explore"
          className="glass-input mt-8 flex max-w-xl items-center gap-2 rounded-full p-1.5"
        >
          <span className="pl-4" aria-hidden="true">
            📍
          </span>
          <input
            name="q"
            placeholder="Where do you want to go?"
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-white placeholder:text-white/70 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-slate-900/70 px-6 py-2.5 font-medium transition hover:bg-slate-900"
          >
            Search
          </button>
        </form>

        <Link
          href="/signup"
          className="mt-5 inline-block rounded-full bg-slate-900/70 px-6 py-2.5 font-medium transition hover:bg-slate-900"
        >
          Explore destinations
        </Link>
      </section>

      {/* Featured destinations */}
      <section id="destinations">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold">Featured destinations</h2>
          <Link
            href="/signup"
            className="text-sm text-white/75 hover:text-white"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.name}
              href="/signup"
              className={`group relative flex aspect-[16/10] items-end overflow-hidden rounded-2xl bg-linear-to-br ${d.grad} border border-white/20 transition hover:-translate-y-1`}
              style={{
                backgroundImage: `url('${d.file}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <span className="relative p-3">
                <span className="block font-semibold">{d.name}</span>
                <span className="block text-xs text-white/75">Philippines</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* What can you do */}
      <section id="how">
        <h2 className="mb-3 px-1 text-lg font-semibold">
          What can you do with an account?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href="/signup"
              className="glass flex items-center gap-4 rounded-2xl p-4 transition hover:-translate-y-1"
            >
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${f.grad} text-2xl`}
              >
                {f.icon}
              </span>
              <span>
                <span className="block font-semibold">{f.title}</span>
                <span className="block text-xs text-white/70">{f.text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-start justify-between gap-5 rounded-[2rem] bg-linear-to-r from-indigo-500 via-teal-500 to-amber-300 px-8 py-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">
            Start planning your first trip
          </h2>
          <p className="mt-1 text-white/90">
            Create an account and turn your travel ideas into real adventures.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/signup" className={goldBtn}>
            Sign up
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/40 bg-white/15 px-5 py-2 font-semibold transition hover:bg-white/25"
          >
            Log in
          </Link>
        </div>
      </section>
    </div>
  );
}
