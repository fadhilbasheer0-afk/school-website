import React from "react";
import { Loader2, Inbox, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface LoadingProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingProps> = ({
  message = "Loading content...",
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-20 px-4 text-center ${className}`}
    >
      <Loader2 className="w-10 h-10 text-indigo-650 animate-spin mb-4" />
      <p className="text-slate-500 dark:text-slate-400 font-medium">
        {message}
      </p>
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No content found",
  description = "There is currently no information available for this section.",
  icon = <Inbox className="w-12 h-12 text-slate-350 dark:text-slate-600 mb-4" />,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-slate-205 dark:border-slate-800 rounded-2xl bg-slate-20/20 dark:bg-slate-900/10 ${className}`}
    >
      {icon}
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      <p className="text-sm text-slate-550 dark:text-slate-450 mt-1 max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We encountered an error while loading the data. Please try again.",
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-red-500/10 rounded-2xl bg-red-50/5 dark:bg-red-950/5 ${className}`}
    >
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-205">
        {title}
      </h3>
      <p className="text-sm text-red-550 dark:text-red-400/80 mt-1 max-w-sm leading-relaxed mb-6">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="primary"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
