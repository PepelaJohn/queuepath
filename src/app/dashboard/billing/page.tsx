// src/app/dashboard/billing/page.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFounderPlan } from "@/lib/planEnforcement";
import { prisma } from "@/lib/prisma";
import { BillingClient } from "@/components/dashboard/BillingClient";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [founderPlan, waitlistCount] = await Promise.all([
    getFounderPlan(session.user.id),
    prisma.waitlist.count({ where: { founderId: session.user.id } }),
  ]);

  const totalSignups = await prisma.waitlistMember.count({
    where: { waitlist: { founderId: session.user.id } },
  });

  return (
    <BillingClient
      currentPlanId={founderPlan.planId}
      currentStatus={founderPlan.status}
      currentPeriodEnd={founderPlan.currentPeriodEnd?.toISOString() ?? null}
      hasSubscription={founderPlan.hasSubscription}
      waitlistCount={waitlistCount}
      totalSignups={totalSignups}
    />
  );
}