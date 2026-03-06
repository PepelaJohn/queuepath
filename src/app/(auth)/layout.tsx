import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>

      {/* ── LEFT PANEL — decorative, hidden on mobile ── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{ background: "var(--text)", color: "var(--bg)" }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Large italic watermark */}
        <span
          aria-hidden
          className="pointer-events-none select-none absolute -right-8 top-[8%] font-display italic leading-none"
          style={{
            fontSize: "clamp(100px, 16vw, 220px)",
            fontWeight: 300,
            opacity: 0.08,
            letterSpacing: "-0.03em",
            color: "currentColor",
          }}
        >
          Queue
          <br />
          Path
        </span>

        {/* Top nav */}
        <div className="relative z-10 flex items-center justify-between p-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 no-underline"
            style={{ color: "currentColor" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.15)", color: "currentColor" }}
            >
              Q
            </div>
            <span className="text-sm font-semibold tracking-[0.12em] uppercase">
              QueuePath
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs tracking-widest uppercase no-underline opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "currentColor" }}
          >
            ← Back home
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-14 pb-16">
          <p
            className="text-xs tracking-[0.22em] uppercase mb-8 opacity-40"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Trusted by 2,400+ founders
          </p>

          <h2
            className="font-display italic leading-[0.9] mb-10"
            style={{
              fontSize: "clamp(44px, 5.5vw, 72px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
            }}
          >
            Turn visitors into
            <br />
            your first users.
          </h2>

          {/* Stat pills */}
          <div className="flex flex-col gap-4">
            {[
              { icon: "✦", text: "Viral referral system built in" },
              { icon: "✦", text: "Live in under 5 minutes" },
              { icon: "✦", text: "Free forever to start" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 text-sm font-light"
                style={{ opacity: 0.75 }}
              >
                <span style={{ opacity: 0.5, fontSize: 10 }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>

          {/* Fake mini testimonial */}
          <div
            className="mt-14 p-6 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p
              className="font-display italic text-lg leading-snug mb-4"
              style={{ fontWeight: 300, opacity: 0.85 }}
            >
              &ldquo;We hit 3,000 signups in the first week. QueuePath&apos;s referral system just worked.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                AK
              </div>
              <div>
                <p className="text-sm font-medium" style={{ opacity: 0.9 }}>Alex Kim</p>
                <p className="text-xs" style={{ opacity: 0.45 }}>Founder, Notevo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 px-14 pb-8">
          <p className="text-xs" style={{ opacity: 0.3 }}>
            © {new Date().getFullYear()} QueuePath
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
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
            <span className="text-sm font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--text)" }}>
              QueuePath
            </span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Desktop theme toggle */}
        <div className="hidden lg:flex justify-end px-8 pt-8">
          <ThemeToggle />
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px]">
            {children}
          </div>
        </div>

        {/* Bottom links */}
        <div
          className="px-8 py-6 text-center text-xs border-t"
          style={{ color: "var(--muted)", borderColor: "var(--border)" }}
        >
          <Link href="/privacy" className="no-underline hover:underline" style={{ color: "var(--muted)" }}>Privacy</Link>
          <span className="mx-3" style={{ opacity: 0.4 }}>·</span>
          <Link href="/terms" className="no-underline hover:underline" style={{ color: "var(--muted)" }}>Terms</Link>
          <span className="mx-3" style={{ opacity: 0.4 }}>·</span>
          <Link href="mailto:hello@queuepath.io" className="no-underline hover:underline" style={{ color: "var(--muted)" }}>Support</Link>
        </div>
      </div>
    </div>
  );
}