// src/components/EmbedForm.tsx
// Self-contained signup form used in both the embed iframe and
// the main waitlist landing page (/w/[slug]).
// Supports light + dark themes via a ?theme= query param.

"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  waitlistId: string;
  waitlistName: string;
  description: string;
  accentColor: string;
  logoUrl: string | null;
  memberCount: number;
  slug: string;
  refCode?: string;
  theme?: "light" | "dark";
  compact?: boolean; // strip header, just show inputs
}

type State = "idle" | "loading" | "success" | "error";

export function EmbedForm({
  waitlistId,
  waitlistName,
  description,
  accentColor,
  logoUrl,
  memberCount,
  slug,
  refCode,
  theme = "light",
  compact = false,
}: Props) {
  const [state, setState] = useState<State>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ position: number; referralCode: string } | null>(null);

  const isDark = theme === "dark";

  // Theme tokens
  const t = {
    bg: isDark ? "#111010" : "#ffffff",
    surface: isDark ? "#1a1917" : "#f7f6f2",
    border: isDark ? "#2a2924" : "#e2e0d8",
    text: isDark ? "#f0ede6" : "#1a1916",
    muted: isDark ? "#6b6860" : "#8a8778",
    inputBg: isDark ? "#1f1e1c" : "#ffffff",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");

    const form = e.currentTarget as HTMLFormElement;
    const honeypot = (form.elements.namedItem("hp") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, honeypot, waitlistId, refCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResult(data);
      setState("success");

      // Notify parent window of success (for script embed)
      if (typeof window !== "undefined" && window.parent !== window) {
        window.parent.postMessage(
          { type: "queuepath:success", position: data.position },
          "*"
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  const referralLink =
    result && typeof window !== "undefined"
      ? `${window.location.origin}/w/${slug}?ref=${result.referralCode}`
      : "";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: t.inputBg,
    border: `1px solid ${t.border}`,
    color: t.text,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    outline: "none",
    fontFamily: "var(--font-body), sans-serif",
    transition: "border-color 0.15s",
  };

  // ── Success state ──
  if (state === "success" && result) {
    return (
      <div
        style={{
          background: t.bg,
          padding: compact ? "20px" : "28px",
          borderRadius: 16,
          fontFamily: "var(--font-body), sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
        <p style={{ fontSize: 18, fontWeight: 500, color: t.text, marginBottom: 6 }}>
          You&apos;re in!
        </p>
        <p style={{ fontSize: 14, color: t.muted, marginBottom: 20 }}>
          You&apos;re <strong style={{ color: t.text }}>#{result.position}</strong> on the waitlist.
          Share your link to move up faster.
        </p>

        {/* Referral link box */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: 12,
              color: t.muted,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "monospace",
            }}
          >
            {referralLink}
          </span>
          <CopyBtn text={referralLink} accent={accentColor} />
        </div>

        {/* Social share */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <a
            href={`https://twitter.com/intent/tweet?text=Just+joined+the+${encodeURIComponent(waitlistName)}+waitlist!+Join+me+👇&url=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              background: "#000",
              color: "#fff",
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            {/* X logo */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              background: "#0a66c2",
              color: "#fff",
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
        </div>
      </div>
    );
  }

  // ── Form state ──
  return (
    <div
      style={{
        background: t.bg,
        padding: compact ? "20px" : "28px",
        borderRadius: 16,
        fontFamily: "var(--font-body), sans-serif",
      }}
    >
      {/* Header — hidden in compact mode */}
      {!compact && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          {logoUrl && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <Image
                src={logoUrl}
                alt={waitlistName}
                width={48}
                height={48}
                style={{ borderRadius: 12, objectFit: "cover" }}
              />
            </div>
          )}

          {/* Member count pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: accentColor + "18",
              border: `1px solid ${accentColor}44`,
              color: accentColor,
              fontSize: 12,
              fontWeight: 500,
              padding: "5px 12px",
              borderRadius: 100,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "currentColor",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            {memberCount.toLocaleString()} people joined
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display), serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: 26,
              color: t.text,
              margin: "0 0 6px",
              lineHeight: 1.1,
            }}
          >
            {waitlistName}
          </h2>

          {description && (
            <p style={{ fontSize: 13, color: t.muted, margin: 0, lineHeight: 1.6 }}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Honeypot */}
        <input
          name="hp"
          type="text"
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
          readOnly
        />

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
          onBlur={(e) => (e.currentTarget.style.borderColor = t.border)}
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
          onBlur={(e) => (e.currentTarget.style.borderColor = t.border)}
        />

        {error && (
          <p
            style={{
              fontSize: 12,
              color: "#c0392b",
              background: "#fff1f0",
              border: "1px solid #ffc9c9",
              borderRadius: 8,
              padding: "8px 12px",
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={state === "loading"}
          style={{
            background: accentColor,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "13px",
            fontSize: 14,
            fontWeight: 600,
            cursor: state === "loading" ? "not-allowed" : "pointer",
            opacity: state === "loading" ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: "var(--font-body), sans-serif",
            transition: "opacity 0.15s",
          }}
        >
          {state === "loading" ? (
            <>
              <svg
                style={{ animation: "spin 0.8s linear infinite" }}
                width="14" height="14" viewBox="0 0 24 24" fill="none"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Joining…
            </>
          ) : (
            "Join the waitlist →"
          )}
        </button>
      </form>

      {/* Powered by — shown unless on Pro */}
      <p
        style={{
          textAlign: "center",
          fontSize: 11,
          color: t.muted,
          marginTop: 12,
          marginBottom: 0,
        }}
      >
        Powered by{" "}
        <a
          href="https://queuepath.io"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: t.muted, textDecoration: "underline" }}
        >
          QueuePath
        </a>
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function CopyBtn({ text, accent }: { text: string; accent: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{
        background: copied ? "#22d87a22" : accent,
        color: copied ? "#22d87a" : "#fff",
        border: copied ? "1px solid #22d87a" : "none",
        borderRadius: 6,
        padding: "5px 10px",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.15s",
        fontFamily: "var(--font-body), sans-serif",
      }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}