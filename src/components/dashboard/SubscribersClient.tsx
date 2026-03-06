
// src/components/dashboard/SubscribersClient.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import Link from "next/link";

interface Waitlist {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  position: number;
  referralCount: number;
  referralCode: string;
  createdAt: Date;
  referredBy: { name: string; email: string } | null;
}

interface Props {
  waitlists: Waitlist[];
  members: Member[];
  selectedWaitlistId: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  currentSearch: string;
  currentSort: string;
}

type SortKey = "position" | "referrals" | "date";

export function SubscribersClient({
  waitlists,
  members,
  selectedWaitlistId,
  totalCount,
  totalPages,
  currentPage,
  currentSearch,
  currentSort,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [exportLoading, setExportLoading] = useState(false);
  const [search, setSearch] = useState(currentSearch);

  const selectedWaitlist = waitlists.find((w) => w.id === selectedWaitlistId);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  const handleSearch = useCallback(
    (val: string) => {
      setSearch(val);
      const debounce = setTimeout(() => updateParam("search", val), 350);
      return () => clearTimeout(debounce);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  async function handleExport() {
    if (!selectedWaitlistId) return;
    setExportLoading(true);
    try {
      const params = new URLSearchParams({ waitlistId: selectedWaitlistId });
      if (currentSearch) params.set("search", currentSearch);
      const res = await fetch(`/api/subscribers/export?${params}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedWaitlist?.slug ?? "subscribers"}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  }

  const sorts: { key: SortKey; label: string }[] = [
    { key: "position", label: "Queue position" },
    { key: "referrals", label: "Most referrals" },
    { key: "date", label: "Latest first" },
  ];

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto w-full">

      {/* Page header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p
            className="text-xs tracking-[0.2em] uppercase mb-2"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
          >
            Subscribers
          </p>
          <h1
            className="font-display italic leading-none"
            style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 300, color: "var(--text)" }}
          >
            {selectedWaitlist ? selectedWaitlist.name : "All subscribers"}
          </h1>
          {totalCount > 0 && (
            <p className="text-sm mt-1.5" style={{ color: "var(--muted)" }}>
              {totalCount.toLocaleString()} subscriber{totalCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={exportLoading || totalCount === 0}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40 hover:opacity-90 hover:-translate-y-0.5"
          style={{
            background: "var(--accent)",
            color: "#fff",
            boxShadow: "0 4px 16px color-mix(in srgb, var(--accent) 25%, transparent)",
          }}
        >
          {exportLoading ? (
            <>
              <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Exporting…
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </>
          )}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">

        {/* Waitlist filter */}
        {waitlists.length > 1 && (
          <div className="relative">
            <select
              value={selectedWaitlistId ?? ""}
              onChange={(e) => updateParam("waitlist", e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm font-medium outline-none transition-all cursor-pointer"
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontFamily: "var(--font-body)",
              }}
            >
              {waitlists.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{ color: "var(--muted)" }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        )}

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            style={{ color: "var(--muted)" }}
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
          {isPending && (
            <svg className="animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" style={{ color: "var(--muted)" }}/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ color: "var(--accent)" }}/>
            </svg>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 p-1 rounded-xl ml-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {sorts.map((s) => (
            <button
              key={s.key}
              onClick={() => updateParam("sort", s.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: currentSort === s.key ? "var(--surface-raised)" : "transparent",
                color: currentSort === s.key ? "var(--text)" : "var(--muted)",
                border: currentSort === s.key ? "1px solid var(--border)" : "1px solid transparent",
                boxShadow: currentSort === s.key ? "var(--shadow-sm)" : "none",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* No waitlists at all */}
      {waitlists.length === 0 && (
        <div
          className="rounded-2xl flex flex-col items-center justify-center py-20 text-center"
          style={{ background: "var(--surface-raised)", border: "1px dashed var(--border-hover)" }}
        >
          <div className="text-3xl mb-4">👥</div>
          <h3 className="font-display italic mb-2" style={{ fontSize: 22, fontWeight: 300, color: "var(--text)" }}>
            No waitlists yet.
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Create a waitlist first to start collecting subscribers.</p>
          <Link
            href="/dashboard/waitlists/new"
            className="no-underline px-5 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            Create a waitlist
          </Link>
        </div>
      )}

      {/* Table */}
      {waitlists.length > 0 && (
        <>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border)", opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}
          >
            {/* Table header */}
            <div
              className="grid items-center gap-4 px-5 py-3 text-xs font-medium tracking-wide border-b"
              style={{
                gridTemplateColumns: "36px 1fr 1fr 90px 80px 100px",
                color: "var(--muted)",
                fontFamily: "var(--font-mono)",
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <span
                className="cursor-pointer hover:underline"
                onClick={() => updateParam("sort", "position")}
                style={{ color: currentSort === "position" ? "var(--accent)" : undefined }}
              >
                #
              </span>
              <span>Name</span>
              <span>Email</span>
              <span
                className="cursor-pointer hover:underline"
                onClick={() => updateParam("sort", "referrals")}
                style={{ color: currentSort === "referrals" ? "var(--accent)" : undefined }}
              >
                Referrals
              </span>
              <span>Referred by</span>
              <span
                className="cursor-pointer hover:underline"
                onClick={() => updateParam("sort", "date")}
                style={{ color: currentSort === "date" ? "var(--accent)" : undefined }}
              >
                Joined
              </span>
            </div>

            {/* Rows */}
            {members.length === 0 ? (
              <div
                className="py-20 text-center"
                style={{ background: "var(--surface-raised)" }}
              >
                {currentSearch ? (
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>No results for &ldquo;{currentSearch}&rdquo;</p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>Try a different name or email.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl mb-3">📭</p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>No subscribers yet. Share your waitlist link to get started.</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: "var(--surface-raised)" }}>
                {members.map((m, i) => (
                  <MemberRow
                    key={m.id}
                    member={m}
                    isLast={i === members.length - 1}
                    accentColor={selectedWaitlist?.accentColor ?? "var(--accent)"}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination + count */}
          <div className="flex items-center justify-between mt-5 flex-wrap gap-4">
            <p className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              Showing {members.length > 0 ? ((currentPage - 1) * 25) + 1 : 0}–{Math.min(currentPage * 25, totalCount)} of {totalCount.toLocaleString()}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateParam("page", String(currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-30"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--surface-raised)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => updateParam("page", String(p))}
                      className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: currentPage === p ? "var(--accent)" : "var(--surface-raised)",
                        color: currentPage === p ? "#fff" : "var(--text-secondary)",
                        border: `1px solid ${currentPage === p ? "var(--accent)" : "var(--border)"}`,
                      }}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() => updateParam("page", String(currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-30"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--surface-raised)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MemberRow({
  member: m,
  isLast,
  accentColor,
}: {
  member: Member;
  isLast: boolean;
  accentColor: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyReferralLink() {
    const link = `${window.location.origin}/w/${window.location.pathname}?ref=${m.referralCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const joinDate = new Date(m.createdAt);
  const dateStr = joinDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = joinDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className="grid items-center gap-4 px-5 py-4 border-b group transition-colors"
      style={{
        gridTemplateColumns: "36px 1fr 1fr 90px 80px 100px",
        borderColor: "var(--border)",
        ...(isLast ? { borderBottom: "none" } : {}),
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
    >
      {/* Position */}
      <span
        className="font-medium text-xs tabular-nums"
        style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
      >
        {m.position}
      </span>

      {/* Name */}
      <div className="min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{m.name}</p>
      </div>

      {/* Email */}
      <div className="min-w-0 flex items-center gap-2">
        <span
          className="text-xs truncate"
          style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
        >
          {m.email}
        </span>
        <button
          onClick={copyReferralLink}
          className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded transition-all"
          title="Copy referral link"
          style={{ color: copied ? "var(--green)" : "var(--muted)" }}
        >
          {copied ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          )}
        </button>
      </div>

      {/* Referrals */}
      <div>
        {m.referralCount > 0 ? (
          <span
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: "var(--green-subtle)",
              color: "var(--green)",
              border: "1px solid var(--green)",
            }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {m.referralCount}
          </span>
        ) : (
          <span style={{ color: "var(--border)", fontSize: 12 }}>—</span>
        )}
      </div>

      {/* Referred by */}
      <div className="min-w-0">
        {m.referredBy ? (
          <span
            className="text-xs truncate block"
            title={`${m.referredBy.name} (${m.referredBy.email})`}
            style={{ color: "var(--muted)" }}
          >
            {m.referredBy.name}
          </span>
        ) : (
          <span style={{ color: "var(--border)", fontSize: 12 }}>—</span>
        )}
      </div>

      {/* Date */}
      <div>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{dateStr}</p>
        <p className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{timeStr}</p>
      </div>
    </div>
  );
}