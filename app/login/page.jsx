"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard, { Field, SubmitButton } from "../components/AuthCard";

export default function Login() {
  const router = useRouter();
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState({
    email: false,
    password: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setFieldError((prev) => ({ ...prev, [name]: false }));
  };

  const validate = () => {
    const errors = {
      email: !data.email.trim(),
      password: !data.password.trim(),
    };
    setFieldError(errors);
    return !errors.email && !errors.password;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        router.push("/Main/Home");
      } else {
        setError(result?.error_message || "Something went wrong");
        setFieldError({ email: true, password: true });
      }
    } catch {
      setError("Something went wrong");
      setFieldError({ email: true, password: true });
    }
    setLoading(false);
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to plan your next gala"
      error={error}
    >
      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="you@email.com"
        error={fieldError.email}
        onChange={handleChange}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        error={fieldError.password}
        onChange={handleChange}
      />
      <SubmitButton onClick={handleSubmit} disabled={loading}>
        {loading ? "Logging in..." : "Log in"}
      </SubmitButton>

      <div className="flex justify-between text-sm">
        <Link
          href="/forgot-password"
          className="text-white/80 hover:text-white hover:underline"
        >
          Forgot password?
        </Link>
        <Link
          href="/signup"
          className="text-white/80 hover:text-white hover:underline"
        >
          Create an account
        </Link>
      </div>
    </AuthCard>
  );
}
