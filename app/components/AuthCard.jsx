"use client";

import { useEffect, useState } from "react";
import LandingContent from "app/components/LandingContent";

export function Background({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#12324A] via-[#1B5F78] to-[#2F8F9A]">
      {/* Map layers: same drift animation, recolored to the artwork's palette.
          Ang blur ay nasa loob ng `filter` dahil ino-override ng inline filter
          ang Tailwind blur classes. Palitan ang blur(10px) / blur(3px) kung
          gusto mo pang dagdagan o bawasan. */}
      <div className="pointer-events-none fixed inset-0 animate-map-drift">
        {/* Landmasses: deep teal-navy */}
        <div
          className="absolute inset-0 scale-110 opacity-55"
          style={{
            backgroundImage: "url(/world-map.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter:
              "blur(10px) grayscale(1) sepia(1) hue-rotate(150deg) saturate(1.5) brightness(0.95)",
          }}
        />
        {/* Routes: pale cream, like the chevrons in the artwork */}
        <div
          className="absolute inset-0 scale-110 opacity-70"
          style={{
            backgroundImage: "url(/world-routes.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter:
              "blur(3px) grayscale(1) sepia(0.7) saturate(0.9) brightness(0.95)",
          }}
        />
      </div>

      {/* Static color wash: olive haze top-left, teal water rising from the bottom,
          and a dark fade at the top so the sky reads as night */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: [
            "radial-gradient(800px 480px at 8% -5%, rgb(165 174 92 / 0.18), transparent 60%)",
            "radial-gradient(1200px 600px at 50% 112%, rgb(94 190 200 / 0.35), transparent 65%)",
            "linear-gradient(180deg, rgb(8 13 23 / 0.25) 0%, transparent 30%)",
          ].join(", "),
        }}
      />

      <div className="relative z-10 text-gala-text">{children}</div>
    </div>
  );
}

export function Logo({ size = "md" }) {
  return (
    <span
      className={`font-bold tracking-tight text-gala-text ${
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
      <span className="mb-1.5 block text-sm font-medium text-gala-text/80">
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
      className="h-11 w-full rounded-xl bg-gala-accent font-bold text-gala-bg shadow-accent transition hover:scale-[1.02] hover:brightness-110 hover:shadow-accent-lift active:scale-95 active:shadow-none disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-accent"
    >
      {children}
    </button>
  );
}

function useSiteImages() {
  const [images, setImages] = useState({});
  useEffect(() => {
    let alive = true;
    fetch("/api/site-images", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => alive && setImages(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return images;
}

export default function AuthCard({
  title,
  subtitle,
  error,
  success,
  children,
}) {
  const images = useSiteImages();
  return (
    <Background>
      {/* Naka-blur na landing page sa likod. inert = hindi ma-click/ma-tab */}
      <div
        aria-hidden="true"
        inert
        className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden"
      >
        <div className="origin-center scale-105 blur-md">
          <LandingContent images={images} />
        </div>
        <div className="absolute inset-0 bg-gala-bg/40" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        {/* Kapareho na ng Dashboard panels, hindi na umaasa sa .glass ng globals.css */}
        <div className="w-full max-w-md rounded-3xl border border-gala-aqua/30 bg-linear-to-br from-gala-surface/90 via-gala-surface/85 to-[#172B3A]/90 p-8 text-gala-text shadow-lift backdrop-blur-md">
          {/* Brand, centered at top of the card */}
          <div className="text-center">
            <Logo size="lg" />
          </div>

          <h2 className="mt-6 text-center text-2xl font-semibold tracking-tight text-gala-text">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-center text-gala-aqua">{subtitle}</p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2 text-sm text-red-100"
            >
              {error}
            </p>
          )}
          {success && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-gala-accent/40 bg-gala-accent/15 px-4 py-2 text-sm text-gala-accent"
            >
              {success}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-4">{children}</div>
        </div>
      </div>
    </Background>
  );
}