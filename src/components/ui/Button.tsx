"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Styling base
    const baseStyle =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    // Variants map
    const variants = {
      primary:
        "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border border-transparent hover:bg-slate-800 dark:hover:bg-slate-200 focus:ring-slate-900 shadow-md hover:shadow-lg",
      secondary:
        "bg-amber-600 hover:bg-amber-700 text-white border border-transparent focus:ring-amber-500 shadow-md hover:shadow-lg",
      outline:
        "bg-transparent text-slate-800 dark:text-slate-100 border border-slate-350 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 focus:ring-slate-850",
      ghost:
        "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 focus:ring-slate-400",
      danger:
        "bg-red-650 hover:bg-red-750 text-white border border-transparent focus:ring-red-500 shadow-md hover:shadow-lg",
    };

    // Sizing map
    const sizes = {
      sm: "px-3.5 py-1.5 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-7 py-3.5 text-lg",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
