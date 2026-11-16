import React from "react";
import { requireAdmin } from "@/lib/supabase/auth";
import { resolveTenant, type SchoolTheme } from "@/lib/tenant";
import { BrandingManager } from "@/components/admin/branding/BrandingManager";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata = {
  title: "Branding & Colors",
};

export default async function AdminBrandingPage() {
  const session = await requireAdmin();
  const schoolId = session.schoolId;

  let theme: SchoolTheme = {
    primaryColor: "#0f172a",
    secondaryColor: "#1e293b",
    accentColor: "#d97706",
    fontFamily: "sans",
    logoUrl: null,
    faviconUrl: null,
    bannerUrl: null,
  };
  let schoolName = "Your Institution";

  if (isSupabaseConfigured && schoolId) {
    try {
      const supabase = await createClient();
      const { data: sData } = await supabase
        .from("schools")
        .select("name, primary_color, accent_color, logo_url, favicon_url")
        .eq("id", schoolId)
        .maybeSingle();

      if (sData) {
        schoolName = sData.name;
        if (sData.primary_color) theme.primaryColor = sData.primary_color;
        if (sData.accent_color) theme.accentColor = sData.accent_color;
        if (sData.logo_url) theme.logoUrl = sData.logo_url;
        if (sData.favicon_url) theme.faviconUrl = sData.favicon_url;
      }

      const { data: tData } = await supabase
        .from("school_themes")
        .select("*")
        .eq("school_id", schoolId)
        .maybeSingle();

      if (tData) {
        theme = {
          primaryColor: tData.primary_color || theme.primaryColor,
          secondaryColor: tData.secondary_color || theme.secondaryColor,
          accentColor: tData.accent_color || theme.accentColor,
          fontFamily: tData.font_family || "sans",
          logoUrl: tData.logo_url || theme.logoUrl,
          faviconUrl: tData.favicon_url || theme.faviconUrl,
          bannerUrl: tData.banner_url || null,
        };
      }
    } catch {
      // Fallback
    }
  } else {
    const tenant = await resolveTenant();
    theme = tenant.theme;
    schoolName = tenant.name;
  }

  return <BrandingManager initialTheme={theme} schoolName={schoolName} />;
}
