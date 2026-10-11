"use client";

import Link from "next/link";

// Drop this inside your signup form, above the submit button.
// Props:
//   checked  - boolean state from the signup form
//   onChange - (checked: boolean) => void
//   error    - optional error message string
export default function TermsAgreement({ checked, onChange, error }) {
  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-start gap-3 text-sm text-white/90">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? "true" : "false"}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-amber-400"
        />
        <span>
          I have read and agree to the GALA Terms and Agreement.
        </span>
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-200">
          {error}
        </p>
      )}

      {/* Opens in a new tab so the person keeps what they've typed in the form */}
      <Link
        href="/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center rounded-full border border-white/40 bg-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
      >
        Read Terms and Agreement
      </Link>
    </div>
  );
}