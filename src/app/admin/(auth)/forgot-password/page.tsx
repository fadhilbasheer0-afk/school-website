import type { Metadata } from "next";
import { AdminForgotPasswordForm } from "@/components/admin/AdminForgotPasswordForm";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminForgotPasswordPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/40 shadow-sm p-8 md:p-10 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
          Supabase is not configured
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Set up your <code>.env.local</code> file before using password reset.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-block text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return <AdminForgotPasswordForm />;
}
