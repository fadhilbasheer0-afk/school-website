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
  isPlatformAdmin: boolean;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean | null;
  school_id: string | null;
  is_platform_admin?: boolean | null;
}

/**
 * Resolves the authenticated user together with their profile row.
 * Checks both profiles and platform_admins tables.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (!isSupabaseConfigured) {
    // Development / demo fallback session when Supabase env is not configured
    if (process.env.NODE_ENV === "development" && process.env.ENABLE_DEV_ADMIN === "true") {
      return {
        userId: "dev-super-admin-id",
        email: "superadmin@edusaas.com",
        fullName: "Platform Super Admin (Dev)",
        role: "owner",
        schoolId: "7a04d7c8-4b8e-4f0d-9f3c-2f6f6e4a1b5d",
        isPlatformAdmin: true,
      };
    }
    return null;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Check profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_active, school_id, is_platform_admin")
    .eq("id", user.id)
    .single<ProfileRow>();

  if (!profile || profile.is_active === false) {
    return null;
  }

  // Check platform_admins table as well
  let isPlatformAdmin = Boolean(profile.is_platform_admin);
  if (!isPlatformAdmin) {
    const { data: pa } = await supabase
      .from("platform_admins")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (pa?.id) isPlatformAdmin = true;
  }

  return {
    userId: profile.id,
    email: profile.email ?? user.email ?? null,
    fullName: profile.full_name,
    role: profile.role,
    schoolId: profile.school_id,
    isPlatformAdmin,
  };
});

/**
 * Guard for protected school admin routes.
 * Platform admins always have access.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (session.isPlatformAdmin) {
    return session;
  }

  if (session.role !== "owner" && session.role !== "admin") {
    redirect("/admin/access-denied");
  }

  return session;
}

/**
 * Guard for protected platform super admin routes.
 */
export async function requirePlatformAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login?next=/platform-admin");
  }

  if (!session.isPlatformAdmin) {
    redirect("/admin/access-denied");
  }

  return session;
}
