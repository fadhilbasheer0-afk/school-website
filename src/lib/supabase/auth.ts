import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient, isSupabaseConfigured } from "./server";

export type AdminRole = "owner" | "admin" | "editor" | "viewer";

export interface AdminSession {
  userId: string;
  email: string | null;
  fullName: string | null;
  role: AdminRole;
  schoolId: string | null;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean | null;
  school_id: string | null;
}

/**
 * Resolves the authenticated user together with their profile row. Returns
 * null when there is no session, the profile is missing, or the profile is
 * deactivated. Never throws for missing configuration — returns null instead.
 *
 * Wrapped in React `cache()` so the (protected) layout and every admin page
 * share a single Supabase round-trip per request instead of one each.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (!isSupabaseConfigured) {
    return null;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_active, school_id")
    .eq("id", user.id)
    .single<ProfileRow>();

  if (error || !profile) {
    return null;
  }

  if (profile.is_active === false) {
    return null;
  }

  return {
    userId: profile.id,
    email: profile.email ?? user.email ?? null,
    fullName: profile.full_name,
    role: profile.role,
    schoolId: profile.school_id,
  };
});

/**
 * Guard for protected admin routes. Redirects unauthenticated users to the
 * login page and authenticated non-admins to the access-denied page.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (session.role !== "owner" && session.role !== "admin") {
    redirect("/admin/access-denied");
  }

  return session;
}
