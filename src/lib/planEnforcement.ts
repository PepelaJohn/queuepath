// src/lib/planEnforcement.ts
// Reusable helpers to enforce plan limits across API routes

import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/paddle";

export interface LimitCheck {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}

/**
 * Check if a founder can create another waitlist based on their plan.
 */
export async function checkWaitlistLimit(founderId: string): Promise<LimitCheck> {
  const subscription = await prisma.subscription.findUnique({
    where: { founderId },
    select: { plan: true, status: true },
  });

  const planId = subscription?.status === "active" || subscription?.status === "trialing"
    ? (subscription.plan as string)
    : "FREE";

  const plan = getPlan(planId);
  const current = await prisma.waitlist.count({ where: { founderId } });

  if (current >= plan.waitlistLimit) {
    return {
      allowed: false,
      reason: `Your ${plan.name} plan allows up to ${plan.waitlistLimit} waitlist${plan.waitlistLimit === 1 ? "" : "s"}. Upgrade to create more.`,
      limit: plan.waitlistLimit,
      current,
    };
  }

  return { allowed: true, limit: plan.waitlistLimit, current };
}

/**
 * Check if a waitlist can accept new signups based on the founder's plan.
 */
export async function checkSignupLimit(waitlistId: string): Promise<LimitCheck> {
  const waitlist = await prisma.waitlist.findUnique({
    where: { id: waitlistId },
    select: {
      founderId: true,
      _count: { select: { members: true } },
    },
  });

  if (!waitlist) return { allowed: false, reason: "Waitlist not found" };

  const subscription = await prisma.subscription.findUnique({
    where: { founderId: waitlist.founderId },
    select: { plan: true, status: true },
  });

  const planId = subscription?.status === "active" || subscription?.status === "trialing"
    ? (subscription.plan as string)
    : "FREE";

  const plan = getPlan(planId);
  const current = waitlist._count.members;

  if (current >= plan.signupLimit) {
    return {
      allowed: false,
      reason: `This waitlist has reached its signup limit.`,
      limit: plan.signupLimit,
      current,
    };
  }

  return { allowed: true, limit: plan.signupLimit, current };
}

/**
 * Get a founder's current active plan.
 */
export async function getFounderPlan(founderId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { founderId },
    select: { plan: true, status: true, currentPeriodEnd: true, paddleSubId: true },
  });

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";

  const planId = isActive ? (subscription!.plan as string) : "FREE";
  const plan = getPlan(planId);

  return {
    plan,
    planId,
    status: subscription?.status ?? "active",
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    hasSubscription: !!subscription?.paddleSubId,
    isActive,
  };
}