import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Globe,
  CreditCard,
  Users,
  Sliders,
  ShieldCheck,
  LayoutDashboard,
  ExternalLink,
  School,
} from "lucide-react";
import { requirePlatformAdmin } from "@/lib/supabase/auth";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { ToastProvider } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Super Admin | School Platform",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const platformNav = [
  { label: "Overview", path: "/platform-admin", icon: LayoutDashboard },
  { label: "Institutions", path: "/platform-admin/schools", icon: School },
  { label: "Domains & URLs", path: "/platform-admin/domains", icon: Globe },
  { label: "Subscriptions", path: "/platform-admin/subscriptions", icon: CreditCard },
  { label: "Users & Admins", path: "/platform-admin/users", icon: Users },
  { label: "Platform Settings", path: "/platform-admin/settings", icon: Sliders },
  { label: "Audit Logs", path: "/platform-admin/audit", icon: ShieldCheck },
];

export default async function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePlatformAdmin();

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight">
                  School Platform
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <span className="font-semibold text-white">{session.fullName || session.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <School className="w-3.5 h-3.5" />
              <span>School Admin Portal</span>
            </Link>
            <AdminSignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex flex-col lg:flex-row gap-8 flex-1">
        {/* Sidebar Nav */}
        <nav className="w-full lg:w-64 shrink-0 flex flex-col gap-1.5">
          <p className="text-[11px] uppercase tracking-widest font-bold text-slate-500 px-3 mb-2">
            Platform Management
          </p>
          {platformNav.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <link.icon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{link.label}</span>
            </Link>
          ))}

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Platform</span>
            </Link>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 min-w-0">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  );
}
