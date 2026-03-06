// src/app/not-found.tsx
// Global 404 page — matches the editorial QueuePath aesthetic

import Link from "next/link";

export default function NotFound() {
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
          userSelect: "none",
        }}
      >
        404
      </span>

      {/* Subtle grid */}
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
          style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
        >
          Error 404
        </p>

        <h1
          className="font-display italic leading-[0.9] mb-6"
          style={{
            fontSize: "clamp(52px, 8vw, 96px)",
            fontWeight: 300,
            color: "var(--text)",
            letterSpacing: "-0.02em",
          }}
        >
          Page not
          <br />
          found.
        </h1>

        <p
          className="text-base font-light leading-relaxed mb-10"
          style={{ color: "var(--muted)" }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br />
          Let&apos;s get you back on track.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-2 no-underline px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{
              background: "var(--accent)",
              boxShadow: "0 4px 20px color-mix(in srgb, var(--accent) 25%, transparent)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 no-underline px-6 py-3 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              background: "var(--surface-raised)",
            }}
          >
            Dashboard →
          </Link>
        </div>
      </div>

      {/* Bottom brand */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
          style={{ color: "var(--muted)" }}
        >
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "var(--accent)" }}
          >
            Q
          </div>
          <span
            className="text-xs tracking-[0.15em] uppercase font-medium"
            style={{ fontFamily: "var(--font-body)" }}
          >
            QueuePath
          </span>
        </Link>
      </div>
    </div>
  );
}