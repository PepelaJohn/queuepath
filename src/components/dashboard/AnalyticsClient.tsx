// src/components/dashboard/AnalyticsClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Waitlist {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
}

interface DayData {
  date: string;
  signups: number;
  referrals: number;
}

interface TopReferrer {
  id: string;
  name: string;
  email: string;
  referralCount: number;
  position: number;
  createdAt: string;
}

interface AnalyticsData {
  waitlist: { name: string; slug: string };
  stats: {
    totalMembers: number;
    totalReferrals: number;
    organicCount: number;
    referralRate: number;
    periodSignups: number;
    periodReferrals: number;
    growthPct: number;
  };
  dailySignups: DayData[];
  topReferrers: TopReferrer[];
  byDayOfWeek: number[];
  byHour: number[];
  growthCurve: { date: string; total: number }[];
}

interface Props {
  waitlists: Waitlist[];
  selectedWaitlistId: string | null;
  initialRange: string;
}

const RANGES = [
  { label: "7d", value: "7" },
  { label: "14d", value: "14" },
  { label: "30d", value: "30" },
  { label: "90d", value: "90" },
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AnalyticsClient({ waitlists, selectedWaitlistId, initialRange }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState(initialRange);
  const [selectedId, setSelectedId] = useState(selectedWaitlistId);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const selectedWaitlist = waitlists.find((w) => w.id === selectedId);
  const accent = selectedWaitlist?.accentColor ?? "var(--accent)";

  const fetchData = useCallback(async (waitlistId: string, r: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?waitlistId=${waitlistId}&range=${r}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) fetchData(selectedId, range);
  }, [selectedId, range, fetchData]);

  function updateParams(newId: string, newRange: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("waitlist", newId);
    params.set("range", newRange);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleWaitlistChange(id: string) {
    setSelectedId(id);
    updateParams(id, range);
  }

  function handleRangeChange(r: string) {
    setRange(r);
    if (selectedId) updateParams(selectedId, r);
  }

  // ── SVG Line Chart ──
  function LineChart({ days, accentColor }: { days: DayData[]; accentColor: string }) {
    if (!days.length) return null;
    const W = 600; const H = 160; const PAD = { t: 16, r: 16, b: 32, l: 36 };
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const maxVal = Math.max(...days.map((d) => d.signups), 1);

    const pts = days.map((d, i) => ({
      x: PAD.l + (i / Math.max(days.length - 1, 1)) * innerW,
      y: PAD.t + innerH - (d.signups / maxVal) * innerH,
      ...d,
    }));

    const refPts = days.map((d, i) => ({
      x: PAD.l + (i / Math.max(days.length - 1, 1)) * innerW,
      y: PAD.t + innerH - (d.referrals / maxVal) * innerH,
      ...d,
    }));

    const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const refLinePath = refPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const areaPath = `${linePath} L${pts[pts.length - 1].x},${PAD.t + innerH} L${pts[0].x},${PAD.t + innerH} Z`;

    // Y grid lines
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
      y: PAD.t + innerH - pct * innerH,
      label: Math.round(pct * maxVal),
    }));

    // X axis labels — show every nth
    const labelEvery = days.length <= 14 ? 1 : days.length <= 30 ? 3 : 7;

    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ overflow: "visible" }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {gridLines.map((g) => (
          <g key={g.y}>
            <line
              x1={PAD.l} y1={g.y} x2={W - PAD.r} y2={g.y}
              stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3"
            />
            <text
              x={PAD.l - 6} y={g.y + 4}
              textAnchor="end" fontSize="9"
              fill="var(--muted)" fontFamily="var(--font-mono)"
            >
              {g.label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Referral line */}
        <path d={refLinePath} fill="none" stroke="var(--green)" strokeWidth="1.5"
          strokeDasharray="4 3" opacity="0.7" />

        {/* Main line */}
        <path d={linePath} fill="none" stroke={accentColor} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* X labels */}
        {pts.map((p, i) =>
          i % labelEvery === 0 ? (
            <text
              key={i} x={p.x} y={H - 4}
              textAnchor="middle" fontSize="9"
              fill="var(--muted)" fontFamily="var(--font-mono)"
            >
              {new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </text>
          ) : null
        )}

        {/* Hit areas + dots */}
        {pts.map((p, i) => (
          <g key={i}
            onMouseEnter={(e) => {
              const rect = (e.currentTarget.closest("svg") as SVGSVGElement).getBoundingClientRect();
              setTooltip({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top - 36,
                content: `${new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}\n${p.signups} signups · ${p.referrals} referred`,
              });
            }}
          >
            <rect x={p.x - 8} y={PAD.t} width="16" height={innerH} fill="transparent" />
            {p.signups > 0 && (
              <circle cx={p.x} cy={p.y} r="3" fill={accentColor} stroke="var(--bg-alt)" strokeWidth="1.5" />
            )}
          </g>
        ))}
      </svg>
    );
  }

  

  // ── SVG Sparkline for top referrers ──
  function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="flex items-center gap-2.5 flex-1">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="text-xs tabular-nums w-6 text-right" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          {value}
        </span>
      </div>
    );
  }

  const noWaitlists = waitlists.length === 0;

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase mb-2"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
            Analytics
          </p>
          <h1 className="font-display italic leading-none"
            style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 300, color: "var(--text)" }}>
            {data?.waitlist?.name ?? "Analytics"}
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Waitlist selector */}
          {waitlists.length > 1 && (
            <div className="relative">
              <select
                value={selectedId ?? ""}
                onChange={(e) => handleWaitlistChange(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm outline-none transition-all cursor-pointer"
                style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-body)" }}
              >
                {waitlists.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                style={{ color: "var(--muted)" }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          )}

          {/* Range selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {RANGES.map((r) => (
              <button key={r.value} onClick={() => handleRangeChange(r.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: range === r.value ? "var(--surface-raised)" : "transparent",
                  color: range === r.value ? "var(--text)" : "var(--muted)",
                  border: range === r.value ? "1px solid var(--border)" : "1px solid transparent",
                  boxShadow: range === r.value ? "var(--shadow-sm)" : "none",
                }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* No waitlists */}
      {noWaitlists && (
        <div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center"
          style={{ background: "var(--surface-raised)", border: "1px dashed var(--border-hover)" }}>
          <div className="text-3xl mb-4">📊</div>
          <h3 className="font-display italic mb-2" style={{ fontSize: 22, fontWeight: 300, color: "var(--text)" }}>
            No data yet.
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Create a waitlist to start seeing analytics.</p>
          <Link href="/dashboard/waitlists/new"
            className="no-underline px-5 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}>
            Create a waitlist
          </Link>
        </div>
      )}

      {!noWaitlists && (
        <div style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.2s" }}>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total signups",
                value: data?.stats.totalMembers.toLocaleString() ?? "—",
                sub: `+${data?.stats.periodSignups ?? 0} this period`,
                trend: data?.stats.growthPct,
              },
              {
                label: "Referred signups",
                value: data?.stats.totalReferrals.toLocaleString() ?? "—",
                sub: `${data?.stats.referralRate ?? 0}% referral rate`,
                color: "var(--green)",
              },
              {
                label: "Organic signups",
                value: data?.stats.organicCount.toLocaleString() ?? "—",
                sub: `${data ? 100 - data.stats.referralRate : 0}% of total`,
              },
              {
                label: "Growth this period",
                value: data ? `${data.stats.growthPct > 0 ? "+" : ""}${data.stats.growthPct}%` : "—",
                sub: "vs previous period",
                color: data && data.stats.growthPct > 0 ? "var(--green)" : data && data.stats.growthPct < 0 ? "#dc2626" : undefined,
              },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-5"
                style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                <p className="text-xs font-medium mb-3"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  {s.label}
                </p>
                <p className="font-display italic mb-1"
                  style={{ fontSize: 36, fontWeight: 300, lineHeight: 1, color: s.color ?? "var(--text)" }}>
                  {s.value}
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Signups over time chart ── */}
          <div className="rounded-2xl p-6 mb-6"
            style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-display italic"
                style={{ fontSize: 20, fontWeight: 300, color: "var(--text)" }}>
                Signups over time
              </h2>
              <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded inline-block" style={{ background: accent }} />
                  Total signups
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded inline-block" style={{ background: "var(--green)", opacity: 0.7 }} />
                  Via referral
                </span>
              </div>
            </div>

            {/* Tooltip */}
            <div className="relative">
              {tooltip && (
                <div
                  className="absolute z-10 px-3 py-2 rounded-xl text-xs pointer-events-none whitespace-pre"
                  style={{
                    left: tooltip.x,
                    top: tooltip.y,
                    background: "var(--text)",
                    color: "var(--bg)",
                    fontFamily: "var(--font-mono)",
                    boxShadow: "var(--shadow-md)",
                    transform: "translateX(-50%)",
                    lineHeight: 1.7,
                  }}
                >
                  {tooltip.content}
                </div>
              )}
              {data && <LineChart days={data.dailySignups} accentColor={accent} />}
              {!data && (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-sm" style={{ color: "var(--muted)" }}>Loading chart…</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom row: leaderboard + day-of-week + summary ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

            {/* Top referrers leaderboard */}
            <div className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between px-5 py-4 border-b"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <h2 className="font-display italic"
                  style={{ fontSize: 18, fontWeight: 300, color: "var(--text)" }}>
                  Top referrers
                </h2>
                <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  All time
                </span>
              </div>

              {!data || data.topReferrers.length === 0 ? (
                <div className="py-12 text-center" style={{ background: "var(--surface-raised)" }}>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    No referrals yet. Share the waitlist link to get started.
                  </p>
                </div>
              ) : (
                <div style={{ background: "var(--surface-raised)" }}>
                  {data.topReferrers.map((r, i) => {
                    const maxRef = data.topReferrers[0]?.referralCount ?? 1;
                    const medals = ["🥇", "🥈", "🥉"];
                    return (
                      <div key={r.id}
                        className="flex items-center gap-4 px-5 py-3.5 border-b transition-colors"
                        style={{
                          borderColor: "var(--border)",
                          ...(i === data.topReferrers.length - 1 ? { borderBottom: "none" } : {}),
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}>

                        {/* Rank */}
                        <span className="text-base w-6 text-center shrink-0">
                          {i < 3 ? medals[i] : (
                            <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                              {i + 1}
                            </span>
                          )}
                        </span>

                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                          style={{ background: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid var(--accent-muted)" }}>
                          {r.name[0]?.toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{r.name}</p>
                          <p className="text-xs truncate" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                            {r.email}
                          </p>
                        </div>

                        {/* Bar + count */}
                        <MiniBar value={r.referralCount} max={maxRef} color={accent} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">

              {/* Day of week breakdown */}
              <div className="rounded-2xl p-5"
                style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                <h2 className="font-display italic mb-4"
                  style={{ fontSize: 18, fontWeight: 300, color: "var(--text)" }}>
                  Signups by day
                </h2>
                {data ? (
                  <DayOfWeekChart counts={data.byDayOfWeek} />
                ) : (
                  <div className="h-20 flex items-center justify-center">
                    <p className="text-xs" style={{ color: "var(--muted)" }}>Loading…</p>
                  </div>
                )}
                {data && (
                  <p className="text-xs mt-2 text-center" style={{ color: "var(--muted)" }}>
                    Best day: <strong style={{ color: "var(--text)" }}>
                      {DAY_LABELS[data.byDayOfWeek.indexOf(Math.max(...data.byDayOfWeek))]}
                    </strong>
                  </p>
                )}
              </div>

              {/* Referral vs organic breakdown */}
              <div className="rounded-2xl p-5"
                style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                <h2 className="font-display italic mb-4"
                  style={{ fontSize: 18, fontWeight: 300, color: "var(--text)" }}>
                  Source split
                </h2>

                {data && data.stats.totalMembers > 0 ? (
                  <div className="space-y-4">
                    {/* Donut-ish bar */}
                    <div className="h-2 w-full rounded-full overflow-hidden flex"
                      style={{ background: "var(--border)" }}>
                      <div className="h-full transition-all"
                        style={{
                          width: `${data.stats.referralRate}%`,
                          background: "var(--green)",
                          borderRadius: data.stats.referralRate < 100 ? "9999px 0 0 9999px" : "9999px",
                        }} />
                      <div className="h-full flex-1"
                        style={{ background: accent + "66" }} />
                    </div>

                    {[
                      { label: "Referred", count: data.stats.totalReferrals, pct: data.stats.referralRate, color: "var(--green)" },
                      { label: "Organic", count: data.stats.organicCount, pct: 100 - data.stats.referralRate, color: accent },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                            {s.count.toLocaleString()}
                          </span>
                          <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                            {s.pct}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>No data yet</p>
                )}
              </div>

              {/* Quick link */}
              {data && (
                <a href={`/w/${data.waitlist.slug}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium no-underline transition-all"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--surface-raised)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  View live waitlist page
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Inner chart components declared inside to access accent via closure
  function DayOfWeekChart({ counts }: { counts: number[] }) {
    const max = Math.max(...counts, 1);
    const W = 280; const H = 80;
    const barW = 28; const gap = 12;
    const totalW = counts.length * (barW + gap) - gap;
    const offsetX = (W - totalW) / 2;

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {counts.map((c, i) => {
          const barH = Math.max((c / max) * 56, 2);
          const x = offsetX + i * (barW + gap);
          const y = 60 - barH;
          const pct = c / max;
          const col = pct > 0.7 ? accent : pct > 0.4 ? accent + "aa" : accent + "44";

          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} fill={col} rx="4" />
              <text x={x + barW / 2} y={76} textAnchor="middle"
                fontSize="8" fill="var(--muted)" fontFamily="var(--font-mono)">
                {DAY_LABELS[i]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }
}