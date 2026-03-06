// src/app/dashboard/loading.tsx
// Next.js automatically shows this while the dashboard page is streaming

export default function DashboardLoading() {
    return (
      <div className="px-8 py-10 max-w-6xl mx-auto w-full animate-pulse">
        {/* Page header skeleton */}
        <div className="flex items-start justify-between mb-10">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded-full" style={{ background: "var(--border)" }} />
            <div className="h-10 w-72 rounded-2xl" style={{ background: "var(--border)" }} />
          </div>
          <div className="h-11 w-36 rounded-xl" style={{ background: "var(--border)" }} />
        </div>
  
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 space-y-3"
              style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-20 rounded-full" style={{ background: "var(--border)" }} />
                <div className="h-5 w-5 rounded-lg" style={{ background: "var(--border)" }} />
              </div>
              <div className="h-9 w-16 rounded-xl" style={{ background: "var(--border)" }} />
            </div>
          ))}
        </div>
  
        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 w-32 rounded-xl" style={{ background: "var(--border)" }} />
          <div className="h-4 w-12 rounded-full" style={{ background: "var(--border)" }} />
        </div>
  
        {/* Waitlist rows skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-5 p-5 rounded-2xl"
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                opacity: 1 - i * 0.2,
              }}
            >
              <div className="w-11 h-11 rounded-xl shrink-0" style={{ background: "var(--border)" }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded-lg" style={{ background: "var(--border)" }} />
                <div className="h-3 w-28 rounded-full" style={{ background: "var(--border)" }} />
              </div>
              <div className="hidden sm:block space-y-1">
                <div className="h-7 w-12 rounded-lg" style={{ background: "var(--border)" }} />
                <div className="h-2.5 w-14 rounded-full" style={{ background: "var(--border)" }} />
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="w-8 h-8 rounded-lg" style={{ background: "var(--border)" }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }