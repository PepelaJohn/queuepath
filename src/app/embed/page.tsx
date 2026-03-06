// src/app/dashboard/embed/page.tsx

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EmbedDashboardClient } from "@/components/dashboard/EmbedDashboardClient";

interface Props {
  searchParams: { waitlist?: string };
}

export default async function EmbedPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const waitlists = await prisma.waitlist.findMany({
    where: { founderId: session.user.id },
    select: { id: true, name: true, slug: true, accentColor: true, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const selectedId = searchParams.waitlist ?? waitlists[0]?.id ?? null;
  const selectedWaitlist = waitlists.find((w) => w.id === selectedId) ?? waitlists[0] ?? null;

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://queuepath.io";

  return (
    <EmbedDashboardClient
      waitlists={waitlists}
      selectedWaitlist={selectedWaitlist}
      baseUrl={baseUrl}
    />
  );
}