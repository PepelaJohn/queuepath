'use client';
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "var(--bg-alt)", borderBottom: "1px solid var(--border)" }}
    >
      <nav className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline"
          style={{ color: "var(--text)" }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "var(--accent)" }}
          >
            Q
          </div>
          <span
            className="font-semibold text-sm tracking-wide uppercase"
            style={{ fontFamily: "var(--font-body), sans-serif", letterSpacing: "0.12em" }}
          >
            QueuePath
          </span>
        </Link>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {["How it works", "Features", "Pricing"].map((item) => (
            <li key={item}>
              <Link
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs font-medium tracking-widest uppercase no-underline transition-colors"
                style={{ color: "var(--muted)", letterSpacing: "0.14em" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden md:block text-xs font-medium tracking-widest uppercase no-underline transition-colors"
            style={{ color: "var(--muted)", letterSpacing: "0.14em" }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-xs font-semibold tracking-widest uppercase no-underline px-5 py-2.5 rounded-lg transition-all"
            style={{
              background: "var(--accent)",
              color: "#fff",
              letterSpacing: "0.12em",
            }}
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}