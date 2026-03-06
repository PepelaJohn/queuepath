// src/app/api/analytics/route.ts
// Returns all analytics data for a given waitlist + date range

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const waitlistId = searchParams.get("waitlistId");
  const range = searchParams.get("range") ?? "30"; // days

  if (!waitlistId) return NextResponse.json({ error: "waitlistId required" }, { status: 400 });

  // Ownership check
  const waitlist = await prisma.waitlist.findUnique({
    where: { id: waitlistId, founderId: session.user.id },
    select: { id: true, name: true, slug: true, createdAt: true },
  });
  if (!waitlist) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const days = Math.min(parseInt(range), 90);
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  // ── Signups per day ──
  const members = await prisma.waitlistMember.findMany({
    where: { waitlistId, createdAt: { gte: since } },
    select: { createdAt: true, referredById: true, referralCount: true },
    orderBy: { createdAt: "asc" },
  });

  // Build daily buckets
  const buckets: Record<string, { date: string; signups: number; referrals: number }> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { date: key, signups: 0, referrals: 0 };
  }

  for (const m of members) {
    const key = m.createdAt.toISOString().slice(0, 10);
    if (buckets[key]) {
      buckets[key].signups++;
      if (m.referredById) buckets[key].referrals++;
    }
  }

  const dailySignups = Object.values(buckets);

  // ── Total stats ──
  const totalMembers = await prisma.waitlistMember.count({ where: { waitlistId } });
  const totalReferrals = await prisma.referralEvent.count({ where: { waitlistId } });
  const organicCount = totalMembers - totalReferrals;
  const referralRate = totalMembers > 0 ? Math.round((totalReferrals / totalMembers) * 100) : 0;

  // ── Period stats ──
  const periodSignups = members.length;
  const periodReferrals = members.filter((m) => m.referredById).length;

  // Growth vs previous period
  const prevSince = new Date(since);
  prevSince.setDate(prevSince.getDate() - days);
  const prevCount = await prisma.waitlistMember.count({
    where: { waitlistId, createdAt: { gte: prevSince, lt: since } },
  });
  const growthPct =
    prevCount > 0
      ? Math.round(((periodSignups - prevCount) / prevCount) * 100)
      : periodSignups > 0
      ? 100
      : 0;

  // ── Top referrers ──
  const topReferrers = await prisma.waitlistMember.findMany({
    where: { waitlistId, referralCount: { gt: 0 } },
    orderBy: { referralCount: "desc" },
    take: 10,
    select: { id: true, name: true, email: true, referralCount: true, position: true, createdAt: true },
  });

  // ── Signups by day of week (heatmap data) ──
  const allMembers = await prisma.waitlistMember.findMany({
    where: { waitlistId },
    select: { createdAt: true },
  });

  const byDayOfWeek = Array(7).fill(0) as number[];
  const byHour = Array(24).fill(0) as number[];
  for (const m of allMembers) {
    byDayOfWeek[m.createdAt.getDay()]++;
    byHour[m.createdAt.getHours()]++;
  }

  // ── Cumulative growth curve ──
  const allMembersSorted = await prisma.waitlistMember.findMany({
    where: { waitlistId },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
    take: 500,
  });

  let cumulative = 0;
  const growthCurve = allMembersSorted.map((m) => ({
    date: m.createdAt.toISOString().slice(0, 10),
    total: ++cumulative,
  }));

  return NextResponse.json({
    waitlist,
    stats: {
      totalMembers,
      totalReferrals,
      organicCount,
      referralRate,
      periodSignups,
      periodReferrals,
      growthPct,
    },
    dailySignups,
    topReferrers,
    byDayOfWeek,
    byHour,
    growthCurve,
  });
}