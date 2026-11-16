import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  if (!isSupabaseConfigured) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/40 shadow-sm p-8 md:p-10">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-4" />
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
            Supabase is not configured
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            The admin area needs Supabase credentials. Copy{" "}
            <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              .env.example
            </code>{" "}
            to{" "}
            <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              .env.local
            </code>{" "}
            and fill in your{" "}
            <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
            , then restart the server. See{" "}
            <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              supabase/setup.md
            </code>{" "}
            for full instructions.
          </p>
          <Link
            href="/"
            className="mt-6 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            ← Back to website
          </Link>
        </div>
      </div>
    );
  }

  return <AdminLoginForm next={next} />;
}
