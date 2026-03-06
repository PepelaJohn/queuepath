// src/components/dashboard/ToggleActiveButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ToggleActiveButton({ waitlistId, isActive }: { waitlistId: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(isActive);

  async function toggle() {
    setLoading(true);
    try {
      await fetch(`/api/waitlists/${waitlistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !active }),
      });
      setActive(!active);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
      style={{
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
        background: "var(--surface-raised)",
      }}
    >
      {active ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
          Pause
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Activate
        </>
      )}
    </button>
  );
}