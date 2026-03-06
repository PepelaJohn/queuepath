// src/app/w/[slug]/page.tsx
// Public waitlist landing page — accessible by anyone at /w/[slug]
// This is the page founders share with their audience

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EmbedForm } from "@/components/EmbedForm";
import Link from "next/link";

interface Props {
  params: { slug: string };
  searchParams: { ref?: string };
}

export async function generateMetadata({ params }: Props) {
  const waitlist = await prisma.waitlist.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true },
  });
  if (!waitlist) return { title: "Not Found" };
  return {
    title: `${waitlist.name} — Join the waitlist`,
    description: waitlist.description ?? `Join the ${waitlist.name} waitlist.`,
  };
}

export default async function WaitlistPage({ params, searchParams }: Props) {
  const waitlist = await prisma.waitlist.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      description: true,
      accentColor: true,
      logoUrl: true,
      isActive: true,
      _count: { select: { members: true } },
    },
  });

  if (!waitlist) notFound();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.35,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16">

        {/* Waitlist card */}
        <div
          className="w-full max-w-md rounded-3xl overflow-hidden"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.08)",
          }}
        >
          {/* Accent bar */}
          <div
            className="h-1 w-full"
            style={{ background: waitlist.accentColor }}
          />

          <div className="p-8">
            {/* Logo */}
            {waitlist.logoUrl && (
              <div className="flex justify-center mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={waitlist.logoUrl}
                  alt={waitlist.name}
                  className="w-16 h-16 rounded-2xl object-cover"
                  style={{ border: "1px solid var(--border)" }}
                />
              </div>
            )}

            {/* Pill — member count */}
            <div className="flex justify-center mb-5">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: waitlist.accentColor + "18",
                  border: `1px solid ${waitlist.accentColor}44`,
                  color: waitlist.accentColor,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "currentColor",
                    animation: "pulse 2s infinite",
                  }}
                />
                {waitlist.isActive
                  ? `${waitlist._count.members.toLocaleString()} people joined`
                  : "Waitlist paused"}
              </span>
            </div>

            {/* Heading */}
            <h1
              className="font-display italic text-center leading-tight mb-3"
              style={{
                fontSize: "clamp(28px, 6vw, 40px)",
                fontWeight: 300,
                color: "var(--text)",
                letterSpacing: "-0.01em",
              }}
            >
              {waitlist.name}
            </h1>

            {waitlist.description && (
              <p
                className="text-center text-sm leading-relaxed mb-8"
                style={{ color: "var(--muted)" }}
              >
                {waitlist.description}
              </p>
            )}

            {/* Form or paused state */}
            {waitlist.isActive ? (
              <EmbedForm
                waitlistId={waitlist.id}
                waitlistName={waitlist.name}
                description=""
                accentColor={waitlist.accentColor}
                logoUrl={null}
                memberCount={waitlist._count.members}
                slug={params.slug}
                refCode={searchParams.ref}
                theme="light"
                compact
              />
            ) : (
              <div
                className="text-center py-8 rounded-2xl"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: "var(--text)" }}
                >
                  This waitlist is currently paused.
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Check back soon.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Powered by */}
        <div className="mt-8 flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 no-underline"
            style={{ color: "var(--muted)" }}
          >
            <div
              className="w-4 h-4 rounded flex items-center justify-center text-white"
              style={{ background: "var(--accent)", fontSize: 9, fontWeight: 700 }}
            >
              Q
            </div>
            <span
              className="text-xs"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Powered by{" "}
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>
                QueuePath
              </span>
            </span>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}