// src/components/dashboard/BillingClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PLANS } from "@/lib/paddle";
import type { PlanId } from "@/lib/paddle";

// Extend window for Paddle.js
declare global {
  interface Window {
    Paddle?: {
      Setup: (opts: { token: string; eventCallback?: (e: unknown) => void }) => void;
      Checkout: {
        open: (opts: {
          items: Array<{ priceId: string; quantity: number }>;
          customer?: { email?: string };
          customData?: Record<string, string>;
          settings?: { successUrl?: string };
        }) => void;
      };
    };
  }
}

interface Props {
  currentPlanId: string;
  currentStatus: string;
  currentPeriodEnd: string | null;
  hasSubscription: boolean;
  waitlistCount: number;
  totalSignups: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: "Active",    color: "var(--green)",  bg: "var(--green-subtle)" },
  trialing: { label: "Trial",     color: "var(--accent)", bg: "var(--accent-subtle)" },
  past_due: { label: "Past due",  color: "#dc2626",       bg: "#fff1f0" },
  paused:   { label: "Paused",    color: "var(--amber)",  bg: "#fff8ee" },
  canceled: { label: "Cancelled", color: "var(--muted)",  bg: "var(--surface)" },
};

export function BillingClient({
  currentPlanId,
  currentStatus,
  currentPeriodEnd,
  hasSubscription,
  waitlistCount,
  totalSignups,
}: Props) {
  const searchParams = useSearchParams();
  const justUpgraded = searchParams.get("success") === "1";

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [paddleReady, setPaddleReady] = useState(false);
  const [error, setError] = useState("");

  const currentPlan = PLANS[currentPlanId as PlanId] ?? PLANS.FREE;
  const statusInfo = STATUS_LABELS[currentStatus] ?? STATUS_LABELS.active;

  // Load Paddle.js
  useEffect(() => {
    if (window.Paddle) { setPaddleReady(true); return; }
    const script = document.createElement("script");
    script.src = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox"
      ? "https://cdn.paddle.com/paddle/v2/paddle.js"
      : "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      window.Paddle?.Setup({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "",
        eventCallback: (e: unknown) => {
          const event = e as { name: string };
          if (event.name === "checkout.completed") {
            // Optimistically show success — webhook will update DB
            setTimeout(() => window.location.href = "/dashboard/billing?success=1", 1500);
          }
        },
      });
      setPaddleReady(true);
    };
    document.head.appendChild(script);
  }, []);

  async function handleUpgrade(planId: string) {
    setCheckoutLoading(planId);
    setError("");

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      if (!window.Paddle || !paddleReady) {
        throw new Error("Payment system not loaded. Please refresh and try again.");
      }

      window.Paddle.Checkout.open({
        items: [{ priceId: data.priceId, quantity: 1 }],
        customer: { email: data.customerEmail },
        customData: data.customData,
        settings: { successUrl: data.successUrl },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/portal");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not open portal");
      window.open(data.url, "_blank");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPortalLoading(false);
    }
  }

  const planOrder: PlanId[] = ["FREE", "STARTER", "GROWTH", "PRO"];

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto w-full">

      {/* Header */}
      <div className="mb-10">
        <p
          className="text-xs tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
        >
          Billing
        </p>
        <h1
          className="font-display italic leading-none"
          style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 300, color: "var(--text)" }}
        >
          Plan & billing.
        </h1>
      </div>

      {/* Success banner */}
      {justUpgraded && (
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-8 text-sm font-medium"
          style={{ background: "var(--green-subtle)", border: "1px solid var(--green)", color: "var(--green)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Your plan has been upgraded successfully. Welcome to {currentPlan.name}!
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm mb-6"
          style={{ background: "#fff1f0", border: "1px solid #ffc9c9", color: "#c0392b" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5v3M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      {/* Current plan card */}
      <div
        className="rounded-2xl p-6 mb-10 flex items-center justify-between flex-wrap gap-6"
        style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center gap-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent-muted)" }}
          >
            <span
              className="font-display italic"
              style={{ fontSize: 22, fontWeight: 300, color: "var(--accent)" }}
            >
              {currentPlan.name[0]}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <p className="font-medium text-base" style={{ color: "var(--text)" }}>
                {currentPlan.name} plan
              </p>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                style={{ background: statusInfo.bg, color: statusInfo.color, border: `1px solid ${statusInfo.color}` }}
              >
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {currentPlan.price === 0
                ? "Free forever"
                : `$${currentPlan.price}/month`}
              {currentPeriodEnd && currentStatus === "active" && (
                <span> · Renews {new Date(currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
              )}
              {currentPeriodEnd && currentStatus === "canceled" && (
                <span> · Access until {new Date(currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
              )}
            </p>
          </div>
        </div>

        {hasSubscription && (
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
          >
            {portalLoading ? (
              <>
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Opening…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Manage subscription
              </>
            )}
          </button>
        )}
      </div>

      {/* Usage meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <UsageMeter
          label="Waitlists"
          current={waitlistCount}
          limit={currentPlan.waitlistLimit}
          unit="waitlists"
        />
        <UsageMeter
          label="Total signups"
          current={totalSignups}
          limit={currentPlan.signupLimit}
          unit="signups"
        />
      </div>

      {/* Plan comparison */}
      <div className="mb-6">
        <h2
          className="font-display italic mb-6"
          style={{ fontSize: 26, fontWeight: 300, color: "var(--text)" }}
        >
          {currentPlanId === "PRO" ? "You're on the best plan." : "Upgrade your plan."}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {planOrder.map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = planId === currentPlanId;
            const isDowngrade =
              planOrder.indexOf(planId) < planOrder.indexOf(currentPlanId as PlanId);
            const loading = checkoutLoading === planId;

            return (
              <div
                key={planId}
                className="flex flex-col gap-5 p-6 rounded-2xl relative transition-all hover:-translate-y-0.5"
                style={{
                  border: isCurrent
                    ? "1.5px solid var(--accent)"
                    : "1px solid var(--border)",
                  background: isCurrent
                    ? "var(--accent-subtle)"
                    : "var(--surface-raised)",
                  boxShadow: isCurrent ? "var(--shadow-md)" : "var(--shadow-sm)",
                }}
              >
                {/* Popular badge */}
                {"popular" in plan && plan.popular && !isCurrent && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full text-white whitespace-nowrap"
                    style={{ background: "var(--accent)" }}
                  >
                    Most popular
                  </div>
                )}

                {/* Current badge */}
                {isCurrent && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    Current plan
                  </div>
                )}

                <div>
                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-2"
                    style={{
                      color: isCurrent ? "var(--accent)" : "var(--muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="font-display"
                      style={{ fontSize: 44, fontWeight: 300, lineHeight: 1, color: "var(--text)" }}
                    >
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm" style={{ color: "var(--muted)" }}>/mo</span>
                    )}
                  </div>
                </div>

                <div className="h-px" style={{ background: "var(--border)" }} />

                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-xs leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <svg className="mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 4.5" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div
                    className="py-2.5 rounded-xl text-xs font-medium text-center"
                    style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
                  >
                    ✓ Current plan
                  </div>
                ) : planId === "FREE" ? (
                  <div
                    className="py-2.5 rounded-xl text-xs font-medium text-center"
                    style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                  >
                    {isDowngrade ? "Downgrade via portal" : "Free tier"}
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(planId)}
                    disabled={loading || !paddleReady}
                    className="py-2.5 rounded-xl text-xs font-medium text-white transition-all disabled:opacity-50"
                    style={{
                      background: isDowngrade ? "var(--surface)" : "var(--accent)",
                      color: isDowngrade ? "var(--muted)" : "#fff",
                      border: isDowngrade ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                        Loading…
                      </span>
                    ) : isDowngrade ? (
                      "Downgrade"
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing info note */}
      <p className="text-xs text-center mt-8" style={{ color: "var(--muted)" }}>
        Payments are securely processed by{" "}
        <a
          href="https://paddle.com"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Paddle
        </a>
        . Cancel anytime from the customer portal.
        {" "}All prices in USD.
      </p>
    </div>
  );
}

// ── Usage Meter Component ──
function UsageMeter({
  label,
  current,
  limit,
  unit,
}: {
  label: string;
  current: number;
  limit: number;
  unit: string;
}) {
  const isUnlimited = limit === Infinity;
  const pct = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isWarning = pct >= 80;
  const isFull = pct >= 100;

  const barColor = isFull
    ? "#dc2626"
    : isWarning
    ? "var(--amber)"
    : "var(--accent)";

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-xs font-medium tracking-wide"
          style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
        >
          {label}
        </p>
        {isWarning && !isFull && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "#fff8ee", color: "var(--amber)", border: "1px solid var(--amber)", fontSize: 10 }}
          >
            Almost full
          </span>
        )}
        {isFull && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "#fff1f0", color: "#dc2626", border: "1px solid #dc2626", fontSize: 10 }}
          >
            Limit reached
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-3">
        <span
          className="font-display italic"
          style={{ fontSize: 36, fontWeight: 300, lineHeight: 1, color: "var(--text)" }}
        >
          {current.toLocaleString()}
        </span>
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          / {isUnlimited ? "∞" : limit.toLocaleString()} {unit}
        </span>
      </div>

      {!isUnlimited && (
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ background: "var(--border)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
      )}

      {isUnlimited && (
        <p className="text-xs" style={{ color: "var(--green)" }}>Unlimited</p>
      )}
    </div>
  );
}