// src/app/embed/layout.tsx
// Completely bare layout for embedded pages — no nav, no noise texture,
// transparent background so it blends with the host site.

import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Join the waitlist",
  robots: { index: false, follow: false },
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Allow embedding in iframes from any origin */}
        <meta httpEquiv="X-Frame-Options" content="ALLOWALL" />
      </head>
      <body
        className={`${cormorant.variable} ${outfit.variable}`}
        style={{ margin: 0, padding: 0, background: "transparent" }}
      >
        {children}
      </body>
    </html>
  );
}