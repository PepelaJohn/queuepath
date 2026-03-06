// src/components/dashboard/EmbedDashboardClient.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Waitlist {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
  isActive: boolean;
}

interface Props {
  waitlists: Waitlist[];
  selectedWaitlist: Waitlist | null;
  baseUrl: string;
}

type EmbedType = "script" | "iframe" | "link";
type Theme = "light" | "dark";

export function EmbedDashboardClient({ waitlists, selectedWaitlist, baseUrl }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [embedType, setEmbedType] = useState<EmbedType>("script");
  const [theme, setTheme] = useState<Theme>("light");
  const [copied, setCopied] = useState<string | null>(null);

  const w = selectedWaitlist;
  const slug = w?.slug ?? "";

  function handleWaitlistChange(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("waitlist", id);
    router.replace(`${pathname}?${params.toString()}`);
  }

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2500);
  }

  // ── Code snippets ──
  const scriptSnippet = `<!-- QueuePath embed for ${w?.name ?? "your waitlist"} -->
<div id="qp-embed"></div>
<script
  src="${baseUrl}/api/embed/${slug}${theme === "dark" ? "?theme=dark" : ""}"
  async
></script>`.trim();

  const iframeSnippet = `<!-- QueuePath iframe embed -->
<iframe
  src="${baseUrl}/embed/${slug}?theme=${theme}"
  width="100%"
  height="420"
  frameborder="0"
  scrolling="no"
  allowtransparency="true"
  title="Join ${w?.name ?? "the"} waitlist"
></iframe>`.trim();

  const linkSnippet = `${baseUrl}/w/${slug}`;

  const snippets: Record<EmbedType, string> = {
    script: scriptSnippet,
    iframe: iframeSnippet,
    link: linkSnippet,
  };

  const tabs: { id: EmbedType; label: string; icon: React.ReactNode }[] = [
    {
      id: "script",
      label: "Script tag",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      id: "iframe",
      label: "iFrame",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
        </svg>
      ),
    },
    {
      id: "link",
      label: "Direct link",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
  ];

  const embedPreviewUrl = w ? `${baseUrl}/embed/${w.slug}?theme=${theme}` : null;

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto w-full">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
          Embed widget
        </p>
        <h1 className="font-display italic leading-none"
          style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 300, color: "var(--text)" }}>
          Add to your website.
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
          Drop your waitlist anywhere — your blog, landing page, or product site.
        </p>
      </div>

      {/* No waitlists */}
      {waitlists.length === 0 && (
        <div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center"
          style={{ background: "var(--surface-raised)", border: "1px dashed var(--border-hover)" }}>
          <div className="text-3xl mb-4">🔗</div>
          <h3 className="font-display italic mb-2" style={{ fontSize: 22, fontWeight: 300, color: "var(--text)" }}>
            No waitlists yet.
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Create a waitlist first to get your embed code.</p>
          <Link href="/dashboard/waitlists/new"
            className="no-underline px-5 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}>
            Create a waitlist
          </Link>
        </div>
      )}

      {waitlists.length > 0 && w && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* Left — controls + code */}
          <div className="space-y-6">

            {/* Waitlist + theme selectors */}
            <div className="flex items-center gap-3 flex-wrap">
              {waitlists.length > 1 && (
                <div className="relative">
                  <select
                    value={w.id}
                    onChange={(e) => handleWaitlistChange(e.target.value)}
                    className="appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm outline-none transition-all cursor-pointer"
                    style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-body)" }}
                  >
                    {waitlists.map((wl) => (
                      <option key={wl.id} value={wl.id}>{wl.name}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    style={{ color: "var(--muted)" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              )}

              {/* Theme toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                {(["light", "dark"] as Theme[]).map((t) => (
                  <button key={t} onClick={() => setTheme(t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                    style={{
                      background: theme === t ? "var(--surface-raised)" : "transparent",
                      color: theme === t ? "var(--text)" : "var(--muted)",
                      border: theme === t ? "1px solid var(--border)" : "1px solid transparent",
                    }}>
                    {t === "light" ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                      </svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    )}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {/* Active status badge */}
              <span className="text-xs px-2.5 py-1 rounded-full ml-auto"
                style={{
                  background: w.isActive ? "var(--green-subtle)" : "var(--surface)",
                  color: w.isActive ? "var(--green)" : "var(--muted)",
                  border: `1px solid ${w.isActive ? "var(--green)" : "var(--border)"}`,
                  fontSize: 11,
                }}>
                {w.isActive ? "● Active" : "○ Paused"}
              </span>
            </div>

            {/* Embed type tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl w-fit"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setEmbedType(tab.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: embedType === tab.id ? "var(--surface-raised)" : "transparent",
                    color: embedType === tab.id ? "var(--text)" : "var(--muted)",
                    border: embedType === tab.id ? "1px solid var(--border)" : "1px solid transparent",
                    boxShadow: embedType === tab.id ? "var(--shadow-sm)" : "none",
                  }}>
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Description per embed type */}
            <div className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {embedType === "script" && (
                <p>Drop the <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--surface)", padding: "1px 5px", borderRadius: 4 }}>&lt;script&gt;</code> tag anywhere on your page. The form renders inside the <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--surface)", padding: "1px 5px", borderRadius: 4 }}>div</code> and auto-resizes. Referral codes in the URL are forwarded automatically.</p>
              )}
              {embedType === "iframe" && (
                <p>Paste the <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--surface)", padding: "1px 5px", borderRadius: 4 }}>iframe</code> directly into your HTML. Works in any site builder — Webflow, Framer, Notion, WordPress, and more.</p>
              )}
              {embedType === "link" && (
                <p>Share this link directly — on social, in emails, or in your bio. Opens the full-page waitlist on QueuePath.</p>
              )}
            </div>

            {/* Code block */}
            <div className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--border)" }}>
              {/* Code block header */}
              <div className="flex items-center justify-between px-4 py-3 border-b"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ffbd2e" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28ca41" }} />
                  </div>
                  <span className="text-xs ml-1" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    {embedType === "script" ? "index.html" : embedType === "iframe" ? "embed.html" : "link"}
                  </span>
                </div>
                <button
                  onClick={() => copy(snippets[embedType], embedType)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: copied === embedType ? "var(--green-subtle)" : "var(--surface-raised)",
                    color: copied === embedType ? "var(--green)" : "var(--text-secondary)",
                    border: `1px solid ${copied === embedType ? "var(--green)" : "var(--border)"}`,
                  }}>
                  {copied === embedType ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Code content */}
              <pre
                className="overflow-x-auto text-xs leading-relaxed p-5 m-0"
                style={{
                  background: "var(--surface-raised)",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {snippets[embedType]}
              </pre>
            </div>

            {/* Implementation notes */}
            {embedType === "script" && (
              <div className="rounded-2xl p-5 space-y-3"
                style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold tracking-wide uppercase"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  Integration notes
                </p>
                <ul className="space-y-2">
                  {[
                    "Add the <div id=\"qp-embed\"> wherever you want the form to appear on your page.",
                    "The script auto-resizes the iframe height — no fixed height needed.",
                    "Referral codes (?ref=...) in the page URL are automatically forwarded.",
                    "Listen for window events: document.addEventListener('queuepath:success', e => console.log('Position:', e.detail.position))",
                    "Change the target div's id by adding ?target=my-div to the script src.",
                  ].map((note, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}>
                      <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid var(--accent-muted)", fontSize: 9 }}>
                        {i + 1}
                      </span>
                      <span style={{ fontFamily: note.includes('"') ? "var(--font-mono)" : undefined, fontSize: note.includes('"') ? 11 : 12 }}>
                        {note}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right — live preview */}
          <div className="lg:sticky lg:top-8 space-y-4">
            <p className="text-xs tracking-[0.18em] uppercase"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              Live preview
            </p>

            {/* Browser mockup */}
            <div className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-70" />
                </div>
                <div className="flex-1 rounded px-2.5 py-1 text-xs"
                  style={{ background: "var(--surface)", color: "var(--muted)", fontFamily: "var(--font-mono)", border: "1px solid var(--border)" }}>
                  yourwebsite.com
                </div>
              </div>

              {/* Fake page context */}
              <div style={{
                background: theme === "dark" ? "#111010" : "#ffffff",
                padding: "24px 20px",
              }}>
                {/* Fake surrounding content */}
                <div className="mb-4 space-y-2">
                  <div className="h-3 rounded-full w-3/4"
                    style={{ background: theme === "dark" ? "#2a2924" : "#f0ede6" }} />
                  <div className="h-3 rounded-full w-1/2"
                    style={{ background: theme === "dark" ? "#2a2924" : "#f0ede6" }} />
                </div>

                {/* Embedded form preview */}
                {embedPreviewUrl && (
                  <iframe
                    key={`${w.slug}-${theme}`}
                    src={embedPreviewUrl}
                    title="Embed preview"
                    className="w-full rounded-xl overflow-hidden"
                    style={{
                      border: `1px solid ${theme === "dark" ? "#2a2924" : "#e2e0d8"}`,
                      height: 380,
                      display: "block",
                    }}
                    scrolling="no"
                  />
                )}

                {/* More fake content */}
                <div className="mt-4 space-y-2">
                  <div className="h-2.5 rounded-full w-5/6"
                    style={{ background: theme === "dark" ? "#2a2924" : "#f0ede6" }} />
                  <div className="h-2.5 rounded-full w-2/3"
                    style={{ background: theme === "dark" ? "#2a2924" : "#f0ede6" }} />
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="space-y-2">
              <a href={`/w/${w.slug}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-xl no-underline transition-all group"
                style={{ border: "1px solid var(--border)", background: "var(--surface-raised)", color: "var(--text-secondary)" }}>
                <span className="text-sm">View full page</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                  style={{ opacity: 0.5 }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
              <Link href={`/dashboard/waitlists/${w.id}/edit`}
                className="flex items-center justify-between px-4 py-3 rounded-xl no-underline transition-all"
                style={{ border: "1px solid var(--border)", background: "var(--surface-raised)", color: "var(--text-secondary)" }}>
                <span className="text-sm">Edit waitlist settings</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                  style={{ opacity: 0.5 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}