"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import { createClient } from "@/lib/supabase/client";

/**
 * Sends a password-reset email via Supabase Auth. The email links back to
 * /admin/update-password where the user chooses a new password.
 */
export const AdminForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const redirectTo = `${window.location.origin}/admin/update-password`;
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );

      if (resetError) {
        throw resetError;
      }

      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send a reset email. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 md:p-10 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
          Check your inbox
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          If an account exists for <strong>{email}</strong>, a password reset
          link is on its way. Follow the link to choose a new password.
        </p>
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 md:p-10">
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 dark:from-slate-100 dark:to-white flex items-center justify-center text-white dark:text-slate-900 shadow-md mb-4">
          <KeyRound className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Reset your password
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Enter your email and we&rsquo;ll send you a reset link.
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
            placeholder="you@irshadacademy.edu"
            required
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center py-3"
          isLoading={isSubmitting}
        >
          Send Reset Link
        </Button>

        <div className="text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
};
