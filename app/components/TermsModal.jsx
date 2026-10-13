"use client";

import { useEffect, useRef } from "react";

const bullet = "list-disc space-y-2 pl-6 marker:text-white";

const SECTIONS = [
  {
    title: "1. About GALA",
    body: (
      <p>
        GALA is a web application that helps users explore places and build a
        personal bucket list of destinations and experiences. These Terms apply
        to the GALA website, its features (including Explore and Bucket List),
        and any related services.
      </p>
    ),
  },
  {
    title: "2. Accounts and Eligibility",
    body: (
      <ul className={bullet}>
        <li>
          You must provide accurate information when you register, including a
          valid email address, which you use to log in.
        </li>
        <li>
          You are responsible for keeping your password confidential and for
          all activity under your account.
        </li>
        <li>
          Notify us right away if you suspect unauthorized access to your
          account.
        </li>
        <li>One person, one account. Do not share or sell your account.</li>
        <li>
          If you forget your password, GALA can send a reset link to your
          registered email. Reset links expire and must not be shared.
        </li>
      </ul>
    ),
  },
  {
    title: "3. Acceptable Use and Your Content",
    body: (
      <>
        <p className="mb-3">You agree not to:</p>
        <ul className={bullet}>
          <li>Break any law or violate the rights of others.</li>
          <li>
            Try to access other users&apos; accounts or data, or interfere with
            the app&apos;s security or operation.
          </li>
          <li>
            Upload harmful code, spam, or false, offensive, or misleading
            content.
          </li>
          <li>
            Scrape, copy, or resell GALA&apos;s data or content without
            permission.
          </li>
        </ul>
        <p className="mt-3">
          Items you add to your Bucket List and any other content you submit
          remain yours. You give GALA permission to store and display that
          content to you so the features can work. You are responsible for what
          you post. We may remove content that breaks these Terms.
        </p>
      </>
    ),
  },
  {
    title: "4. Privacy and Data",
    body: (
      <>
        <p>
          GALA collects only what it needs to run: your name, email, encrypted
          password, and the bucket list items you save. We do not sell your
          personal data. We share it only with service providers needed to run
          the app, or when the law requires it, in line with the Philippine
          Data Privacy Act of 2012 (RA 10173).
        </p>
        <p className="mt-3">
          GALA relies on third-party services, such as our database and storage
          provider (Supabase) and an email service for password resets. Their
          own terms and privacy policies also apply. You may ask us to access,
          correct, or delete your data at any time using the contact below.
        </p>
      </>
    ),
  },
  {
    title: "5. Disclaimer and Limitation of Liability",
    body: (
      <p>
        GALA is provided &quot;as is&quot; and &quot;as available.&quot; Place
        and travel information is for reference only and may be incomplete or
        outdated; verify details before you travel. To the extent allowed by
        law, GALA and its developers are not liable for any loss or damage
        arising from your use of the app, including data loss, downtime, or
        travel decisions you make.
      </p>
    ),
  },
  {
    title: "6. Suspension and Termination",
    body: (
      <p>
        We may suspend or delete accounts that violate these Terms. You may
        stop using GALA and request deletion of your account at any time.
      </p>
    ),
  },
  {
    title: "7. Changes to These Terms",
    body: (
      <p>
        We may update these Terms from time to time. The updated version will
        be posted in the app with a new date, and continued use means you
        accept the changes.
      </p>
    ),
  },
  {
    title: "8. Governing Law",
    body: (
      <p>
        These Terms are governed by the laws of the Republic of the
        Philippines.
      </p>
    ),
  },
  {
    title: "9. Contact",
    body: (
      <p>
        Questions about these Terms or your data:{" "}
        <a
          href="mailto:project.gala.101126@gmail.com"
          className="font-medium text-white underline underline-offset-4 hover:text-white/70"
        >
          project.gala.101126@gmail.com
        </a>
      </p>
    ),
  },
];

// Props:
//   open    - boolean
//   onClose - () => void
//   onAgree - optional () => void; when given, shows an "I agree" button
export default function TermsModal({ open, onClose, onAgree }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-slate-900 text-white shadow-none! ring-0!"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/15 px-6 py-5">
          <div>
            <h2 id="terms-title" className="text-lg font-bold sm:text-xl">
              Terms and Agreement
            </h2>
            <p className="mt-1 text-xs text-white">
              Effective Date: October 11, 2026
            </p>
          </div>
          <button
            type="button"
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="rounded-full bg-white/10 px-3 py-1 text-lg leading-none text-white outline-none transition hover:bg-white/20 focus:outline-none focus:ring-0"
          >
            &times;
          </button>
        </div>

        {/* Scrollable content */}
        <div className="space-y-6 overflow-y-auto px-6 py-5 text-[13px] leading-6 text-white">
          <p>
            By creating an account or using GALA, you agree to these Terms and
            Agreement. If you do not agree, please do not use the app.
          </p>
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h3 className="mb-2 text-sm font-bold text-white">
                {s.title}
              </h3>
              {s.body}
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-white/15 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Close
          </button>
          {onAgree && (
            <button
              type="button"
              onClick={onAgree}
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
            >
              I agree
            </button>
          )}
        </div>
      </div>
    </div>
  );
}