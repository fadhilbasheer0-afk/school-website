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
 * Toggles whether a homepage section is visible.
 */
export async function toggleSectionEnabled(sectionId: string, isEnabled: boolean): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session.schoolId && !session.isPlatformAdmin) return fail("No school attached to this account.");

  if (!isSupabaseConfigured) {
    revalidatePath("/admin/sections");
    revalidateContent("school_homepage_sections");
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("school_homepage_sections")
    .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
    .eq("id", sectionId);

  if (error) return fail(error.message);

  revalidatePath("/admin/sections");
  revalidateContent("school_homepage_sections");
  return { ok: true };
}

/**
 * Updates title, subtitle, or settings for a homepage section.
 */
export async function updateSectionDetails(
  sectionId: string,
  title: string,
  subtitle?: string
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session.schoolId && !session.isPlatformAdmin) return fail("No school attached to this account.");

  if (!isSupabaseConfigured) {
    revalidatePath("/admin/sections");
    revalidateContent("school_homepage_sections");
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("school_homepage_sections")
    .update({
      title: title.trim(),
      subtitle: subtitle?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sectionId);

  if (error) return fail(error.message);

  revalidatePath("/admin/sections");
  revalidateContent("school_homepage_sections");
  return { ok: true };
}

/**
 * Reorders homepage sections in batch.
 */
export async function reorderSections(orderedSectionIds: string[]): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session.schoolId && !session.isPlatformAdmin) return fail("No school attached to this account.");

  if (!isSupabaseConfigured) {
    revalidatePath("/admin/sections");
    revalidateContent("school_homepage_sections");
    return { ok: true };
  }

  const supabase = await createClient();

  for (let i = 0; i < orderedSectionIds.length; i++) {
    await supabase
      .from("school_homepage_sections")
      .update({ sort_order: i + 1, updated_at: new Date().toISOString() })
      .eq("id", orderedSectionIds[i]);
  }

  revalidatePath("/admin/sections");
  revalidateContent("school_homepage_sections");
  return { ok: true };
}
