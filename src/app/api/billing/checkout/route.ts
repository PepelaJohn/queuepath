// src/app/api/billing/checkout/route.ts
// Creates a Paddle checkout URL for a given plan
// Paddle Billing v2 uses client-side overlay — this returns the priceId
// so the frontend can open Paddle.js Checkout directly

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, getPlan } from "@/lib/paddle";
import { z } from "zod";

const schema = z.object({
  planId: z.enum(["STARTER", "GROWTH", "PRO"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { planId } = parsed.data;
  const plan = PLANS[planId];

  if (!plan.paddlePriceId) {
    return NextResponse.json({ error: "Plan price not configured" }, { status: 500 });
  }

  // Fetch founder email for pre-filling checkout
  const founder = await prisma.founder.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true },
  });

  if (!founder) {
    return NextResponse.json({ error: "Founder not found" }, { status: 404 });
  }

  // Check current subscription — prevent downgrade via checkout
  const subscription = await prisma.subscription.findUnique({
    where: { founderId: session.user.id },
  });

  if (subscription?.plan === planId && subscription?.status === "active") {
    return NextResponse.json({ error: "You are already on this plan" }, { status: 409 });
  }

  // Return checkout config for Paddle.js client-side overlay
  // The founder_id in custom_data is picked up by the webhook
  return NextResponse.json({
    priceId: plan.paddlePriceId,
    customData: {
      founder_id: session.user.id,
    },
    customerEmail: founder.email,
    customerName: founder.name ?? undefined,
    successUrl: `${process.env.NEXTAUTH_URL}/dashboard/billing?success=1`,
    cancelUrl: `${process.env.NEXTAUTH_URL}/dashboard/billing`,
  });
}