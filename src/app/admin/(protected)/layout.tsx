import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { ToastProvider } from "@/components/admin/ui";
import { resolveTenant } from "@/lib/tenant";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: {
    template: "%s | Institution Admin",
    default: "Institution Admin Portal",
  },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const tenant = await resolveTenant({ id: session.schoolId || undefined });

  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                {tenant.name}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                Portal
              </span>
              {session.isPlatformAdmin && (
                <Link
                  href="/platform-admin"
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-widest hover:bg-amber-500/30 transition-colors"
                >
                  <Shield className="w-3 h-3" />
                  <span>Super Admin</span>
                </Link>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Signed in as{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {session.fullName ?? session.email ?? session.userId}
              </span>
              {session.role === "owner" ? " (Owner)" : " (Admin)"}
            </p>
          </div>
          <AdminSignOutButton />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        <AdminNav />
        <main className="flex-1 min-w-0">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  );
}
