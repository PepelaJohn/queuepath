// src/app/api/billing/webhook/route.ts
// Handles all Paddle subscription lifecycle events
// Set your webhook URL in Paddle dashboard to: https://yourdomain.com/api/billing/webhook

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaddleWebhook, mapPaddleStatus } from "@/lib/paddle";

// Map Paddle Price IDs → our plan names
function priceIdToPlan(priceId: string): string {
  const map: Record<string, string> = {
    [process.env.PADDLE_PRICE_STARTER ?? ""]: "STARTER",
    [process.env.PADDLE_PRICE_GROWTH ?? ""]: "GROWTH",
    [process.env.PADDLE_PRICE_PRO ?? ""]: "PRO",
  };
  return map[priceId] ?? "FREE";
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature") ?? "";

  // Verify webhook authenticity
  const valid = await verifyPaddleWebhook(rawBody, signature);
  if (!valid) {
    console.error("[Paddle Webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event_type as string;
  const data = event.data as Record<string, unknown>;

  console.log(`[Paddle Webhook] ${eventType}`);

  try {
    switch (eventType) {

      // ── Subscription created (first payment succeeded) ──
      case "subscription.created":
      case "subscription.activated": {
        const customData = data.custom_data as Record<string, string> | null;
        const founderId = customData?.founder_id;
        if (!founderId) break;

        const items = data.items as Array<{ price: { id: string } }>;
        const priceId = items?.[0]?.price?.id ?? "";
        const plan = priceIdToPlan(priceId);

        const currentPeriodEnd = data.current_billing_period
          ? new Date((data.current_billing_period as Record<string, string>).ends_at)
          : null;

        await prisma.subscription.upsert({
          where: { founderId },
          create: {
            founderId,
            plan: plan as never,
            paddleSubId: data.id as string,
            paddleCustomerId: data.customer_id as string,
            status: mapPaddleStatus(data.status as string),
            currentPeriodEnd,
          },
          update: {
            plan: plan as never,
            paddleSubId: data.id as string,
            paddleCustomerId: data.customer_id as string,
            status: mapPaddleStatus(data.status as string),
            currentPeriodEnd,
          },
        });
        break;
      }

      // ── Subscription updated (plan change, renewal) ──
      case "subscription.updated": {
        const subId = data.id as string;

        const items = data.items as Array<{ price: { id: string } }>;
        const priceId = items?.[0]?.price?.id ?? "";
        const plan = priceIdToPlan(priceId);

        const currentPeriodEnd = data.current_billing_period
          ? new Date((data.current_billing_period as Record<string, string>).ends_at)
          : null;

        await prisma.subscription.updateMany({
          where: { paddleSubId: subId },
          data: {
            plan: plan as never,
            status: mapPaddleStatus(data.status as string),
            currentPeriodEnd,
          },
        });
        break;
      }

      // ── Subscription cancelled ──
      case "subscription.canceled":
      case "subscription.cancelled": {
        const subId = data.id as string;
        await prisma.subscription.updateMany({
          where: { paddleSubId: subId },
          data: {
            plan: "FREE",
            status: "canceled",
            currentPeriodEnd: null,
          },
        });
        break;
      }

      // ── Payment failed — mark past due ──
      case "subscription.payment_failed": {
        const subId = data.subscription_id as string;
        await prisma.subscription.updateMany({
          where: { paddleSubId: subId },
          data: { status: "past_due" },
        });
        break;
      }

      // ── Subscription paused ──
      case "subscription.paused": {
        const subId = data.id as string;
        await prisma.subscription.updateMany({
          where: { paddleSubId: subId },
          data: { status: "paused", plan: "FREE" },
        });
        break;
      }

      // ── Subscription resumed ──
      case "subscription.resumed": {
        const subId = data.id as string;
        const items = data.items as Array<{ price: { id: string } }>;
        const priceId = items?.[0]?.price?.id ?? "";
        const plan = priceIdToPlan(priceId);

        await prisma.subscription.updateMany({
          where: { paddleSubId: subId },
          data: { plan: plan as never, status: "active" },
        });
        break;
      }

      default:
        console.log(`[Paddle Webhook] Unhandled event: ${eventType}`);
    }
  } catch (err) {
    console.error("[Paddle Webhook] DB error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}