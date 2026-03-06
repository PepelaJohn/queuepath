// src/app/error.tsx
// Global error boundary — catches unhandled runtime errors
"use client";

import { useEffect } from "react";
import Link from "next/link";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to your error tracking service here (e.g. Sentry)
    console.error("[QueuePath Error]", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Background watermark */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute inset-0 flex items-center justify-center font-display italic"
        style={{
          fontSize: "clamp(160px, 30vw, 340px)",
          fontWeight: 300,
          opacity: 0.04,
          color: "var(--text)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        500
      </span>

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.4,
        }}
      />

      <div className="relative z-10 text-center max-w-lg">
        <p
          className="text-xs tracking-[0.22em] uppercase mb-6"
          style={{ color: "#dc2626", fontFamily: "var(--font-mono)" }}
        >
          Error 500 or something like that
        </p>

        <h1
          className="font-display italic leading-[0.9] mb-6"
          style={{
            fontSize: "clamp(48px, 7vw, 88px)",
            fontWeight: 300,
            color: "var(--text)",
            letterSpacing: "-0.02em",
          }}
        >
          Something
          <br />
          went wrong.
        </h1>

        <p
          className="text-base font-light leading-relaxed mb-4"
          style={{ color: "var(--muted)" }}
        >
          An unexpected error occurred. Our team has been notified.
          <br />
          Try refreshing the page or going back to the dashboard.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <p
            className="text-xs mb-8 px-3 py-2 rounded-lg inline-block"
            style={{
              color: "var(--muted)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 flex-wrap mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{
              background: "var(--accent)",
              boxShadow: "0 4px 20px color-mix(in srgb, var(--accent) 25%, transparent)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.49" />
            </svg>
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 no-underline px-6 py-3 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              background: "var(--surface-raised)",
            }}
          >
            Back to dashboard
          </Link>
        </div>
      </div>

      {/* Bottom brand */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <Link href="/" className="flex items-center gap-2 no-underline" style={{ color: "var(--muted)" }}>
          <div className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: "var(--accent)" }}>Q</div>
          <span className="text-xs tracking-[0.15em] uppercase font-medium" style={{ fontFamily: "var(--font-body)" }}>QueuePath</span>
        </Link>
      </div>
    </div>
  );
}