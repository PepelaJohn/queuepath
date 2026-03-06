'use client'
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ScrollReveal } from "@/components/ScrollReveal";

/* ─────────────────────────────────────────────
   HOMEPAGE  —  src/app/page.tsx
   Stack: Next.js 14 App Router, Tailwind, CSS vars
───────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      <Navbar />
      <ScrollReveal />

      <main>
        {/* ── HERO ── */}
        <section
          className="relative min-h-screen flex items-end pb-24 pt-16 overflow-hidden"
          style={{ background: "var(--bg)" }}
        >
          {/* Large background text watermark */}
          <span
            aria-hidden
            className="pointer-events-none select-none absolute right-[-2%] top-[12%] font-display italic leading-none"
            style={{
              fontSize: "clamp(120px, 20vw, 280px)",
              color: "var(--border)",
              fontWeight: 300,
              opacity: 0.6,
              letterSpacing: "-0.03em",
            }}
          >
            Queue
          </span>

          {/* Subtle grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              opacity: 0.35,
              maskImage:
                "radial-gradient(ellipse 70% 60% at 20% 50%, black 20%, transparent 80%)",
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <p
                className="reveal text-xs font-medium tracking-[0.22em] uppercase mb-8"
                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                Waitlist infrastructure for founders
              </p>

              {/* Headline */}
              <h1
                className="reveal font-display italic leading-[0.9] mb-8"
                style={{
                  fontSize: "clamp(56px, 9vw, 112px)",
                  fontWeight: 300,
                  color: "var(--text)",
                  letterSpacing: "-0.02em",
                }}
              >
                Build the hype.
                <br />
                <span style={{ color: "var(--accent)" }}>Before</span> you
                <br />
                launch.
              </h1>

              {/* Sub */}
              <p
                className="reveal text-lg font-light mb-10 max-w-md leading-relaxed"
                style={{ color: "var(--muted)" }}
              >
                Create viral waitlists in minutes. Give users referral links. Watch your list grow itself.
              </p>

              {/* CTAs */}
              <div className="reveal flex items-center gap-4 flex-wrap">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 no-underline px-7 py-3.5 rounded-xl font-medium text-sm tracking-wide text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background: "var(--accent)",
                    boxShadow: "0 4px 20px color-mix(in srgb, var(--accent) 35%, transparent)",
                  }}
                >
                  Start for free
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 no-underline px-7 py-3.5 rounded-xl font-medium text-sm tracking-wide transition-all"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    background: "var(--surface-raised)",
                  }}
                >
                  See how it works
                </Link>
              </div>

              {/* Stats row */}
              <div
                className="reveal mt-16 flex items-center gap-10 flex-wrap"
              >
                {[
                  { num: "2,400+", label: "Waitlists created" },
                  { num: "180K", label: "Signups collected" },
                  { num: "38%", label: "Avg referral rate" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span
                      className="font-display text-4xl leading-none"
                      style={{ fontWeight: 300, color: "var(--text)" }}
                    >
                      {s.num}
                    </span>
                    <span
                      className="text-xs tracking-widest uppercase"
                      style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div
          className="overflow-hidden py-4 border-y"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div
            className="flex whitespace-nowrap"
            style={{ animation: "marquee 32s linear infinite" }}
          >
            {[...Array(2)].map((_, dupeIdx) => (
              <div key={dupeIdx} className="flex shrink-0">
                {[
                  "Referral system",
                  "Analytics dashboard",
                  "Custom branding",
                  "CSV export",
                  "Embed anywhere",
                  "Anti-spam protection",
                  "Leaderboards",
                  "Queue ranking",
                  "Email delivery",
                  "Reward milestones",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-3 px-8 text-xs font-medium tracking-[0.18em] uppercase"
                    style={{
                      color: "var(--muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <span style={{ color: "var(--accent)", fontSize: 16 }}>✦</span>
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section
          id="how-it-works"
          className="py-28"
          style={{ background: "var(--bg-alt)" }}
        >
          <div className="max-w-7xl mx-auto px-8">
            {/* Header */}
            <div className="mb-20">
              <p
                className="reveal text-xs tracking-[0.22em] uppercase mb-4"
                style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
              >
                Process
              </p>
              <h2
                className="reveal font-display italic leading-[0.9]"
                style={{
                  fontSize: "clamp(40px, 6vw, 80px)",
                  fontWeight: 300,
                  color: "var(--text)",
                }}
              >
                From idea to
                <br />
                viral loop.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
              {/* Steps */}
              <div className="space-y-0">
                {[
                  {
                    n: "01",
                    title: "Create your waitlist",
                    desc: "Add your product name, description, logo, and brand color. Your page is live instantly.",
                  },
                  {
                    n: "02",
                    title: "Share your link",
                    desc: "Post it on Twitter, Product Hunt, Reddit — anywhere. Visitors land on your custom page.",
                  },
                  {
                    n: "03",
                    title: "Users invite friends",
                    desc: "Every signup gets a unique referral link. More referrals = higher queue position.",
                  },
                  {
                    n: "04",
                    title: "Launch with momentum",
                    desc: "Export your verified, engaged list. Your first users are already invested in your success.",
                  },
                ].map((step) => (
                  <div
                    key={step.n}
                    className="reveal flex gap-8 py-8 border-b group cursor-default"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span
                      className="font-display italic pt-1 shrink-0"
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        fontFamily: "var(--font-mono)",
                        minWidth: 28,
                      }}
                    >
                      {step.n}
                    </span>
                    <div>
                      <h3
                        className="font-medium text-base mb-2 transition-colors group-hover:underline"
                        style={{
                          color: "var(--text)",
                          textDecorationColor: "var(--accent)",
                        }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Browser Mockup */}
              <div className="reveal sticky top-24">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  {/* Browser chrome */}
                  <div
                    className="flex items-center gap-2 px-5 py-4 border-b"
                    style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
                  >
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400 opacity-80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
                      <div className="w-3 h-3 rounded-full bg-green-400 opacity-80" />
                    </div>
                    <div
                      className="ml-3 flex-1 max-w-[220px] rounded-md px-3 py-1.5 text-xs"
                      style={{
                        background: "var(--surface)",
                        color: "var(--muted)",
                        fontFamily: "var(--font-mono)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      queuepath.io/w/launchdeck
                    </div>
                  </div>

                  {/* Page content */}
                  <div
                    className="px-10 py-12 flex flex-col items-center text-center gap-5"
                    style={{ background: "var(--bg)" }}
                  >
                    {/* Logo */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent-muted)" }}
                    >
                      🚀
                    </div>

                    <div>
                      <h3
                        className="font-display italic text-3xl leading-none mb-2"
                        style={{ fontWeight: 300, color: "var(--text)" }}
                      >
                        LaunchDeck
                      </h3>
                      <p className="text-sm" style={{ color: "var(--muted)" }}>
                        The all-in-one tool for indie hackers.
                      </p>
                    </div>

                    <div
                      className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full"
                      style={{
                        background: "var(--accent-subtle)",
                        color: "var(--accent)",
                        border: "1px solid var(--accent-muted)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      1,247 people already joined
                    </div>

                    <div className="w-full space-y-3 mt-2">
                      <div
                        className="w-full rounded-xl px-4 py-3 text-sm text-left"
                        style={{
                          background: "var(--surface-raised)",
                          border: "1px solid var(--border)",
                          color: "var(--muted)",
                        }}
                      >
                        Your name
                      </div>
                      <div
                        className="w-full rounded-xl px-4 py-3 text-sm text-left"
                        style={{
                          background: "var(--surface-raised)",
                          border: "1px solid var(--border)",
                          color: "var(--muted)",
                        }}
                      >
                        your@email.com
                      </div>
                      <div
                        className="w-full rounded-xl px-4 py-3 text-sm font-medium text-center text-white"
                        style={{ background: "var(--accent)" }}
                      >
                        Join the waitlist →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section
          id="features"
          className="py-28"
          style={{ background: "var(--bg)" }}
        >
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-end justify-between mb-20 flex-wrap gap-8">
              <div>
                <p
                  className="reveal text-xs tracking-[0.22em] uppercase mb-4"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                >
                  Features
                </p>
                <h2
                  className="reveal font-display italic leading-[0.9]"
                  style={{ fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 300, color: "var(--text)" }}
                >
                  Everything you need.
                  <br />
                  Nothing you don&apos;t.
                </h2>
              </div>
              <p
                className="reveal text-sm font-light max-w-xs leading-relaxed"
                style={{ color: "var(--muted)" }}
              >
                Built specifically for founders who want to validate demand before writing a single line of product code.
              </p>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border rounded-2xl overflow-hidden"
              style={{ borderColor: "var(--border)" }}
            >
              {[
                { icon: "🔗", title: "Viral referral system", desc: "Each user gets a unique link. Referrals boost their queue position, creating a built-in incentive to share." },
                { icon: "🎨", title: "Custom branding", desc: "Upload your logo, set your accent color, and add custom copy. Your page, your brand." },
                { icon: "📊", title: "Analytics dashboard", desc: "Track signups over time, referral conversion rates, top referrers, and traffic sources in real time." },
                { icon: "🛡️", title: "Anti-spam protection", desc: "Cloudflare Turnstile, honeypot fields, IP rate limiting, and email deduplication keep your list clean." },
                { icon: "📤", title: "CSV export", desc: "Download your subscriber list anytime. Drop it into Mailchimp, ConvertKit, or any email tool." },
                { icon: "🖼️", title: "Embeddable forms", desc: "One line of code drops the signup form directly into your existing website or landing page." },
              ].map((f, i) => (
                <div
                  key={i}
                  className="reveal p-9 border-b border-r group cursor-default transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    // Remove right border from col 3, bottom border from last row on lg
                    ...(i % 3 === 2 ? { borderRight: "none" } : {}),
                    ...(i >= 3 ? { borderBottom: "none" } : {}),
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "";
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-6"
                    style={{
                      background: "var(--accent-subtle)",
                      border: "1px solid var(--accent-muted)",
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-medium text-base mb-2" style={{ color: "var(--text)" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section
          id="pricing"
          className="py-28"
          style={{ background: "var(--bg-alt)", borderTop: "1px solid var(--border)" }}
        >
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-16">
              <p
                className="reveal text-xs tracking-[0.22em] uppercase mb-4"
                style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
              >
                Pricing
              </p>
              <h2
                className="reveal font-display italic leading-[0.9] mb-4"
                style={{ fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 300, color: "var(--text)" }}
              >
                Simple, honest pricing.
              </h2>
              <p
                className="reveal text-base font-light"
                style={{ color: "var(--muted)" }}
              >
                Start free. Scale when your waitlist does.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  name: "Free",
                  price: "0",
                  features: ["1 waitlist", "Up to 50 signups", "Basic analytics", "QueuePath branding"],
                  featured: false,
                },
                {
                  name: "Starter",
                  price: "9",
                  features: ["3 waitlists", "Up to 1,000 signups", "Remove branding", "CSV export"],
                  featured: false,
                },
                {
                  name: "Growth",
                  price: "29",
                  features: ["10 waitlists", "Up to 10,000 signups", "Advanced analytics", "Referral leaderboard", "Priority support"],
                  featured: true,
                  badge: "Most popular",
                },
                {
                  name: "Pro",
                  price: "79",
                  features: ["Unlimited waitlists", "Unlimited signups", "White-label", "Advanced analytics", "Webhooks", "Dedicated support"],
                  featured: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className="reveal flex flex-col gap-6 p-7 rounded-2xl relative transition-transform hover:-translate-y-1"
                  style={{
                    border: plan.featured
                      ? "1.5px solid var(--accent)"
                      : "1px solid var(--border)",
                    background: plan.featured ? "var(--accent-subtle)" : "var(--surface-raised)",
                    boxShadow: plan.featured ? "var(--shadow-md)" : "var(--shadow-sm)",
                  }}
                >
                  {plan.badge && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-4 py-1 rounded-full text-white"
                      style={{ background: "var(--accent)", whiteSpace: "nowrap" }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <p
                      className="text-xs font-semibold tracking-widest uppercase mb-3"
                      style={{ color: plan.featured ? "var(--accent)" : "var(--muted)", fontFamily: "var(--font-mono)" }}
                    >
                      {plan.name}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span
                        className="font-display"
                        style={{ fontSize: 52, fontWeight: 300, lineHeight: 1, color: "var(--text)" }}
                      >
                        ${plan.price}
                      </span>
                      <span className="text-sm" style={{ color: "var(--muted)" }}>/mo</span>
                    </div>
                  </div>

                  <div className="h-px" style={{ background: "var(--border)" }} />

                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8l3.5 3.5L13 4.5" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup"
                    className="no-underline block text-center py-3 rounded-xl text-sm font-medium tracking-wide transition-all"
                    style={
                      plan.featured
                        ? { background: "var(--accent)", color: "#fff" }
                        : {
                            background: "transparent",
                            color: "var(--text)",
                            border: "1px solid var(--border)",
                          }
                    }
                  >
                    Get started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-28" style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
          <div className="max-w-7xl mx-auto px-8">
            <p
              className="reveal text-xs tracking-[0.22em] uppercase mb-4"
              style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
            >
              Social proof
            </p>
            <h2
              className="reveal font-display italic leading-[0.9] mb-16"
              style={{ fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 300, color: "var(--text)" }}
            >
              Founders love it.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "We hit 3,000 signups in the first week. The referral system just worked — our users did all the marketing for us.",
                  name: "Alex Kim",
                  role: "Founder, Notevo",
                  initials: "AK",
                  color: "var(--accent-subtle)",
                  textColor: "var(--accent)",
                },
                {
                  quote: "Set up our waitlist in 4 minutes flat. The page looks better than half the landing pages I've built from scratch.",
                  name: "Sara Reyes",
                  role: "Co-founder, Draftly",
                  initials: "SR",
                  color: "var(--green-subtle)",
                  textColor: "var(--green)",
                },
                {
                  quote: "The analytics are exactly what I needed to show investors traction before we even shipped. 38% referral rate speaks for itself.",
                  name: "James Mwangi",
                  role: "Founder, Stackle",
                  initials: "JM",
                  color: "#fff8ee",
                  textColor: "var(--amber)",
                },
              ].map((t, i) => (
                <div
                  key={i}
                  className="reveal flex flex-col gap-5 p-7 rounded-2xl"
                  style={{
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, s) => (
                      <svg key={s} width="13" height="13" viewBox="0 0 16 16" fill="var(--amber)">
                        <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
                      </svg>
                    ))}
                  </div>

                  <p
                    className="font-display italic text-lg leading-snug flex-1"
                    style={{ fontWeight: 300, color: "var(--text-secondary)" }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                      style={{ background: t.color, color: t.textColor }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{t.name}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section
          className="py-28 text-center"
          style={{
            background: "var(--bg-alt)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="max-w-3xl mx-auto px-8">
            <p
              className="reveal text-xs tracking-[0.22em] uppercase mb-6"
              style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
            >
              Get started today
            </p>
            <h2
              className="reveal font-display italic leading-[0.9] mb-6"
              style={{ fontSize: "clamp(48px, 7vw, 96px)", fontWeight: 300, color: "var(--text)" }}
            >
              Your next launch
              <br />
              starts here.
            </h2>
            <p
              className="reveal text-base font-light mb-10 mx-auto"
              style={{ color: "var(--muted)", maxWidth: 360 }}
            >
              Free forever. No credit card. No engineers needed.
            </p>
            <div className="reveal flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 no-underline px-8 py-4 rounded-xl font-medium text-sm tracking-wide text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 6px 24px color-mix(in srgb, var(--accent) 30%, transparent)",
                }}
              >
                Build my waitlist free
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 no-underline px-8 py-4 rounded-xl font-medium text-sm tracking-wide transition-all"
                style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--surface-raised)" }}
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer
        className="py-10 px-8 flex items-center justify-between flex-wrap gap-6"
        style={{ borderTop: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 no-underline"
            style={{ color: "var(--text)" }}
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "var(--accent)" }}
            >
              Q
            </div>
            <span
              className="text-sm font-semibold tracking-[0.12em] uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              QueuePath
            </span>
          </Link>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            © {new Date().getFullYear()} QueuePath. All rights reserved.
          </p>
        </div>

        <nav className="flex items-center gap-6">
          {["Privacy", "Terms", "Contact"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-xs no-underline transition-colors"
              style={{ color: "var(--muted)" }}
            >
              {item}
            </Link>
          ))}
        </nav>
      </footer>
    </>
  );
}