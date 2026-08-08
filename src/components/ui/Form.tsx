import React from "react";

interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  id,
  children,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          {label}
        </label>
      )}
      {children}
      {error && (
        <span className="text-xs font-medium text-red-500 mt-0.5">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {helperText}
        </span>
      )}
    </div>
  );
};

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-4 py-2.5 text-base text-slate-900 dark:text-white transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-200/80 dark:border-slate-800 focus:border-indigo-600 focus:ring-indigo-600/20 dark:focus:ring-offset-slate-950"
        } ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-4 py-2.5 text-base text-slate-900 dark:text-white transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-200/80 dark:border-slate-800 focus:border-indigo-600 focus:ring-indigo-600/20 dark:focus:ring-offset-slate-950"
        } ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error, options, placeholder, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-4 py-2.5 text-base text-slate-900 dark:text-white transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-200/80 dark:border-slate-800 focus:border-indigo-600 focus:ring-indigo-600/20 dark:focus:ring-offset-slate-950"
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = "Select";
