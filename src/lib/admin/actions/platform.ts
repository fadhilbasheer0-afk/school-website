"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { requirePlatformAdmin } from "@/lib/supabase/auth";
import { MOCK_TENANTS } from "@/lib/tenant";

export interface ActionResult<T = any> {
  ok: boolean;
  error?: string;
  data?: T;
}

const fail = (error: string): ActionResult => ({ ok: false, error });

async function logAudit(
  actorId: string | null,
  actorEmail: string | null,
  action: string,
  targetType: string,
  targetId: string | null,
  schoolId: string | null = null,
  details: Record<string, unknown> = {}
) {
  if (!isSupabaseConfigured) return;
  try {
    const supabase = await createClient();
    await supabase.from("audit_logs").insert({
      actor_id: actorId,
      actor_email: actorEmail,
      action,
      target_type: targetType,
      target_id: targetId,
      school_id: schoolId,
      details,
    });
  } catch (err) {
    console.error("[audit_log] failed:", err);
  }
}

/**
 * Creates a brand new institution with default theme, pages, sections, and subscription.
 */
export async function createSchool(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await requirePlatformAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const motto = String(formData.get("motto") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const subscriptionTier = (String(formData.get("subscriptionTier") ?? "free").trim().toLowerCase()) as
    | "free"
    | "starter"
    | "pro"
    | "enterprise";
  const initialAdminEmail = String(formData.get("initialAdminEmail") ?? "").trim();

  if (!name || !slug) return fail("Institution name and URL slug are required.");
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return fail("Slug must contain only lowercase letters, numbers, and hyphens.");
  }

  if (!isSupabaseConfigured) {
    // Development mock
    const id = `mock-${slug}-${Date.now()}`;
    MOCK_TENANTS[slug] = {
      id,
      slug,
      name,
      motto: motto || null,
      establishedYear: new Date().getFullYear(),
      address: address || null,
      phone: phone || null,
      email: email || null,
      website: null,
      isActive: true,
      subscriptionTier,
      theme: {
        primaryColor: "#0f172a",
        secondaryColor: "#1e293b",
        accentColor: "#d97706",
        fontFamily: "sans",
        logoUrl: null,
        faviconUrl: null,
        bannerUrl: null,
      },
    };
    revalidatePath("/platform-admin");
    return { ok: true, data: { id } };
  }

  const supabase = await createClient();

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from("schools")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return fail(`The slug '${slug}' is already in use by another institution.`);
  }

  // Insert school
  const { data: newSchool, error: schoolErr } = await supabase
    .from("schools")
    .insert({
      name,
      slug,
      motto: motto || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      subscription_tier: subscriptionTier,
      is_active: true,
      is_default: false,
    })
    .select("id")
    .single();

  if (schoolErr || !newSchool) {
    return fail(schoolErr?.message || "Failed to create institution record.");
  }

  const schoolId = newSchool.id;

  // Initialize theme
  await supabase.from("school_themes").insert({
    school_id: schoolId,
    primary_color: "#0f172a",
    secondary_color: "#1e293b",
    accent_color: "#d97706",
    font_family: "sans",
  });

  // Initialize subscription
  await supabase.from("school_subscriptions").insert({
    school_id: schoolId,
    plan: subscriptionTier,
    status: "active",
    billing_cycle: "monthly",
  });

  // Initialize default pages
  const defaultPages = [
    { page_key: "about", title: "About Us", nav_label: "About Us", slug: "about", sort_order: 1 },
    { page_key: "academics", title: "Academics", nav_label: "Academics", slug: "academics", sort_order: 2 },
    { page_key: "faculty", title: "Faculty & Staff", nav_label: "Faculty", slug: "faculty", sort_order: 3 },
    { page_key: "facilities", title: "Campus Facilities", nav_label: "Facilities", slug: "facilities", sort_order: 4 },
    { page_key: "activities", title: "Activities & Achievements", nav_label: "Activities", slug: "activities", sort_order: 5 },
    { page_key: "gallery", title: "Campus Gallery", nav_label: "Gallery", slug: "gallery", sort_order: 6 },
    { page_key: "events", title: "Events Calendar", nav_label: "Events", slug: "events", sort_order: 7 },
    { page_key: "admissions", title: "Admissions", nav_label: "Admissions", slug: "admissions", sort_order: 8 },
    { page_key: "news", title: "News & Notices", nav_label: "News", slug: "news", sort_order: 9 },
    { page_key: "contact", title: "Contact Us", nav_label: "Contact", slug: "contact", sort_order: 10 },
  ];

  await supabase.from("school_pages").insert(
    defaultPages.map((p) => ({
      school_id: schoolId,
      ...p,
      is_enabled: true,
      is_in_nav: true,
    }))
  );

  // Initialize default homepage sections
  const defaultSections = [
    { section_key: "hero", title: "Hero Banner", sort_order: 1 },
    { section_key: "stats", title: "Statistics", sort_order: 2 },
    { section_key: "about_preview", title: "About Highlights", sort_order: 3 },
    { section_key: "academics_preview", title: "Academics Overview", sort_order: 4 },
    { section_key: "news_preview", title: "Latest News", sort_order: 5 },
    { section_key: "events_preview", title: "Upcoming Events", sort_order: 6 },
    { section_key: "achievements_preview", title: "Achievements", sort_order: 7 },
    { section_key: "facilities_preview", title: "Campus Facilities", sort_order: 8 },
    { section_key: "gallery_preview", title: "Photo Gallery", sort_order: 9 },
    { section_key: "admissions_cta", title: "Admissions CTA", sort_order: 10 },
  ];

  await supabase.from("school_homepage_sections").insert(
    defaultSections.map((s) => ({
      school_id: schoolId,
      ...s,
      is_enabled: true,
    }))
  );

  // Send invitation if initial admin email provided
  if (initialAdminEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(initialAdminEmail)) {
    await supabase.from("school_invitations").insert({
      school_id: schoolId,
      email: initialAdminEmail,
      role: "owner",
      invited_by: session.userId,
    });
  }

  await logAudit(
    session.userId,
    session.email,
    "school.created",
    "school",
    schoolId,
    schoolId,
    { name, slug, subscriptionTier }
  );

  revalidatePath("/platform-admin");
  return { ok: true, data: { id: schoolId } };
}

