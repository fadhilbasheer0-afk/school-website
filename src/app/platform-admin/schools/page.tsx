import React from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SchoolsManager, type SchoolItem } from "@/components/admin/platform/SchoolsManager";
import { MOCK_TENANTS } from "@/lib/tenant";

export default async function PlatformSchoolsPage() {
  let schools: SchoolItem[] = [];

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("schools")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        schools = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          motto: s.motto ?? null,
          email: s.email ?? null,
          phone: s.phone ?? null,
          address: s.address ?? null,
          isActive: Boolean(s.is_active),
          isDefault: Boolean(s.is_default),
          subscriptionTier: s.subscription_tier || "free",
          customDomain: s.custom_domain ?? null,
          primaryColor: s.primary_color ?? "#0f172a",
          accentColor: s.accent_color ?? "#d97706",
          createdAt: s.created_at,
        }));
      }
    } catch {
      // Fallback to mock
    }
  }

  if (schools.length === 0) {
    schools = Object.values(MOCK_TENANTS).map((t, idx) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      motto: t.motto,
      email: t.email,
      phone: t.phone,
      address: t.address,
      isActive: t.isActive,
      isDefault: idx === 0,
      subscriptionTier: t.subscriptionTier,
      customDomain: null,
      primaryColor: t.theme.primaryColor,
      accentColor: t.theme.accentColor,
      createdAt: new Date().toISOString(),
    }));
  }

  return <SchoolsManager initialSchools={schools} />;
}
