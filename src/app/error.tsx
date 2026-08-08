"use client";

import React, { useEffect } from "react";
import { ErrorState } from "@/components/ui/FeedbackStates";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an analytics or error tracking service
    console.error("Unhandled portal error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh] p-6 lg:p-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-md w-full">
        <ErrorState
          title="Academic Portal Error"
          message="We encountered an issue preparing the requested page. This has been logged, and our IT department is resolving it."
          onRetry={reset}
        />
      </div>
    </div>
  );
}
