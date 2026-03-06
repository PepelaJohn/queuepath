// src/app/dashboard/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar founderName={session.user.name ?? session.user.email ?? "Founder"} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center justify-between px-5 h-14 border-b shrink-0"
          style={{ background: "var(--bg-alt)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "var(--accent)" }}
            >
              Q
            </div>
            <span className="text-sm font-semibold tracking-[0.1em] uppercase" style={{ color: "var(--text)" }}>
              QueuePath
            </span>
          </div>
          <MobileNav founderName={session.user.name ?? session.user.email ?? "Founder"} />
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}