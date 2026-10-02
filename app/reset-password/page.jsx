"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard, { Field, SubmitButton } from "../components/AuthCard";

function ResetForm() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (password.length < 8)
      return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await res.json();
      if (res.ok) {
        setSuccess("Password updated! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setError(result?.error_message || "Something went wrong");
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <AuthCard title="Invalid link" error="Missing reset token.">
        <Link
          href="/forgot-password"
          className="text-[#e5484d] hover:underline text-center"
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle="Enter your new password"
      error={error}
      success={success}
    >
      <Field
        label="New password:"
        type="password"
        onChange={(e) => {
          setPassword(e.target.value);
          setError("");
        }}
      />
      <Field
        label="Confirm password:"
        type="password"
        onChange={(e) => {
          setConfirm(e.target.value);
          setError("");
        }}
      />
      <SubmitButton onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Reset password"}
      </SubmitButton>
    </AuthCard>
  );
}

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
