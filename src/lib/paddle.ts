// src/lib/paddle.ts
// Single source of truth for all Paddle plan config

export const PLANS = {
    FREE: {
      id: "FREE",
      name: "Free",
      price: 0,
      interval: null,
      paddlePriceId: null,
      waitlistLimit: 1,
      signupLimit: 50,
      features: [
        "1 waitlist",
        "Up to 50 signups",
        "Basic analytics",
        "QueuePath branding",
      ],
    },
    STARTER: {
      id: "STARTER",
      name: "Starter",
      price: 5,
      interval: "month",
      paddlePriceId: process.env.PADDLE_PRICE_STARTER ?? "",
      waitlistLimit: 3,
      signupLimit: 1_000,
      features: [
        "3 waitlists",
        "Up to 1,000 signups",
        "Remove branding",
        "CSV export",
      ],
    },
    GROWTH: {
      id: "GROWTH",
      name: "Growth",
      price: 15,
      interval: "month",
      paddlePriceId: process.env.PADDLE_PRICE_GROWTH ?? "",
      waitlistLimit: 10,
      signupLimit: 10_000,
      popular: true,
      features: [
        "10 waitlists",
        "Up to 10,000 signups",
        "Advanced analytics",
        "Referral leaderboard",
        "Priority support",
      ],
    },
    PRO: {
      id: "PRO",
      name: "Pro",
      price: 40,
      interval: "month",
      paddlePriceId: process.env.PADDLE_PRICE_PRO ?? "",
      waitlistLimit: Infinity,
      signupLimit: Infinity,
      features: [
        "Unlimited waitlists",
        "Unlimited signups",
        "White-label",
        "Advanced analytics",
        "Webhook integrations",
        "Dedicated support",
      ],
    },
  } as const;
  
  export type PlanId = keyof typeof PLANS;
  
  export function getPlan(planId: string): (typeof PLANS)[PlanId] {
    return PLANS[planId as PlanId] ?? PLANS.FREE;
  }
  
  // Verify Paddle webhook signature
  export async function verifyPaddleWebhook(
    rawBody: string,
    signature: string
  ): Promise<boolean> {
    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!secret) return false;
  
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );
  
      // Paddle sends: ts=timestamp;h1=hash
      const parts = signature.split(";");
      const tsPart = parts.find((p) => p.startsWith("ts="));
      const h1Part = parts.find((p) => p.startsWith("h1="));
      if (!tsPart || !h1Part) return false;
  
      const ts = tsPart.replace("ts=", "");
      const h1 = h1Part.replace("h1=", "");
      const signedPayload = `${ts}:${rawBody}`;
  
      const sigBytes = Uint8Array.from(
        h1.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
      );
  
      return crypto.subtle.verify(
        "HMAC",
        key,
        sigBytes,
        encoder.encode(signedPayload)
      );
    } catch {
      return false;
    }
  }
  
  // Map Paddle subscription status to our DB status
  export function mapPaddleStatus(status: string): string {
    const map: Record<string, string> = {
      active: "active",
      trialing: "trialing",
      past_due: "past_due",
      paused: "paused",
      canceled: "canceled",
      cancelled: "canceled",
    };
    return map[status] ?? status;
  }