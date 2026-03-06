// src/app/api/waitlist/join/route.ts
// Updated to enforce per-plan signup limits via planEnforcement

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendWelcomeEmail } from "@/lib/email";
import { checkSignupLimit } from "@/lib/planEnforcement";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  honeypot: z.string().max(0, "Bot detected"),
  waitlistId: z.string(),
  refCode: z.string().optional(),
});

const REFERRAL_BOOST = 5;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { name, email, waitlistId, refCode } = parsed.data;
  const normalizedEmail = normalizeEmail(email);

  const waitlist = await prisma.waitlist.findUnique({
    where: { id: waitlistId, isActive: true },
  });
  if (!waitlist) {
    return NextResponse.json({ error: "Waitlist not found." }, { status: 404 });
  }

  // ── Plan enforcement: check signup limit ──
  const limitCheck = await checkSignupLimit(waitlistId);
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: "This waitlist is currently full. Check back later." },
      { status: 403 }
    );
  }

  // Duplicate check
  const existing = await prisma.waitlistMember.findUnique({
    where: { waitlistId_email: { waitlistId, email: normalizedEmail } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "This email is already on the waitlist." },
      { status: 409 }
    );
  }

  // Referrer lookup
  let referrer: { id: string; position: number; referralCount: number } | null = null;
  if (refCode) {
    referrer = await prisma.waitlistMember.findUnique({
      where: { referralCode: refCode },
      select: { id: true, position: true, referralCount: true },
    });
  }

  const memberCount = await prisma.waitlistMember.count({ where: { waitlistId } });
  const basePosition = memberCount + 1;

  const member = await prisma.$transaction(async (tx) => {
    const newMember = await tx.waitlistMember.create({
      data: {
        name,
        email: normalizedEmail,
        waitlistId,
        referredById: referrer?.id,
        position: basePosition,
        ipAddress: ip,
      },
    });

    if (referrer) {
      const newPosition = Math.max(1, referrer.position - REFERRAL_BOOST);
      await tx.waitlistMember.update({
        where: { id: referrer.id },
        data: {
          position: newPosition,
          referralCount: { increment: 1 },
        },
      });

      await tx.referralEvent.create({
        data: {
          referrerId: referrer.id,
          refereeId: newMember.id,
          waitlistId,
        },
      });
    }

    return newMember;
  });

  const referralLink = `${process.env.NEXTAUTH_URL}/w/${waitlist.slug}?ref=${member.referralCode}`;
  sendWelcomeEmail({
    to: normalizedEmail,
    name,
    waitlistName: waitlist.name,
    position: basePosition,
    referralLink,
  }).catch(console.error);

  return NextResponse.json({
    position: basePosition,
    referralCode: member.referralCode,
  });
}