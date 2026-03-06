// src/app/dashboard/waitlists/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ACCENT_PRESETS = [
  "#2351f5", "#7c3aed", "#db2777", "#dc2626",
  "#ea580c", "#d97706", "#16a34a", "#0891b2",
];

export default function NewWaitlistPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [accentColor, setAccentColor] = useState("#2351f5");
  const [slugManual, setSlugManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toSlug(val: string) {
    return val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 48);
  }

  function handleNameChange(val: string) {
    setName(val);
    if (!slugManual) setSlug(toSlug(val));
  }

  function handleSlugChange(val: string) {
    setSlugManual(true);
    setSlug(toSlug(val));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const res = await fetch("/api/waitlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, accentColor }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create waitlist");
      }
  
      router.push(`/dashboard/waitlists/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputBase: React.CSSProperties = {
    background: "var(--surface-raised)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    width: "100%",
    borderRadius: 12,
    padding: "12px 16px",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 no-underline text-xs mb-6 transition-colors"
          style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to dashboard
        </Link>
        <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
          New waitlist
        </p>
        <h1
          className="font-display italic leading-none"
          style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, color: "var(--text)" }}
        >
          Create your waitlist.
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium tracking-wide" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              Waitlist name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Awesome Product"
              style={inputBase}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium tracking-wide" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              URL slug *
            </label>
            <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface-raised)" }}>
              <span
                className="px-4 py-3 text-sm border-r shrink-0"
                style={{ color: "var(--muted)", borderColor: "var(--border)", fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--surface)" }}
              >
                /w/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="my-awesome-product"
                style={{ ...inputBase, border: "none", borderRadius: 0, background: "transparent" }}
                onFocus={(e) => { (e.currentTarget.parentElement as HTMLElement).style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { (e.currentTarget.parentElement as HTMLElement).style.borderColor = "var(--border)"; }}
              />
            </div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Your waitlist will be live at <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>queuepath.io/w/{slug || "your-slug"}</span>
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium tracking-wide" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell visitors what they're signing up for…"
              rows={3}
              style={{ ...inputBase, resize: "vertical", minHeight: 88 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Accent color */}
          <div className="space-y-2.5">
            <label className="block text-xs font-medium tracking-wide" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              Brand colour
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{
                    background: c,
                    outline: accentColor === c ? `2px solid ${c}` : "none",
                    outlineOffset: 2,
                    transform: accentColor === c ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
              {/* Custom color input */}
              <label
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all overflow-hidden relative"
                style={{ border: "1.5px dashed var(--border-hover)" }}
                title="Custom colour"
              >
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--muted)", pointerEvents: "none" }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              </label>

              {/* Hex display */}
              <span className="text-xs ml-1" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                {accentColor}
              </span>
            </div>
          </div>

          {error && (
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
              style={{ background: "#fff1f0", border: "1px solid #ffc9c9", color: "#c0392b" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !name || !slug}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Creating…
                </>
              ) : "Create waitlist"}
            </button>
            <Link href="/dashboard" className="text-sm no-underline transition-colors" style={{ color: "var(--muted)" }}>
              Cancel
            </Link>
          </div>
        </form>

        {/* Live preview */}
        <div className="lg:sticky lg:top-8">
          <p className="text-xs tracking-[0.18em] uppercase mb-3" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            Live preview
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
          >
            {/* Browser bar */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
            >
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-70" />
              </div>
              <div
                className="flex-1 max-w-[180px] rounded px-2.5 py-1 text-xs"
                style={{ background: "var(--surface)", color: "var(--muted)", fontFamily: "var(--font-mono)", border: "1px solid var(--border)" }}
              >
                /w/{slug || "your-slug"}
              </div>
            </div>

            {/* Preview content */}
            <div
              className="p-8 flex flex-col items-center text-center gap-4 min-h-[320px]"
              style={{
                background: `radial-gradient(ellipse at top, ${accentColor}14 0%, var(--bg) 65%)`,
              }}
            >
              {/* Logo placeholder */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ background: accentColor + "22", border: `1px solid ${accentColor}44` }}
              >
                🚀
              </div>

              {/* Count pill */}
              <div
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: accentColor + "18", color: accentColor, border: `1px solid ${accentColor}44` }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                0 people already joined
              </div>

              <h3
                className="font-display italic"
                style={{ fontSize: 24, fontWeight: 300, color: "var(--text)", lineHeight: 1.1 }}
              >
                {name || "Your product name"}
              </h3>

              {description && (
                <p className="text-xs leading-relaxed max-w-[220px]" style={{ color: "var(--muted)" }}>
                  {description}
                </p>
              )}

              {/* Fake inputs */}
              <div className="w-full space-y-2.5 mt-1">
                <div
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-left"
                  style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--muted)" }}
                >
                  Your name
                </div>
                <div
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-left"
                  style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--muted)" }}
                >
                  your@email.com
                </div>
                <div
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-center text-white"
                  style={{ background: accentColor }}
                >
                  Join the waitlist →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}