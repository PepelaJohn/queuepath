// src/app/dashboard/waitlists/[id]/edit/page.tsx

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EditWaitlistForm } from "@/components/dashboard/EditWaitlistForm"; 

interface Props {
  params: { id: string };
}

export default async function EditWaitlistPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const waitlist = await prisma.waitlist.findUnique({
    where: { id: params.id, founderId: session.user.id },
  });

  if (!waitlist) notFound();

  return <EditWaitlistForm waitlist={waitlist} />;
}