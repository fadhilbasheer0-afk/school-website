"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { revalidateContent } from "@/lib/admin/revalidate";

export interface ActionResult<T = unknown> {
  ok: boolean;
  error?: string;
  data?: T;
}

const fail = (error: string): ActionResult => ({ ok: false, error });

/**
 * Updates an institution's branding, primary/accent colors, and typography.
 */
export async function updateSchoolBranding(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const schoolId = session.schoolId;
  if (!schoolId && !session.isPlatformAdmin) return fail("No school attached to this account.");

  const primaryColor = String(formData.get("primaryColor") ?? "#0f172a").trim();
  const secondaryColor = String(formData.get("secondaryColor") ?? "#1e293b").trim();
  const accentColor = String(formData.get("accentColor") ?? "#d97706").trim();
  const fontFamily = String(formData.get("fontFamily") ?? "sans").trim() as
    | "sans"
    | "serif"
    | "mono"
    | "inter"
    | "playfair";
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const faviconUrl = String(formData.get("faviconUrl") ?? "").trim();

  if (!isSupabaseConfigured) {
    revalidatePath("/admin/branding");
    revalidateContent("school_themes");
    return { ok: true };
  }

  const supabase = await createClient();

  // Update theme table
  const { error } = await supabase
    .from("school_themes")
    .upsert({
      school_id: schoolId,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
      font_family: fontFamily,
      logo_url: logoUrl || null,
      favicon_url: faviconUrl || null,
      updated_at: new Date().toISOString(),
    });

  if (error) return fail(error.message);

  // Sync colors and logo to schools and school_settings
  await supabase
    .from("schools")
    .update({
      primary_color: primaryColor,
      accent_color: accentColor,
      logo_url: logoUrl || null,
      favicon_url: faviconUrl || null,
    })
    .eq("id", schoolId);

  await supabase
    .from("school_settings")
    .update({
      primary_color: primaryColor,
      logo_url: logoUrl || null,
    })
    .eq("school_id", schoolId);

  revalidatePath("/admin/branding");
  revalidateContent("school_themes");
  revalidateContent("school_settings");
  return { ok: true };
}
