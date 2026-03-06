// src/app/dashboard/subscribers/page.tsx

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SubscribersClient } from "@/components/dashboard/SubscribersClient";

interface Props {
  searchParams: {
    waitlist?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

export default async function SubscribersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch all founder's waitlists for the filter dropdown
  const waitlists = await prisma.waitlist.findMany({
    where: { founderId: session.user.id },
    select: { id: true, name: true, slug: true, accentColor: true },
    orderBy: { createdAt: "desc" },
  });

  const selectedWaitlistId = searchParams.waitlist ?? waitlists[0]?.id ?? null;
  const search = searchParams.search ?? "";
  const sort = (searchParams.sort as "position" | "referrals" | "date") ?? "position";
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const pageSize = 25;

  let members: {
    id: string;
    name: string;
    email: string;
    position: number;
    referralCount: number;
    referralCode: string;
    createdAt: Date;
    referredBy: { name: string; email: string } | null;
  }[] = [];

  let totalCount = 0;

  if (selectedWaitlistId) {
    // Verify ownership
    const owned = waitlists.find((w) => w.id === selectedWaitlistId);
    if (owned) {
      const where = {
        waitlistId: selectedWaitlistId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };

      totalCount = await prisma.waitlistMember.count({ where });

      const orderBy =
        sort === "referrals"
          ? { referralCount: "desc" as const }
          : sort === "date"
          ? { createdAt: "desc" as const }
          : { position: "asc" as const };

      members = await prisma.waitlistMember.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          position: true,
          referralCount: true,
          referralCode: true,
          createdAt: true,
          referredBy: { select: { name: true, email: true } },
        },
      });
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <SubscribersClient
      waitlists={waitlists}
      members={members}
      selectedWaitlistId={selectedWaitlistId}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={page}
      currentSearch={search}
      currentSort={sort}
    />
  );
}