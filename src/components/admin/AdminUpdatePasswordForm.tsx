"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import { createClient } from "@/lib/supabase/client";

/**
 * Chooses a new password after a Supabase password-reset flow. The reset email
 * links to /admin/update-password with a signed-in recovery session.
 */
export const AdminUpdatePasswordForm: React.FC = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updated, setUpdated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setUpdated(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your password. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  if (updated) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 md:p-10 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
          Password updated
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Your password has been changed successfully. Please sign in again
          with your new password.
        </p>
        <Button
          variant="primary"
          className="mt-6 w-full justify-center py-3"
          onClick={() => {
            router.push("/admin/login");
            router.refresh();
          }}
        >
          Continue to Sign In
        </Button>
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
          Choose a new password
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Enter a strong password for your admin account.
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

        <FormField label="New Password" id="password" helperText="At least 8 characters.">
          <Input
            type="password"
            id="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </FormField>

        <FormField label="Confirm New Password" id="confirmPassword">
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center py-3"
          isLoading={isSubmitting}
          leftIcon={<Lock className="w-4 h-4" />}
        >
          Update Password
        </Button>

        <div className="text-center">
          <Link
            href="/admin/login"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
};
