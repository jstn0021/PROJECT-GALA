export function Background({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#0b1f33] via-[#12476b] to-[#1b6f7a]">
      {/* blurred world map */}
      <div
        className="pointer-events-none absolute inset-0 scale-110 opacity-60 blur-[3px]"
        style={{
          backgroundImage: "url(/world-map.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-orange-400/50 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-pink-500/40 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-cyan-400/40 blur-3xl animate-float" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function Logo({ size = "md" }) {
  return (
    <span
      className={`font-bold tracking-tight ${
        size === "lg" ? "text-4xl sm:text-5xl" : "text-2xl"
      }`}
    >
      PROJECT-GALA
    </span>
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="glass w-full max-w-md rounded-3xl p-8">
          {/* Brand, centered at top of the card */}
          <div className="text-center">
            <Logo size="lg" />
          </div>

          <h2 className="mt-6 text-center text-2xl font-semibold tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-center text-white/70">{subtitle}</p>
          )}

          {error && (
            <p className="mt-4 rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2 text-sm text-red-100">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-4 rounded-xl border border-green-300/40 bg-green-500/20 px-4 py-2 text-sm text-green-100">
              {success}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-4">{children}</div>
        </div>
      </div>
    </Background>
  );
}
