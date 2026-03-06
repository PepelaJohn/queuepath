// src/app/api/waitlists/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(300).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  isActive: z.boolean().optional(),
  logoUrl: z.string().url().optional().nullable(),
});


function zodToResponse(error: z.ZodError) {
  const flattened = z.flattenError(error);

  const firstFieldKey = Object.keys(flattened.fieldErrors)[0];

  const firstFieldMessage =
    (firstFieldKey && (flattened).fieldErrors[firstFieldKey as keyof typeof flattened.fieldErrors]?.[0]) || undefined;

  const firstMessage =
    firstFieldMessage || flattened.formErrors[0] || "Invalid request body";

  return {
    error: firstMessage,
    formErrors: flattened.formErrors,
    fieldErrors: flattened.fieldErrors,
  };
}

async function getOwned(id: string, founderId: string) {
  return prisma.waitlist.findUnique({ where: { id, founderId } });
}

export async function PATCH(req: NextRequest, { params }:{ params: Promise<{ id: string }> }) {
  console.log("params", params);
  const id = (await params).id;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const waitlist = await getOwned(id, session.user.id);
  if (!waitlist) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    const payload = zodToResponse(parsed.error);
    return NextResponse.json(payload, { status: 400 });
  }

  const updated = await prisma.waitlist.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const waitlist = await getOwned((await params).id, session.user.id);
  if (!waitlist) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.waitlist.delete({ where: { id: (await params).id } });
  return NextResponse.json({ success: true });
}