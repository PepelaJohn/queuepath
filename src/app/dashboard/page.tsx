// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ActionComp from "@/components/ActionComp";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  
  const waitlists = await (prisma as any).waitlist.findMany({
    where: { founderId: session.user.id },
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalSignups = waitlists.reduce((sum:any, w:any) => sum + w._count.members, 0);
  const activeWaitlists = waitlists.filter((w:any) => w.isActive).length;

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto w-full">

      {/* Page header */}
      <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
        <div>
          <p
            className="text-xs tracking-[0.2em] uppercase mb-2"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
          >
            Dashboard
          </p>
          <h1
            className="font-display italic leading-none"
            style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, color: "var(--text)" }}
          >
            Good to see you, {firstName}.
          </h1>
        </div>

        <Link
          href="/dashboard/waitlists/new"
          className="inline-flex items-center gap-2 no-underline px-5 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{
            background: "var(--accent)",
            boxShadow: "0 4px 16px color-mix(in srgb, var(--accent) 25%, transparent)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New waitlist
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total signups", value: totalSignups.toLocaleString(), icon: "👥" },
          { label: "Active waitlists", value: activeWaitlists, icon: "🚀" },
          { label: "Total waitlists", value: waitlists.length, icon: "📋" },
          { label: "Referral rate", value: "—", icon: "🔗", muted: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium tracking-wide" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                {stat.label}
              </p>
              <span className="text-base">{stat.icon}</span>
            </div>
            <p
              className="font-display italic"
              style={{
                fontSize: 36,
                fontWeight: 300,
                lineHeight: 1,
                color: stat.muted ? "var(--muted)" : "var(--text)",
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Waitlists section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-display italic"
            style={{ fontSize: 22, fontWeight: 300, color: "var(--text)" }}
          >
            Your waitlists
          </h2>
          {waitlists.length > 0 && (
            <Link
              href="/dashboard/waitlists/new"
              className="text-xs no-underline font-medium flex items-center gap-1.5 transition-colors"
              style={{ color: "var(--accent)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New
            </Link>
          )}
        </div>

        {waitlists.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {waitlists.map((w:any) => (
              <WaitlistRow key={w.id} waitlist={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl flex flex-col items-center justify-center py-20 text-center"
      style={{
        background: "var(--surface-raised)",
        border: "1px dashed var(--border-hover)",
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
        style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent-muted)" }}
      >
        🚀
      </div>
      <h3
        className="font-display italic mb-2"
        style={{ fontSize: 26, fontWeight: 300, color: "var(--text)" }}
      >
        No waitlists yet.
      </h3>
      <p className="text-sm mb-7 max-w-xs" style={{ color: "var(--muted)" }}>
        Create your first waitlist and start collecting signups in minutes.
      </p>
      <Link
        href="/dashboard/waitlists/new"
        className="inline-flex items-center gap-2 no-underline px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
        style={{ background: "var(--accent)" }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Create my first waitlist
      </Link>
    </div>
  );
}

type WaitlistWithCount = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  accentColor: string;
  isActive: boolean;
  createdAt: Date;
  _count: { members: number };
};

function WaitlistRow({ waitlist: w }: { waitlist: WaitlistWithCount }) {
  return (
    <div
      className="flex items-center gap-5 p-5 rounded-2xl group transition-all hover:-translate-y-0.5"
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Logo / color blob */}
      <div
        className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-lg overflow-hidden"
        style={{ background: w.logoUrl ? "transparent" : w.accentColor + "22", border: `1px solid ${w.accentColor}44` }}
      >
        {w.logoUrl ? (
          <Image src={w.logoUrl} alt={w.name} width={44} height={44} className="object-cover" />
        ) : (
          <span style={{ color: w.accentColor }}>🚀</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-0.5">
          <p className="font-medium text-sm truncate" style={{ color: "var(--text)" }}>{w.name}</p>
          <span
            className="text-xs px-2 py-0.5 rounded-full shrink-0"
            style={{
              background: w.isActive ? "var(--green-subtle)" : "var(--surface)",
              color: w.isActive ? "var(--green)" : "var(--muted)",
              border: `1px solid ${w.isActive ? "var(--green)" : "var(--border)"}`,
              opacity: w.isActive ? 1 : 0.7,
              fontSize: 11,
            }}
          >
            {w.isActive ? "Active" : "Paused"}
          </span>
        </div>
        <p className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          /w/{w.slug}
        </p>
      </div>

      {/* Signups */}
      <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
        <p
          className="font-display italic"
          style={{ fontSize: 26, fontWeight: 300, lineHeight: 1, color: "var(--text)" }}
        >
          {w._count.members.toLocaleString()}
        </p>
        <p className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>signups</p>
      </div>

      {/* Actions */}
      <ActionComp {...w} />
    </div>
  );
}


