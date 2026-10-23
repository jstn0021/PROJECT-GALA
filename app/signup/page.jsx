"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard, { Field, SubmitButton } from "../components/AuthCard";
import TermsModal from "../components/TermsModal";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      return setError("Please fill in all fields");
    }
    if (form.password.length < 8)
      return setError("Password must be at least 8 characters");
    if (form.password !== form.confirm)
      return setError("Passwords do not match");
    if (!agreed)
      return setError("You must agree to the Terms and Agreement to sign up");

    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, acceptedTerms: agreed }),
      });
      const result = await res.json();
      if (res.ok) router.push("/login");
      else setError(result?.error_message || "Something went wrong");
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <AuthCard
      title="Create an account"
      subtitle="Start planning your trips"
      error={error}
    >
      <Field
        label="Full name"
        name="fullName"
        placeholder="Juan Dela Cruz"
        onChange={handleChange}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="you@email.com"
        onChange={handleChange}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="At least 8 characters"
        onChange={handleChange}
      />
      <Field
        label="Confirm password"
        name="confirm"
        type="password"
        onChange={handleChange}
      />

      <label className="flex cursor-pointer items-start gap-3 text-sm text-white/90">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => {
            setAgreed(e.target.checked);
            setError("");
          }}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-amber-400"
        />
        <span>
          I have read and agree to the{" "}
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="font-medium text-amber-200 underline underline-offset-4 hover:text-amber-100"
          >
            Terms and Agreement
          </button>
          .
        </span>
      </label>

      <SubmitButton onClick={handleSubmit} disabled={loading || !agreed}>
        {loading ? "Creating..." : "Sign up"}
      </SubmitButton>
      <p className="text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-white underline">
          Log in
        </Link>
      </p>

      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAgree={() => {
          setAgreed(true);
          setError("");
          setShowTerms(false);
        }}
      />
    </AuthCard>
  );
}