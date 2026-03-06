
// src/app/api/billing/portal/route.ts
// Returns the Paddle customer portal URL so founders can
// manage their subscription, update payment method, view invoices

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { founderId: session.user.id },
    select: { paddleCustomerId: true, paddleSubId: true },
  });

  if (!subscription?.paddleCustomerId) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
  }

  // Fetch customer portal URL from Paddle API
  const response = await fetch(
    `https://api.paddle.com/customers/${subscription.paddleCustomerId}/portal-sessions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription_ids: subscription.paddleSubId
          ? [subscription.paddleSubId]
          : undefined,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    console.error("[Paddle Portal] Error:", err);
    return NextResponse.json({ error: "Could not create portal session" }, { status: 502 });
  }

  const data = await response.json();
  const portalUrl = data?.data?.urls?.general?.overview;

  if (!portalUrl) {
    return NextResponse.json({ error: "Portal URL not returned" }, { status: 502 });
  }

  return NextResponse.json({ url: portalUrl });
}