// src/app/api/waitlists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and dashes"),
  description: z.string().max(300).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#2351f5"),
});

// Plan limits
const PLAN_LIMITS: Record<string, number> = {
  FREE: 1,
  STARTER: 3,
  GROWTH: 10,
  PRO: Infinity,
};

// Helper: convert ZodError -> consistent API response shape
function zodToResponse(error: z.ZodError) {
  const flattened = z.flattenError(error);

  const firstFieldKey = Object.keys(flattened.fieldErrors)[0];

  const firstFieldMessage =
    (firstFieldKey && flattened.fieldErrors[firstFieldKey as keyof typeof flattened.fieldErrors]?.[0]) || undefined;

  const firstMessage =
    firstFieldMessage || flattened.formErrors[0] || "Invalid request body";

  return {
    error: firstMessage,
    formErrors: flattened.formErrors,
    fieldErrors: flattened.fieldErrors,
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    const payload = zodToResponse(parsed.error);
    return NextResponse.json(payload, { status: 400 });
  }

  const { name, slug, description, accentColor } = parsed.data;

  const subscription = await prisma.subscription.findUnique({
    where: { founderId: session.user.id },
  });

  const plan = subscription?.plan ?? "FREE";
  const limit = PLAN_LIMITS[plan] ?? 1;

  const count = await prisma.waitlist.count({
    where: { founderId: session.user.id },
  });

  if (count >= limit) {
    return NextResponse.json(
      {
        error: `Your ${plan} plan allows up to ${limit} waitlist${limit === 1 ? "" : "s"}. Upgrade to create more.`,
      },
      { status: 403 }
    );
  }

  const existing = await prisma.waitlist.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "This slug is already taken. Try a different one." },
      { status: 409 }
    );
  }

  const waitlist = await prisma.waitlist.create({
    data: { name, slug, description, accentColor, founderId: session.user.id },
  });

  return NextResponse.json(waitlist, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const waitlists = await prisma.waitlist.findMany({
    where: { founderId: session.user.id },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(waitlists);
}