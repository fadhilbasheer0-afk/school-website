"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { revalidateContent } from "@/lib/admin/revalidate";

export interface ActionResult<T = any> {
  ok: boolean;
  error?: string;
  data?: T;
}

const fail = (error: string): ActionResult => ({ ok: false, error });

/**
 * Toggles a standard school page enabled/disabled without deleting content.
 */
export async function togglePageEnabled(pageId: string, isEnabled: boolean): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session.schoolId && !session.isPlatformAdmin) return fail("No school attached to this account.");

  if (!isSupabaseConfigured) {
    revalidatePath("/admin/pages");
    revalidateContent("school_pages");
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("school_pages")
    .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
    .eq("id", pageId);

  if (error) return fail(error.message);

  revalidatePath("/admin/pages");
  revalidateContent("school_pages");
  return { ok: true };
}

/**
 * Toggles whether a standard page appears in navigation.
 */
export async function togglePageInNav(pageId: string, isInNav: boolean): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session.schoolId && !session.isPlatformAdmin) return fail("No school attached to this account.");

  if (!isSupabaseConfigured) {
    revalidatePath("/admin/pages");
    revalidateContent("school_pages");
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("school_pages")
    .update({ is_in_nav: isInNav, updated_at: new Date().toISOString() })
    .eq("id", pageId);

  if (error) return fail(error.message);

  revalidatePath("/admin/pages");
  revalidateContent("school_pages");
  return { ok: true };
}

/**
 * Renames a page title, navigation label, and optional slug.
 */
export async function updatePageDetails(
  pageId: string,
  title: string,
  navLabel: string,
  slug?: string
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session.schoolId && !session.isPlatformAdmin) return fail("No school attached to this account.");

  const cleanTitle = title.trim();
  const cleanNav = navLabel.trim();
  if (!cleanTitle || !cleanNav) return fail("Page title and navigation label are required.");

  if (!isSupabaseConfigured) {
    revalidatePath("/admin/pages");
    revalidateContent("school_pages");
    return { ok: true };
  }

  const supabase = await createClient();
  const updatePayload: Record<string, unknown> = {
    title: cleanTitle,
    nav_label: cleanNav,
    updated_at: new Date().toISOString(),
  };

  if (slug && /^[a-z0-9-]+$/.test(slug.trim())) {
    updatePayload.slug = slug.trim().toLowerCase();
  }

  const { error } = await supabase
    .from("school_pages")
    .update(updatePayload)
    .eq("id", pageId);

  if (error) return fail(error.message);

  revalidatePath("/admin/pages");
  revalidateContent("school_pages");
  return { ok: true };
}

/**
 * Updates sort order of school pages in batch.
 */
export async function reorderPages(orderedPageIds: string[]): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session.schoolId && !session.isPlatformAdmin) return fail("No school attached to this account.");

  if (!isSupabaseConfigured) {
    revalidatePath("/admin/pages");
    revalidateContent("school_pages");
    return { ok: true };
  }

  const supabase = await createClient();

  for (let i = 0; i < orderedPageIds.length; i++) {
    await supabase
      .from("school_pages")
      .update({ sort_order: i + 1, updated_at: new Date().toISOString() })
      .eq("id", orderedPageIds[i]);
  }

  revalidatePath("/admin/pages");
  revalidateContent("school_pages");
  return { ok: true };
}

/**
 * Creates a new custom page for an institution.
 */
export async function createCustomPage(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await requireAdmin();
  const schoolId = session.schoolId;
  if (!schoolId && !session.isPlatformAdmin) return fail("No school attached to this account.");

  const title = String(formData.get("title") ?? "").trim();
  const navLabel = String(formData.get("navLabel") ?? title).trim();
  const rawSlug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const slug = rawSlug.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  const content = String(formData.get("content") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const isInNav = formData.get("isInNav") === "true";
  const isPublished = formData.get("isPublished") === "true";

  if (!title || !slug) return fail("Title and URL slug are required.");

  if (!isSupabaseConfigured) {
    const id = `cp-${Date.now()}`;
    revalidatePath("/admin/custom-pages");
    revalidateContent("custom_pages");
    return { ok: true, data: { id } };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("custom_pages")
    .insert({
      school_id: schoolId,
      title,
      nav_label: navLabel || title,
      slug,
      content,
      meta_description: metaDescription || null,
      is_in_nav: isInNav,
      is_published: isPublished,
    })
    .select("id")
    .single();

  if (error) return fail(error.message);

  revalidatePath("/admin/custom-pages");
  revalidateContent("custom_pages");
  return { ok: true, data };
}

/**
 * Updates an existing custom page.
 */
export async function updateCustomPage(pageId: string, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session.schoolId && !session.isPlatformAdmin) return fail("No school attached to this account.");

  const title = String(formData.get("title") ?? "").trim();
  const navLabel = String(formData.get("navLabel") ?? title).trim();
  const rawSlug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const slug = rawSlug.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  const content = String(formData.get("content") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const isInNav = formData.get("isInNav") === "true";
  const isPublished = formData.get("isPublished") === "true";

  if (!title || !slug) return fail("Title and URL slug are required.");

  if (!isSupabaseConfigured) {
    revalidatePath("/admin/custom-pages");
    revalidateContent("custom_pages");
    return { ok: true };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("custom_pages")
    .update({
      title,
      nav_label: navLabel || title,
      slug,
      content,
      meta_description: metaDescription || null,
      is_in_nav: isInNav,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId);

  if (error) return fail(error.message);

  revalidatePath("/admin/custom-pages");
  revalidateContent("custom_pages");
  return { ok: true };
}

/**
 * Deletes a custom page.
 */
export async function deleteCustomPage(pageId: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session.schoolId && !session.isPlatformAdmin) return fail("No school attached to this account.");

  if (!isSupabaseConfigured) {
    revalidatePath("/admin/custom-pages");
    revalidateContent("custom_pages");
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("custom_pages").delete().eq("id", pageId);
  if (error) return fail(error.message);

  revalidatePath("/admin/custom-pages");
  revalidateContent("custom_pages");
  return { ok: true };
}
