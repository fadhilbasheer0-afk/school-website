import React from "react";
import Link from "next/link";
import { Compass, Home, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-6 md:px-8 text-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Animated Compass Icon */}
        <div className="w-24 h-24 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-8 animate-bounce shadow-lg shadow-amber-500/10">
          <Compass className="w-12 h-12" />
        </div>

        {/* 404 Header */}
        <span className="text-sm font-extrabold tracking-widest text-amber-600 dark:text-amber-400 uppercase mb-2">
          Error 404
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Lost on Campus?
        </h1>
        <p className="text-slate-510 dark:text-slate-400 leading-relaxed mb-10 max-w-sm">
          It looks like the page you are looking for has either been moved, renamed, or doesn&rsquo;t exist in our campus directory.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3.5 w-full">
          <Link href="/" className="flex-1 w-full">
            <Button
              variant="primary"
              className="w-full justify-center"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Back to Home
            </Button>
          </Link>
          <Link href="/contact" className="flex-1 w-full">
            <Button
              variant="outline"
              className="w-full justify-center border-slate-350 text-slate-800 dark:border-slate-805 dark:text-white"
              leftIcon={<HelpCircle className="w-4 h-4" />}
            >
              Help Desk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
