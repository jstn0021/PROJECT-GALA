"use client";

/* ------------------------------------------------------------------ */
/* Shared design tokens — kinopya galing sa DashboardClient para      */
/* iisa ang itsura ng lahat ng pages.                                 */
/* ------------------------------------------------------------------ */

const PANEL_BASE =
  "rounded-3xl border border-sky-400/40 bg-linear-to-br from-[#161c6a]/75 via-[#10175a]/70 to-[#0b1448]/75 backdrop-blur-xl shadow-[0_0_22px_rgba(56,189,248,0.22),0_0_46px_rgba(99,102,241,0.2),inset_0_0_26px_rgba(99,102,241,0.14)]";

// Pang-lalagyan (forms, empty states, panels)
export const PANEL = `${PANEL_BASE} transition-shadow duration-300`;

export const CARD_HOVER =
  "hover:shadow-[0_0_30px_rgba(56,189,248,0.35),0_0_60px_rgba(99,102,241,0.3),inset_0_0_26px_rgba(99,102,241,0.18)]";

// Pang-modal (solid na background sa ilalim para mabasa)
export const MODAL = `${PANEL} bg-[#0e1450]`;

// Image card (kapareho ng Explore): Bucket List, New Plan, My Plans, Journal
export const CARD = `group relative flex flex-col overflow-hidden ${PANEL_BASE} ${CARD_HOVER} transition duration-300 hover:-translate-y-1`;

// Iisang grid para pare-parehas ang laki ng cards sa lahat ng page
export const GRID =
  "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export const PAGE_WRAP =
  "flex min-h-screen w-full flex-col gap-5 px-4 py-4 text-white md:px-8 md:py-6 xl:px-12";

// Title size: kapareho ng Bucket List
export const PAGE_TITLE = "text-4xl font-semibold tracking-tight md:text-5xl";

/* ---------- Buttons ---------- */
export const gradientBtn =
  "bg-linear-to-r from-indigo-500 to-violet-500 font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.6)] transition hover:scale-105 active:scale-95";

export const primaryBtn = `rounded-full px-6 py-3 ${gradientBtn}`;

export const ghostBtn =
  "rounded-full border border-sky-300/30 bg-indigo-500/15 px-5 py-2.5 text-white transition hover:bg-indigo-500/30 hover:shadow-[0_0_14px_rgba(56,189,248,0.4)] active:scale-95";

export const smallBtn =
  "rounded-full border border-sky-300/30 bg-indigo-500/15 px-3 py-1.5 text-sm text-white transition hover:bg-indigo-500/30 hover:shadow-[0_0_14px_rgba(56,189,248,0.4)] active:scale-95";

// Maliit na buttons sa loob ng card (Details / Plan trip style ng Explore)
export const cardAction =
  "rounded-full border border-white/20 bg-white/5 py-2 text-center text-xs font-medium text-white transition hover:bg-white/15 disabled:opacity-50";

export const fieldLabel = "mb-2 block text-sm font-medium text-white/80";

/* ---------- Components ---------- */

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className={PAGE_TITLE}>{title}</h1>
        {subtitle && <p className="mt-2 text-white/70">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// Image area ng card: 16/11 (same sa Explore). Kapag walang image o sira
// ang link, gradient ang lalabas.
export function CardImage({
  src,
  alt = "",
  gradient = "from-teal-300 to-indigo-500",
  dim = false,
  children,
}) {
  return (
    <div
      className={`relative aspect-[16/11] w-full shrink-0 overflow-hidden bg-linear-to-br ${gradient}`}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${dim ? "saturate-50" : ""
            }`}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-black/30" />
      {children}
    </div>
  );
}

/* ---------- Icons (stroke SVG, kapareho ng style ng dashboard) ---------- */
const ICONS = {
  home: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  plane: (
    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  ),
  bookmark: <path d="M7 4h10a1 1 0 011 1v15l-6-4-6 4V5a1 1 0 011-1z" />,
  book: (
    <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H19a1 1 0 011 1v18a1 1 0 01-1 1H6.5a1 1 0 010-5H20" />
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  shield: <path d="M12 3l8 3v6c0 4.5-3.2 8.2-8 9-4.8-.8-8-4.5-8-9V6z" />,
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  trash: (
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3" />
  ),
  edit: <path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16v4zM13.5 6.5l4 4" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,

  mountain: (
    <>
      <path d="M3 20l6.5-11 4 6.5 2.5-4L21 20z" />
      <path d="M7.8 12.5l1.7-1.2 1.4 1.4" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5A2.5 2.5 0 016.5 5H18a1 1 0 011 1v2" />
      <path d="M4 7.5V17a2 2 0 002 2h13a1 1 0 001-1V9a1 1 0 00-1-1H6.5A2.5 2.5 0 014 7.5z" />
      <circle cx="16.5" cy="13.5" r="1.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
};

export function Icon({ name, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}
