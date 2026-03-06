// src/app/dashboard/analytics/page.tsx

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AnalyticsClient } from "@/components/dashboard/AnalyticsClient";

interface Props {
  searchParams: { waitlist?: string; range?: string };
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const waitlists = await prisma.waitlist.findMany({
    where: { founderId: session.user.id },
    select: { id: true, name: true, slug: true, accentColor: true },
    orderBy: { createdAt: "desc" },
  });

  const selectedId = searchParams.waitlist ?? waitlists[0]?.id ?? null;
  const range = searchParams.range ?? "30";

  return (
    <AnalyticsClient
      waitlists={waitlists}
      selectedWaitlistId={selectedId}
      initialRange={range}
    />
  );
}