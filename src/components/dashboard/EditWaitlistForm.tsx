// src/components/dashboard/EditWaitlistForm.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Waitlist } from "@prisma/client";

const ACCENT_PRESETS = [
  "#2351f5", "#7c3aed", "#db2777", "#dc2626",
  "#ea580c", "#d97706", "#16a34a", "#0891b2",
];

type Tab = "general" | "appearance" | "danger";

interface Props {
  waitlist: Waitlist;
}

export function EditWaitlistForm({ waitlist }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>("general");

  // General fields
  const [name, setName] = useState(waitlist.name);
  const [description, setDescription] = useState(waitlist.description ?? "");

  // Appearance fields
  const [accentColor, setAccentColor] = useState(waitlist.accentColor);
  const [logoUrl, setLogoUrl] = useState(waitlist.logoUrl ?? "");
  const [logoPreview, setLogoPreview] = useState(waitlist.logoUrl ?? "");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // State
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "var(--accent)";
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "var(--border)";
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
    setUploadingLogo(true);
    setError("");

    try {
      // Get Cloudinary upload signature
      const sigRes = await fetch("/api/upload-signature");
      const { signature, timestamp, cloudName, apiKey } = await sigRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("api_key", apiKey);
      formData.append("folder", "queuepath/logos");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error("Upload failed");
      setLogoUrl(uploadData.secure_url);
      setLogoPreview(uploadData.secure_url);
    } catch {
      setError("Logo upload failed. Please try again.");
      setLogoPreview(waitlist.logoUrl ?? "");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/waitlists/${waitlist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          accentColor,
          logoUrl: logoUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== waitlist.slug) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/waitlists/${waitlist.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "appearance", label: "Appearance" },
    { id: "danger", label: "Danger zone" },
  ];

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto w-full">

      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/waitlists/${waitlist.id}`}
          className="inline-flex items-center gap-1.5 no-underline text-xs mb-5 transition-colors"
          style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to {waitlist.name}
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p
              className="text-xs tracking-[0.2em] uppercase mb-2"
              style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
            >
              Edit waitlist
            </p>
            <h1
              className="font-display italic leading-none"
              style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 300, color: "var(--text)" }}
            >
              {waitlist.name}
            </h1>
            <p className="text-xs mt-1.5" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              /w/{waitlist.slug}
            </p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || uploadingLogo || tab === "danger"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 hover:opacity-90 hover:-translate-y-0.5"
            style={{
              background: saveSuccess ? "var(--green)" : "var(--accent)",
              boxShadow: saveSuccess
                ? "0 4px 16px color-mix(in srgb, var(--green) 25%, transparent)"
                : "0 4px 16px color-mix(in srgb, var(--accent) 25%, transparent)",
            }}
          >
            {saving ? (
              <>
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Saving…
              </>
            ) : saveSuccess ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                Save changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm mb-6"
          style={{ background: "#fff1f0", border: "1px solid #ffc9c9", color: "#c0392b" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5v3M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

        {/* Left — tabs + form */}
        <div>
          {/* Tab bar */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl mb-8 w-fit"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: tab === t.id ? "var(--surface-raised)" : "transparent",
                  color: tab === t.id
                    ? t.id === "danger" ? "#dc2626" : "var(--text)"
                    : t.id === "danger" ? "#dc262680" : "var(--muted)",
                  boxShadow: tab === t.id ? "var(--shadow-sm)" : "none",
                  border: tab === t.id ? "1px solid var(--border)" : "1px solid transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── GENERAL TAB ── */}
          {tab === "general" && (
            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-medium tracking-wide"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
                >
                  Waitlist name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputBase}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              {/* Slug — read only */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-medium tracking-wide"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
                >
                  URL slug
                  <span
                    className="ml-2 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}
                  >
                    locked
                  </span>
                </label>
                <div
                  className="flex items-center rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--border)", background: "var(--surface)", opacity: 0.7 }}
                >
                  <span
                    className="px-4 py-3 text-sm border-r shrink-0"
                    style={{ color: "var(--muted)", borderColor: "var(--border)", fontFamily: "var(--font-mono)", fontSize: 12 }}
                  >
                    /w/
                  </span>
                  <span className="px-4 py-3 text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    {waitlist.slug}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Slugs can&apos;t be changed after creation to preserve existing links.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-medium tracking-wide"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
                >
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell visitors what they're signing up for…"
                  rows={4}
                  style={{ ...inputBase, resize: "vertical", minHeight: 100 }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <p className="text-xs text-right" style={{ color: description.length > 280 ? "#dc2626" : "var(--muted)" }}>
                  {description.length}/300
                </p>
              </div>
            </div>
          )}

          {/* ── APPEARANCE TAB ── */}
          {tab === "appearance" && (
            <div className="space-y-8">
              {/* Logo upload */}
              <div className="space-y-3">
                <label
                  className="block text-xs font-medium tracking-wide"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
                >
                  Logo
                </label>

                <div className="flex items-center gap-5">
                  {/* Preview */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 relative"
                    style={{
                      background: logoPreview ? "transparent" : "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {uploadingLogo && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--surface)", borderRadius: "inherit" }}>
                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" style={{ color: "var(--muted)" }}/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ color: "var(--accent)" }}/>
                        </svg>
                      </div>
                    )}
                    {logoPreview && !uploadingLogo ? (
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                        unoptimized={logoPreview.startsWith("blob:")}
                      />
                    ) : !uploadingLogo ? (
                      <span className="text-2xl">🚀</span>
                    ) : null}
                  </div>

                  {/* Upload / remove */}
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                      style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--surface-raised)" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      {uploadingLogo ? "Uploading…" : "Upload logo"}
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={() => { setLogoUrl(""); setLogoPreview(""); }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all"
                        style={{ color: "#dc2626", border: "1px solid #ffc9c9", background: "#fff1f0" }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                        Remove logo
                      </button>
                    )}
                    <p className="text-xs" style={{ color: "var(--muted)" }}>PNG, JPG, WebP or SVG. Max 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Accent color */}
              <div className="space-y-3">
                <label
                  className="block text-xs font-medium tracking-wide"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
                >
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
                        transform: accentColor === c ? "scale(1.18)" : "scale(1)",
                      }}
                    />
                  ))}

                  {/* Custom */}
                  <label
                    className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden"
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

                  <span className="text-xs ml-1" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    {accentColor}
                  </span>
                </div>

                {/* Colour swatch preview */}
                <div
                  className="h-2 w-full rounded-full mt-2"
                  style={{ background: `linear-gradient(90deg, ${accentColor}33, ${accentColor})` }}
                />
              </div>
            </div>
          )}

          {/* ── DANGER ZONE TAB ── */}
          {tab === "danger" && (
            <div
              className="rounded-2xl p-6 space-y-5"
              style={{ border: "1.5px solid #ffc9c9", background: "#fff8f8" }}
            >
              <div>
                <h3 className="font-medium text-base mb-1" style={{ color: "#c0392b" }}>
                  Delete this waitlist
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#e05d4b" }}>
                  This will permanently delete <strong>{waitlist.name}</strong> and all {" "}
                  subscriber data. This action <strong>cannot be undone</strong>.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium" style={{ color: "#c0392b", fontFamily: "var(--font-mono)" }}>
                  Type <span className="font-bold">{waitlist.slug}</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder={waitlist.slug}
                  style={{
                    ...inputBase,
                    background: "#fff",
                    border: "1px solid #ffc9c9",
                    color: "#c0392b",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#dc2626")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#ffc9c9")}
                />
              </div>

              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== waitlist.slug || deleting}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
                style={{ background: "#dc2626" }}
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Deleting…
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                    </svg>
                    Delete waitlist permanently
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right — live preview (sticky) */}
        <div className="lg:sticky lg:top-8">
          <p
            className="text-xs tracking-[0.18em] uppercase mb-3"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
          >
            Live preview
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
          >
            {/* Browser chrome */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
            >
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-70"/>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-70"/>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-70"/>
              </div>
              <div
                className="flex-1 max-w-[180px] rounded px-2.5 py-1 text-xs"
                style={{ background: "var(--surface)", color: "var(--muted)", fontFamily: "var(--font-mono)", border: "1px solid var(--border)" }}
              >
                /w/{waitlist.slug}
              </div>
            </div>

            {/* Preview body */}
            <div
              className="p-8 flex flex-col items-center text-center gap-4 min-h-[340px]"
              style={{
                background: `radial-gradient(ellipse at top, ${accentColor}14 0%, var(--bg) 65%)`,
              }}
            >
              {/* Logo */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden text-xl"
                style={{
                  background: logoPreview ? "transparent" : accentColor + "22",
                  border: `1px solid ${accentColor}44`,
                }}
              >
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Logo"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                    unoptimized={logoPreview.startsWith("blob:")}
                  />
                ) : "🚀"}
              </div>

              {/* Live count pill */}
              <div
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: accentColor + "18", color: accentColor, border: `1px solid ${accentColor}44` }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>
                0 people already joined
              </div>

              {/* Name */}
              <h3
                className="font-display italic"
                style={{ fontSize: 22, fontWeight: 300, color: "var(--text)", lineHeight: 1.1 }}
              >
                {name || "Your waitlist name"}
              </h3>

              {/* Description */}
              {description && (
                <p className="text-xs leading-relaxed max-w-[210px]" style={{ color: "var(--muted)" }}>
                  {description.slice(0, 100)}{description.length > 100 ? "…" : ""}
                </p>
              )}

              {/* Inputs mock */}
              <div className="w-full space-y-2 mt-1">
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
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-center text-white transition-all"
                  style={{ background: accentColor }}
                >
                  Join the waitlist →
                </div>
              </div>
            </div>
          </div>

          {/* View live link */}
          <a
            href={`/w/${waitlist.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 text-xs no-underline transition-colors"
            style={{ color: "var(--muted)" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            View live page
          </a>
        </div>
      </div>
    </div>
  );
}