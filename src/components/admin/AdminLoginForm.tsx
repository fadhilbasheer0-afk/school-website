"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, GraduationCap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import { createClient } from "@/lib/supabase/client";

interface AdminLoginFormProps {
  next?: string;
}

/**
 * Email/password sign-in against Supabase Auth. On success the user is sent
 * to `next` (the originally requested admin page, if any).
 */
export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ next }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      const destination = next && next.startsWith("/admin") ? next : "/admin";
      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign in failed. Please check your credentials and try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 md:p-10">
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 dark:from-slate-100 dark:to-white flex items-center justify-center text-white dark:text-slate-900 shadow-md mb-4">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Admin Sign In
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Restricted area — authorized staff only.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/40 rounded-xl"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <FormField label="Email Address" id="email">
          <Input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.edu"
            required
          />
        </FormField>

        <FormField label="Password" id="password">
          <Input
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </FormField>

        <div className="text-right">
          <Link
            href="/admin/forgot-password"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center py-3"
          isLoading={isSubmitting}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>
    </div>
  );
};
