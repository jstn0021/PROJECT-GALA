import MapArt from "./MapArt";

export function Background({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#0b1f33] via-[#12476b] to-[#1b6f7a]">
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-orange-400/60 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-pink-500/50 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-cyan-400/50 blur-3xl animate-float" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="glass flex h-11 w-11 items-center justify-center rounded-2xl">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 2 11 13" />
          <path d="m22 2-7 20-4-9-9-4Z" />
        </svg>
      </div>
      <span className="text-2xl font-semibold tracking-tight">Gala</span>
    </div>
  );
}

export function Field({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-white/80">
        {label}
      </span>
      <input
        {...props}
        className={`glass-input h-11 w-full rounded-xl px-4 ${error ? "is-error" : ""}`}
      />
    </label>
  );
}

export function SubmitButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="h-11 w-full rounded-xl bg-linear-to-r from-orange-400 to-pink-500 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:scale-[1.02] hover:shadow-pink-500/50 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
    >
      {children}
    </button>
  );
}

export default function AuthCard({
  title,
  subtitle,
  error,
  success,
  children,
}) {
  return (
    <Background>
      <div className="grid min-h-screen lg:grid-cols-[1.2fr_1fr]">
        {/* Left: map */}
        <div className="hidden flex-col justify-between p-10 lg:flex">
          <Logo />
          <div className="glass rounded-3xl p-5">
            <MapArt className="h-auto w-full" />
          </div>
          <div>
            <h1 className="text-5xl font-semibold leading-tight tracking-tight">
              Plan every gala,
              <br />
              pin by pin.
            </h1>
            <p className="mt-3 max-w-md text-white/70">
              Itineraries, destinations, and budgets in one place.
            </p>
          </div>
        </div>

        {/* Right: full-height glass panel */}
        <div className="glass flex min-h-screen flex-col justify-center px-8 py-12 sm:px-14 lg:rounded-none lg:border-y-0 lg:border-r-0">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            <h2 className="text-4xl font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-2 text-white/70">{subtitle}</p>}

            {error && (
              <p className="mt-5 rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2 text-sm text-red-100">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-5 rounded-xl border border-green-300/40 bg-green-500/20 px-4 py-2 text-sm text-green-100">
                {success}
              </p>
            )}

            <div className="mt-7 flex flex-col gap-4">{children}</div>
          </div>
        </div>
      </div>
    </Background>
  );
}
