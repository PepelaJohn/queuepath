"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Field = "name" | "email" | "password" | "confirm";

interface FieldError {
  field?: Field;
  message: string;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["var(--border)", "#e74c3c", "#f5a623", "var(--green)"];
  const labels = ["", "Weak", "Fair", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i < score ? colors[score] : "var(--border)" }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map((c) => (
            <span
              key={c.label}
              className="text-xs flex items-center gap-1"
              style={{ color: c.pass ? "var(--green)" : "var(--muted)" }}
            >
              {c.pass ? "✓" : "·"} {c.label}
            </span>
          ))}
        </div>
        <span className="text-xs font-medium" style={{ color: colors[score] }}>
          {labels[score]}
        </span>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<FieldError | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  function focusStyle(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "var(--accent)";
  }
  function blurStyle(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "var(--border)";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError({ field: "confirm", message: "Passwords do not match." });
      return;
    }
    if (password.length < 8) {
      setError({ field: "password", message: "Password must be at least 8 characters." });
      return;
    }
    if (!agreed) {
      setError({ message: "Please accept the Terms of Service to continue." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError({ message: data.error ?? "Something went wrong." });
        return;
      }

      // Auto sign-in after registration
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (signInRes?.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login?registered=1");
      }
    } catch {
      setError({ message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const inputBase = {
    background: "var(--surface-raised)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p
          className="text-xs tracking-[0.22em] uppercase mb-3"
          style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
        >
          Get started — it&apos;s free
        </p>
        <h1
          className="font-display italic leading-none mb-3"
          style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 300, color: "var(--text)" }}
        >
          Create your
          <br />
          account.
        </h1>
        <p className="text-sm font-light" style={{ color: "var(--muted)" }}>
          Already have one?{" "}
          <Link
            href="/login"
            className="no-underline font-medium hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Log in →
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="block text-xs font-medium tracking-wide"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
            style={inputBase}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-medium tracking-wide"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
            style={{
              ...inputBase,
              borderColor: error?.field === "email" ? "#e74c3c" : "var(--border)",
            }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-medium tracking-wide"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all pr-12"
              style={{
                ...inputBase,
                borderColor: error?.field === "password" ? "#e74c3c" : "var(--border)",
              }}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "var(--muted)" }}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirm"
            className="block text-xs font-medium tracking-wide"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
          >
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
            style={{
              ...inputBase,
              borderColor:
                error?.field === "confirm"
                  ? "#e74c3c"
                  : confirm && confirm !== password
                  ? "#f5a623"
                  : "var(--border)",
            }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
          {confirm && confirm !== password && (
            <p className="text-xs" style={{ color: "#f5a623" }}>Passwords don&apos;t match yet</p>
          )}
          {confirm && confirm === password && password.length >= 8 && (
            <p className="text-xs" style={{ color: "var(--green)" }}>✓ Passwords match</p>
          )}
        </div>

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only"
            />
            <div
              className="w-4 h-4 rounded flex items-center justify-center transition-all"
              style={{
                background: agreed ? "var(--accent)" : "var(--surface-raised)",
                border: `1px solid ${agreed ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {agreed && (
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            I agree to QueuePath&apos;s{" "}
            <Link href="/terms" className="no-underline hover:underline" style={{ color: "var(--accent)" }}>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="no-underline hover:underline" style={{ color: "var(--accent)" }}>
              Privacy Policy
            </Link>
          </span>
        </label>

        {/* Global error */}
        {error && !error.field && (
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "#fff1f0",
              border: "1px solid #ffc9c9",
              color: "#c0392b",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error.message}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60 mt-1"
          style={{
            background: "var(--accent)",
            boxShadow: "0 4px 20px color-mix(in srgb, var(--accent) 30%, transparent)",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Creating your account…
            </span>
          ) : (
            "Create free account"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-7">
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>or</span>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-medium transition-all"
        style={{
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
    </div>
  );
}