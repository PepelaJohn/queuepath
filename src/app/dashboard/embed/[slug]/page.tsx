// src/app/embed/[slug]/page.tsx
// Lightweight standalone page designed to be embedded via iframe.
// No nav, no layout wrappers — pure signup form only.

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EmbedForm } from "@/components/EmbedForm";

interface Props {
  params: { slug: string };
  searchParams: { ref?: string; theme?: "light" | "dark" };
}

export default async function EmbedPage({ params, searchParams }: Props) {
  const waitlist = await prisma.waitlist.findUnique({
    where: { slug: params.slug, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      accentColor: true,
      logoUrl: true,
      _count: { select: { members: true } },
    },
  });

  if (!waitlist) notFound();

  return (
    <EmbedForm
      waitlistId={waitlist.id}
      waitlistName={waitlist.name}
      description={waitlist.description ?? ""}
      accentColor={waitlist.accentColor}
      logoUrl={waitlist.logoUrl}
      memberCount={waitlist._count.members}
      slug={params.slug}
      refCode={searchParams.ref}
      theme={searchParams.theme ?? "light"}
    />
  );
}