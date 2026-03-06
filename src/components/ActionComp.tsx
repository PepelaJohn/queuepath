'use client'
import Link from "next/link";

type WaitlistWithCount = {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    accentColor: string;
    isActive: boolean;
    createdAt: Date;
    _count: { members: number };
  };

export default function ActionComp(w: WaitlistWithCount) {
    return <div className="flex items-center gap-2 shrink-0">
      <a
        href={`/w/${w.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg transition-colors no-underline"
        style={{ color: "var(--muted)" }}
        title="View live page"
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text)"; (e.currentTarget as HTMLElement).style.background = "var(--surface)"; } }
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
      <Link
        href={`/dashboard/waitlists/${w.id}/edit`}
        className="p-2 rounded-lg transition-colors no-underline"
        style={{ color: "var(--muted)" }}
        title="Edit"
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text)"; (e.currentTarget as HTMLElement).style.background = "var(--surface)"; } }
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </Link>
      <Link
        href={`/dashboard/waitlists/${w.id}`}
        className="p-2 rounded-lg transition-colors no-underline"
        style={{ color: "var(--muted)" }}
        title="Manage"
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; (e.currentTarget as HTMLElement).style.background = "var(--accent-subtle)"; } }
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </div>;
  }