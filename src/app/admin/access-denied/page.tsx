import type { Metadata } from "next";
import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Access Denied",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminAccessDeniedPage() {
  return (
    <div className="flex-1 w-full flex items-center justify-center px-4 py-24 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-5">
          <ShieldX className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
          Access denied
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
          Your account is signed in, but it doesn&rsquo;t have the admin
          privileges required to view this area. Contact the school
          administrator if you believe this is a mistake.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/">
            <Button variant="outline">Back to website</Button>
          </Link>
          <Link href="/admin/login">
            <Button variant="primary">Switch account</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
