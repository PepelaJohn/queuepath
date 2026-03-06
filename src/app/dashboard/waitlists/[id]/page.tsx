// src/app/dashboard/waitlists/[id]/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CopyButton } from "@/components/dashboard/CopyButton";
import { ToggleActiveButton } from "@/components/dashboard/ToggleActiveButton";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

interface Props  { params: Promise<{ id: string }> }

export default async function WaitlistDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const waitlist = await prisma.waitlist.findUnique({
    where: { id: (await params).id, founderId: session.user.id },
    include: {
      members: {
        orderBy: { position: "asc" },
        take: 50,
        select: {
          id: true, name: true, email: true, position: true,
          referralCount: true, createdAt: true, referralCode: true,
        },
      },
      _count: { select: { members: true } },
    },
  });

  if (!waitlist) notFound();

  const totalMembers = waitlist._count.members;
  const totalReferrals = waitlist.members.reduce((s: any, m: { referralCount: any; }) => s + m.referralCount, 0);
  const topReferrer = [...waitlist.members].sort((a, b) => b.referralCount - a.referralCount)[0];

  const shareUrl = `${process.env.NEXTAUTH_URL}/w/${waitlist.slug}`;

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 no-underline text-xs mb-4 transition-colors"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            All waitlists
          </Link>
          <div className="flex items-center gap-3">
            <h1
              className="font-display italic leading-none"
              style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 300, color: "var(--text)" }}
            >
              {waitlist.name}
            </h1>
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: waitlist.isActive ? "var(--green-subtle)" : "var(--surface)",
                color: waitlist.isActive ? "var(--green)" : "var(--muted)",
                border: `1px solid ${waitlist.isActive ? "var(--green)" : "var(--border)"}`,
                fontSize: 11,
              }}
            >
              {waitlist.isActive ? "Active" : "Paused"}
            </span>
          </div>
          <p className="text-xs mt-1.5" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            /w/{waitlist.slug}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ToggleActiveButton waitlistId={waitlist.id} isActive={waitlist.isActive} />
          <Link
            href={`/dashboard/waitlists/${waitlist.id}/edit`}
            className="inline-flex items-center gap-2 no-underline px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--surface-raised)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </Link>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 no-underline px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            View live
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total signups", value: totalMembers.toLocaleString() },
          { label: "Total referrals", value: totalReferrals.toLocaleString() },
          { label: "Top referrer", value: topReferrer ? `${topReferrer.referralCount} refs` : "—" },
          { label: "Referral rate", value: totalMembers > 0 ? `${Math.round((totalReferrals / totalMembers) * 100)}%` : "—" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5"
            style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-xs font-medium mb-3" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              {s.label}
            </p>
            <p className="font-display italic" style={{ fontSize: 32, fontWeight: 300, lineHeight: 1, color: "var(--text)" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Share link */}
      <div
        className="rounded-2xl p-6 mb-8 flex items-center justify-between flex-wrap gap-4"
        style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent-muted)" }}
      >
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
            Your waitlist link
          </p>
          <p className="text-sm font-medium" style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>
            {shareUrl}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={shareUrl} label="Copy link" />
          <a
            href={`https://twitter.com/intent/tweet?text=Join+the+${encodeURIComponent(waitlist.name)}+waitlist!&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 no-underline px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: "#000", color: "#fff" }}
          >
            Share on X
          </a>
        </div>
      </div>

      {/* Members table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display italic" style={{ fontSize: 20, fontWeight: 300, color: "var(--text)" }}>
            Subscribers
          </h2>
          <Link
            href={`/dashboard/subscribers?waitlist=${waitlist.id}`}
            className="text-xs no-underline font-medium flex items-center gap-1" style={{ color: "var(--accent)" }}
          >
            View all & export →
          </Link>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-[32px_1fr_1fr_80px_80px] gap-4 px-5 py-3 text-xs font-medium tracking-wide border-b"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <span>#</span>
            <span>Name</span>
            <span>Email</span>
            <span>Referrals</span>
            <span>Joined</span>
          </div>

          {waitlist.members.length === 0 ? (
            <div
              className="py-16 text-center"
              style={{ background: "var(--surface-raised)" }}
            >
              <p className="text-sm" style={{ color: "var(--muted)" }}>No signups yet. Share your link to get started.</p>
            </div>
          ) : (
            <div style={{ background: "var(--surface-raised)" }}>
              {waitlist.members.map((m: { id: Key | null | undefined; position: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; email: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; referralCount: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; createdAt: string | number | Date; }, i: number) => (
                <div
                  key={m.id}
                  className="grid grid-cols-[32px_1fr_1fr_80px_80px] gap-4 px-5 py-3.5 items-center border-b text-sm transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    ...(i === waitlist.members.length - 1 ? { borderBottom: "none" } : {}),
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                >
                  <span
                    className="font-medium"
                    style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}
                  >
                    {m.position}
                  </span>
                  <span className="font-medium truncate" style={{ color: "var(--text)" }}>{m.name}</span>
                  <span className="truncate" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                    {m.email}
                  </span>
                  <span>
                    {m.referralCount && (m as any).referralCount > 0 ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "var(--green-subtle)", color: "var(--green)", border: "1px solid var(--green)" }}
                      >
                        ✦ {m.referralCount}
                      </span>
                    ) : (
                      <span style={{ color: "var(--border)" }}>—</span>
                    )}
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {new Date(m.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalMembers > 50 && (
          <p className="text-xs mt-3 text-center" style={{ color: "var(--muted)" }}>
            Showing 50 of {totalMembers.toLocaleString()} subscribers.{" "}
            <Link href={`/dashboard/subscribers?waitlist=${waitlist.id}`} className="no-underline" style={{ color: "var(--accent)" }}>
              View all →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}