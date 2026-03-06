// src/app/api/subscribers/export/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const waitlistId = searchParams.get("waitlistId");
  const search = searchParams.get("search") ?? "";

  if (!waitlistId) {
    return NextResponse.json({ error: "waitlistId is required" }, { status: 400 });
  }

  // Verify ownership
  const waitlist = await prisma.waitlist.findUnique({
    where: { id: waitlistId, founderId: session.user.id },
    select: { id: true, name: true, slug: true },
  });

  if (!waitlist) {
    return NextResponse.json({ error: "Waitlist not found" }, { status: 404 });
  }

  const where = {
    waitlistId,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const members = await prisma.waitlistMember.findMany({
    where,
    orderBy: { position: "asc" },
    select: {
      position: true,
      name: true,
      email: true,
      referralCount: true,
      referralCode: true,
      createdAt: true,
      referredBy: { select: { name: true, email: true } },
    },
  });

  // Build CSV
  const headers = [
    "Position",
    "Name",
    "Email",
    "Referrals",
    "Referred By Name",
    "Referred By Email",
    "Referral Code",
    "Joined At",
  ];

  function escapeCsv(val: string | number | null | undefined): string {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const rows = members.map((m) =>
    [
      m.position,
      m.name,
      m.email,
      m.referralCount,
      m.referredBy?.name ?? "",
      m.referredBy?.email ?? "",
      m.referralCode,
      m.createdAt.toISOString(),
    ]
      .map(escapeCsv)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${waitlist.slug}-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}