/**
 * Updates an institution's profile, status, domain, or branding.
 */
export async function updateSchool(schoolId: string, formData: FormData): Promise<ActionResult> {
  const session = await requirePlatformAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const motto = String(formData.get("motto") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const isActive = formData.get("isActive") === "true";
  const customDomain = String(formData.get("customDomain") ?? "").trim().toLowerCase();
  const primaryColor = String(formData.get("primaryColor") ?? "").trim();
  const accentColor = String(formData.get("accentColor") ?? "").trim();

  if (!name || !slug) return fail("Name and slug are required.");

  if (!isSupabaseConfigured) {
    if (MOCK_TENANTS[slug]) {
      MOCK_TENANTS[slug].name = name;
      MOCK_TENANTS[slug].isActive = isActive;
    }
    revalidatePath("/platform-admin");
    return { ok: true };
  }

  const supabase = await createClient();

  // Check slug conflict with another school
  const { data: conflict } = await supabase
    .from("schools")
    .select("id")
    .eq("slug", slug)
    .neq("id", schoolId)
    .maybeSingle();

  if (conflict) {
    return fail(`The slug '${slug}' is already taken by another institution.`);
  }

  const { error } = await supabase
    .from("schools")
    .update({
      name,
      slug,
      motto: motto || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      is_active: isActive,
      custom_domain: customDomain || null,
      primary_color: primaryColor || null,
      accent_color: accentColor || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", schoolId);

  if (error) return fail(error.message);

  if (primaryColor || accentColor) {
    await supabase
      .from("school_themes")
      .upsert({
        school_id: schoolId,
        primary_color: primaryColor || "#0f172a",
        accent_color: accentColor || "#d97706",
      });
  }

  await logAudit(
    session.userId,
    session.email,
    "school.updated",
    "school",
    schoolId,
    schoolId,
    { name, slug, isActive }
  );

  revalidatePath("/platform-admin");
  return { ok: true };
}

/**
 * Toggles an institution's active/inactive state.
 */
export async function toggleSchoolActive(schoolId: string, isActive: boolean): Promise<ActionResult> {
  const session = await requirePlatformAdmin();

  if (!isSupabaseConfigured) {
    revalidatePath("/platform-admin");
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("schools")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", schoolId);

  if (error) return fail(error.message);

  await logAudit(
    session.userId,
    session.email,
    isActive ? "school.activated" : "school.deactivated",
    "school",
    schoolId,
    schoolId
  );

  revalidatePath("/platform-admin");
  return { ok: true };
}

/**
 * Deletes an institution permanently with its associated content and settings.
 */
export async function deleteSchool(schoolId: string): Promise<ActionResult> {
  const session = await requirePlatformAdmin();

  if (!isSupabaseConfigured) {
    revalidatePath("/platform-admin");
    return { ok: true };
  }

  const supabase = await createClient();

  // Safety check: prevent deleting the default platform institution
  const { data: school } = await supabase
    .from("schools")
    .select("is_default, name")
    .eq("id", schoolId)
    .single();

  if (school?.is_default) {
    return fail("Cannot delete the default root platform institution.");
  }

  const { error } = await supabase.from("schools").delete().eq("id", schoolId);
  if (error) return fail(error.message);

  await logAudit(
    session.userId,
    session.email,
    "school.deleted",
    "school",
    schoolId,
    null,
    { deletedSchoolName: school?.name }
  );

  revalidatePath("/platform-admin");
  return { ok: true };
}

/**
 * Updates an institution's subscription tier or status.
 */
export async function updateSubscription(
  schoolId: string,
  plan: "free" | "starter" | "pro" | "enterprise",
  status: "active" | "trialing" | "past_due" | "canceled" | "paused"
): Promise<ActionResult> {
  const session = await requirePlatformAdmin();

  if (!isSupabaseConfigured) {
    revalidatePath("/platform-admin");
    return { ok: true };
  }

  const supabase = await createClient();

  await supabase
    .from("schools")
    .update({ subscription_tier: plan, updated_at: new Date().toISOString() })
    .eq("id", schoolId);

  const { error } = await supabase
    .from("school_subscriptions")
    .upsert({
      school_id: schoolId,
      plan,
      status,
      updated_at: new Date().toISOString(),
    });

  if (error) return fail(error.message);

  await logAudit(
    session.userId,
    session.email,
    "subscription.updated",
    "school_subscriptions",
    schoolId,
    schoolId,
    { plan, status }
  );

  revalidatePath("/platform-admin");
  return { ok: true };
}

/**
 * Adds a custom domain or subdomain to an institution.
 */
export async function addDomain(
  schoolId: string,
  domain: string,
  isPrimary: boolean = false
): Promise<ActionResult> {
  const session = await requirePlatformAdmin();

  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!cleanDomain) return fail("Valid domain name required.");

  if (!isSupabaseConfigured) {
    revalidatePath("/platform-admin");
    return { ok: true };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("school_domains")
    .insert({
      school_id: schoolId,
      domain: cleanDomain,
      is_primary: isPrimary,
      is_verified: true,
    })
    .select("id")
    .single();

  if (error) return fail(error.message);

  if (isPrimary) {
    await supabase.from("schools").update({ custom_domain: cleanDomain }).eq("id", schoolId);
  }

  await logAudit(
    session.userId,
    session.email,
    "domain.added",
    "school_domains",
    data.id,
    schoolId,
    { domain: cleanDomain }
  );

  revalidatePath("/platform-admin");
  return { ok: true };
}

/**
 * Deletes a custom domain mapping.
 */
export async function deleteDomain(domainId: string): Promise<ActionResult> {
  const session = await requirePlatformAdmin();

  if (!isSupabaseConfigured) {
    revalidatePath("/platform-admin");
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("school_domains").delete().eq("id", domainId);
  if (error) return fail(error.message);

  await logAudit(
    session.userId,
    session.email,
    "domain.deleted",
    "school_domains",
    domainId
  );

  revalidatePath("/platform-admin");
  return { ok: true };
}

/**
 * Creates and dispatches an invitation for an institution admin or platform admin.
 */
export async function inviteAdmin(formData: FormData): Promise<ActionResult> {
  const session = await requirePlatformAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const schoolId = String(formData.get("schoolId") ?? "").trim() || null;
  const role = (String(formData.get("role") ?? "admin").trim()) as "owner" | "admin" | "editor" | "viewer";
  const isPlatformAdmin = formData.get("isPlatformAdmin") === "true";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail("Please enter a valid email address.");
  }

  if (!isSupabaseConfigured) {
    revalidatePath("/platform-admin");
    return { ok: true };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("school_invitations")
    .insert({
      email,
      school_id: schoolId,
      role,
      is_platform_admin: isPlatformAdmin,
      invited_by: session.userId,
    })
    .select("id, token")
    .single();

  if (error) return fail(error.message);

  await logAudit(
    session.userId,
    session.email,
    "user.invited",
    "school_invitations",
    data.id,
    schoolId,
    { email, role, isPlatformAdmin }
  );

  revalidatePath("/platform-admin");
  return { ok: true, data: { inviteToken: data.token } };
}

/**
 * Updates platform-wide global settings.
 */
export async function updatePlatformSettings(formData: FormData): Promise<ActionResult> {
  const session = await requirePlatformAdmin();

  const platformName = String(formData.get("platformName") ?? "").trim();
  const supportEmail = String(formData.get("supportEmail") ?? "").trim();
  const allowRegistration = formData.get("allowSchoolRegistration") === "true";
  const maintenanceMode = formData.get("maintenanceMode") === "true";
  const announcement = String(formData.get("announcement") ?? "").trim();

  if (!platformName) return fail("Platform name is required.");

  if (!isSupabaseConfigured) {
    revalidatePath("/platform-admin");
    return { ok: true };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("platform_settings")
    .update({
      platform_name: platformName,
      support_email: supportEmail || null,
      allow_school_registration: allowRegistration,
      maintenance_mode: maintenanceMode,
      announcement: announcement || null,
      updated_at: new Date().toISOString(),
    })
    .neq("id", "00000000-0000-0000-0000-000000000000"); // matches any row

  if (error) return fail(error.message);

  await logAudit(
    session.userId,
    session.email,
    "platform_settings.updated",
    "platform_settings",
    null,
    null,
    { platformName, maintenanceMode }
  );

  revalidatePath("/platform-admin");
  return { ok: true };
}
