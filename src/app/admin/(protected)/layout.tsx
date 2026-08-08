import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { ToastProvider } from "@/components/admin/ui";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteConfig.name} Admin`,
    default: `${siteConfig.name} Admin`,
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

  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
              Admin Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Signed in as{" "}
              <span className="font-semibold">
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
