import Link from "next/link";
import LandingSearchBar from "app/components/LandingSearchBar";

export const BRAND = "PROJECT-GALA";

const DESTINATIONS = [
  {
    name: "Baguio",
    slot: "baguio",
    file: "/destinations/baguio.jpg",
  },
  {
    name: "El Nido",
    slot: "elnido",
    file: "/destinations/elnido.jpg",
  },
  {
    name: "Siargao",
    slot: "siargao",
    file: "/destinations/siargao.webp",
  },
  {
    name: "Cebu",
    slot: "cebu",
    file: "/destinations/cebu.jpg",
  },
];

/* Kapareho na ng Dashboard, My Plans, New Plan, Profile at Journal ang
   panels, buttons at shadows. Hiwalay ang FILL para hindi mag-conflict ang
   border/radius/shadow kapag iba ang hugis (header ay pill, cards ay rounded-3xl). */
const FILL =
  "bg-linear-to-br from-gala-surface/90 via-gala-surface/85 to-[#172B3A]/90 backdrop-blur-md";
const PANEL = `rounded-3xl border border-gala-aqua/30 ${FILL} shadow-card`;
const HEADER = `rounded-full border border-gala-aqua/30 ${FILL} shadow-card`;

// Sign up button style (header + CTA) - olive pill
const authBtn =
  "rounded-full bg-gala-accent px-5 py-2 font-bold text-gala-bg shadow-accent transition hover:scale-105 hover:brightness-110 hover:shadow-lift active:scale-95";
const ghostBtn =
  "rounded-full border border-gala-line bg-gala-raised/60 px-5 py-2 font-semibold text-gala-text transition hover:bg-gala-raised active:scale-95";

function initials(name) {
  const w = name.trim().split(/\s+/);
  return (
    (w[0]?.[0] ?? "") + (w.length > 1 ? w[w.length - 1][0] : "")
  ).toUpperCase();
}

// Presentational lang (walang session / server logic) kaya magagamit sa landing
// at bilang naka-blur na backdrop ng login/signup pages.
export default function LandingContent({ images = {}, credits = [] }) {
  return (
    <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 text-gala-text md:px-8 md:py-6 xl:px-12">
      {/* Top bar */}
      <header
        className={`${HEADER} flex items-center justify-between gap-4 px-6 py-3`}
      >
        <div className="flex items-center gap-10">
          <span className="text-xl font-bold tracking-tight text-gala-text">{BRAND}</span>
          <nav className="hidden gap-6 text-sm text-gala-aqua sm:flex">
            <a href="#destinations" className="transition hover:text-gala-text">
              Destinations
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/login"
            className="text-gala-aqua transition hover:text-gala-text"
          >
            Log in
          </Link>
          <Link href="/signup" className={authBtn}>
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[2rem] border border-gala-line bg-gala-surface px-6 py-12 shadow-card sm:px-12 sm:py-16 xl:py-24"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(12,18,32,.92) 0%, rgba(12,18,32,.6) 55%, rgba(12,18,32,.1) 100%), url('" +
            (images.hero ?? "/destinations/baguio.jpg") +
            "')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p className="text-xs tracking-[0.35em] text-gala-aqua">
          EXPLORE · PLAN · REMEMBER
        </p>
        <h1 className="mt-4 max-w-xl text-5xl font-extrabold leading-[1.05] text-gala-text sm:text-6xl">
          Plan your next <span className="text-gala-accent">adventure</span>
        </h1>
        <p className="mt-4 max-w-md text-gala-text/85">
          Discover amazing destinations, organize your trips, and keep your
          travel memories, all in one place.
        </p>

        <LandingSearchBar />
      </section>

      {/* Featured destinations */}
      <section id="destinations">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-gala-text">Featured destinations</h2>
          <Link
            href="/signup"
            className="text-sm text-gala-accent transition hover:text-gala-text"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.name}
              href="/signup"
              className="group relative flex aspect-[16/10] items-end overflow-hidden rounded-2xl border border-gala-line bg-linear-to-br from-gala-teal to-gala-surface shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              style={{
                backgroundImage: `url('${images[d.slot] ?? d.file}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span className="absolute inset-0 bg-linear-to-t from-gala-bg/85 via-gala-bg/30 to-transparent" />
              <span className="relative p-3">
                <span className="block font-semibold text-gala-text transition group-hover:text-gala-accent">
                  {d.name}
                </span>
                <span className="block text-xs text-gala-text/75">
                  Philippines
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className={`${PANEL} flex flex-col items-start justify-between gap-5 px-8 py-8 sm:flex-row sm:items-center`}
      >
        <div>
          <h2 className="text-2xl font-bold text-gala-text sm:text-3xl">
            Start planning your first trip
          </h2>
          <p className="mt-1 text-gala-aqua">
            Create an account and turn your travel ideas into real adventures.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/signup" className={authBtn}>
            Sign up
          </Link>
          <Link href="/login" className={ghostBtn}>
            Log in
          </Link>
        </div>
      </section>

      {/* Credits */}
      {credits.length > 0 && (
        <section id="credits" className="pb-4">
          <h2 className="px-1 text-2xl font-semibold text-gala-text">Meet the team</h2>
          <p className="mb-4 px-1 text-gala-muted">
            The people who built {BRAND}.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-5">
            {credits.map((c) => (
              <article
                key={c.id}
                className={`${PANEL} overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lift`}
              >
                <div
                  className="flex aspect-[4/3] items-center justify-center bg-gala-teal bg-cover bg-center text-7xl font-extrabold text-gala-text/90"
                  style={
                    c.photoUrl
                      ? {
                          backgroundImage: `url('${c.photoUrl}')`,
                          backgroundPosition: `${c.photoX ?? 50}% ${c.photoY ?? 50}%`,
                        }
                      : undefined
                  }
                >
                  {!c.photoUrl && initials(c.name)}
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold tracking-wide text-gala-text">{c.name}</h3>
                  <p className="mt-1 text-sm font-medium tracking-widest text-gala-accent">
                    {c.role}
                  </p>
                  {c.description && (
                    <p className="mt-3 text-justify text-sm leading-relaxed text-gala-text/75 hyphens-auto">
                      {c.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}