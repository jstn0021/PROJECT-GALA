"use client";
import { useState } from "react";
import Link from "next/link";
import AuthCard, { Field, SubmitButton } from "../components/AuthCard";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return setError("Please enter your email");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (res.ok) setSuccess(result.message);
      else setError(result?.error_message || "Something went wrong");
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your email and we'll send a reset link"
      error={error}
      success={success}
    >
      <Field
        label="Email:"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError("");
        }}
      />
      <SubmitButton onClick={handleSubmit} disabled={loading}>
        {loading ? "Sending..." : "Send reset link"}
      </SubmitButton>
      <Link
        href="/login"
        className="text-sm text-center text-[#e5484d] hover:underline"
      >
        Back to login
      </Link>
    </AuthCard>
  );
}
