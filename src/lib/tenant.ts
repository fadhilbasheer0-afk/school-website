import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/public";
import { siteConfig } from "@/lib/site";
export { getTenantUrl } from "@/lib/tenant-url";

export interface SchoolTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: "sans" | "serif" | "mono" | "inter" | "playfair";
  logoUrl: string | null;
  faviconUrl: string | null;
  bannerUrl: string | null;
  customCss?: string | null;
}

export interface SchoolPageConfig {
  id?: string;
  schoolId: string;
  pageKey: string;
  title: string;
  navLabel: string;
  slug: string;
  isEnabled: boolean;
  isInNav: boolean;
  sortOrder: number;
  heroTitle?: string | null;
  heroDescription?: string | null;
  metaDescription?: string | null;
}

export interface HomepageSectionConfig {
  id?: string;
  schoolId: string;
  sectionKey: string;
  title: string;
  subtitle?: string | null;
  isEnabled: boolean;
  sortOrder: number;
  settings?: Record<string, any>;
}

export interface CustomPage {
  id: string;
  schoolId: string;
  slug: string;
  title: string;
  navLabel: string;
  content: string;
  metaDescription?: string | null;
  isPublished: boolean;
  isInNav: boolean;
  sortOrder: number;
}

export interface TenantContext {
  id: string;
  slug: string;
  name: string;
  motto: string | null;
  establishedYear: number | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isActive: boolean;
  subscriptionTier: "free" | "starter" | "pro" | "enterprise";
  theme: SchoolTheme;
  isPathScoped?: boolean;
}

/* ─── Static Mock Tenants for Offline / Seed Fallback ─── */

export const MOCK_TENANTS: Record<string, TenantContext> = {
  "demo-school": {
    id: "7a04d7c8-4b8e-4f0d-9f3c-2f6f6e4a1b5d",
    slug: "demo-school",
    name: "School",
    motto: null,
    establishedYear: null,
    address: null,
    phone: null,
    email: null,
    website: null,
    isActive: true,
    subscriptionTier: "pro",
    theme: {
      primaryColor: "#0f172a", // slate-900
      secondaryColor: "#1e293b",
      accentColor: "#d97706", // amber-600
      fontFamily: "sans",
      logoUrl: null,
      faviconUrl: null,
      bannerUrl: null,
    },
  },
  "sample-school": {
    id: "8b15e8d9-5c9f-5a1e-8f4d-3a7a7e5b2c6e",
    slug: "sample-school",
    name: "School",
    motto: null,
    establishedYear: null,
    address: null,
    phone: null,
    email: null,
    website: null,
    isActive: true,
    subscriptionTier: "enterprise",
    theme: {
      primaryColor: "#064e3b", // emerald-900
      secondaryColor: "#065f46",
      accentColor: "#059669", // emerald-600
      fontFamily: "inter",
      logoUrl: null,
      faviconUrl: null,
      bannerUrl: null,
    },
  },
  "example-school": {
    id: "9c26f9ea-6da0-6b2f-9a5e-4b8b8f6c3d7f",
    slug: "example-school",
    name: "School",
    motto: null,
    establishedYear: null,
    address: null,
    phone: null,
    email: null,
    website: null,
    isActive: true,
    subscriptionTier: "starter",
    theme: {
      primaryColor: "#312e81", // indigo-900
      secondaryColor: "#3730a3",
      accentColor: "#6366f1", // indigo-500
      fontFamily: "playfair",
      logoUrl: null,
      faviconUrl: null,
      bannerUrl: null,
    },
  },
};

export const DEFAULT_PAGE_CONFIGS: Omit<SchoolPageConfig, "schoolId">[] = [
  { pageKey: "about", title: "About Us", navLabel: "About Us", slug: "about", isEnabled: true, isInNav: true, sortOrder: 1 },
  { pageKey: "academics", title: "Academics", navLabel: "Academics", slug: "academics", isEnabled: true, isInNav: true, sortOrder: 2 },
  { pageKey: "faculty", title: "Faculty & Staff", navLabel: "Faculty", slug: "faculty", isEnabled: true, isInNav: true, sortOrder: 3 },
  { pageKey: "facilities", title: "Campus Facilities", navLabel: "Facilities", slug: "facilities", isEnabled: true, isInNav: true, sortOrder: 4 },
  { pageKey: "activities", title: "Activities & Achievements", navLabel: "Activities", slug: "activities", isEnabled: true, isInNav: true, sortOrder: 5 },
  { pageKey: "gallery", title: "Campus Gallery", navLabel: "Gallery", slug: "gallery", isEnabled: true, isInNav: true, sortOrder: 6 },
  { pageKey: "events", title: "Events Calendar", navLabel: "Events", slug: "events", isEnabled: true, isInNav: true, sortOrder: 7 },
  { pageKey: "admissions", title: "Admissions & Enrollment", navLabel: "Admissions", slug: "admissions", isEnabled: true, isInNav: true, sortOrder: 8 },
  { pageKey: "news", title: "News & Announcements", navLabel: "News", slug: "news", isEnabled: true, isInNav: true, sortOrder: 9 },
  { pageKey: "contact", title: "Contact Us", navLabel: "Contact", slug: "contact", isEnabled: true, isInNav: true, sortOrder: 10 },
];

export const DEFAULT_HOMEPAGE_SECTIONS: Omit<HomepageSectionConfig, "schoolId">[] = [
  { sectionKey: "hero", title: "Hero Banner", subtitle: "Campus hero and admissions prompt", isEnabled: true, sortOrder: 1 },
  { sectionKey: "stats", title: "Statistics", subtitle: "Key numeric milestones", isEnabled: true, sortOrder: 2 },
  { sectionKey: "about_preview", title: "About Preview", subtitle: "Mission overview and welcome letter", isEnabled: true, sortOrder: 3 },
  { sectionKey: "academics_preview", title: "Academics Preview", subtitle: "Primary, middle, high curriculum cards", isEnabled: true, sortOrder: 4 },
  { sectionKey: "news_preview", title: "News & Notices", subtitle: "Recent campus bulletins", isEnabled: true, sortOrder: 5 },
  { sectionKey: "events_preview", title: "Upcoming Events", subtitle: "Assembly and calendar preview", isEnabled: true, sortOrder: 6 },
  { sectionKey: "achievements_preview", title: "Achievements", subtitle: "Trophies and Olympiad medals", isEnabled: true, sortOrder: 7 },
  { sectionKey: "facilities_preview", title: "Campus Facilities", subtitle: "Robotics hub, olympic pool, labs", isEnabled: true, sortOrder: 8 },
  { sectionKey: "gallery_preview", title: "Gallery", subtitle: "Student life snapshots", isEnabled: true, sortOrder: 9 },
  { sectionKey: "admissions_cta", title: "Admissions CTA", subtitle: "Inquiry and prospectus download card", isEnabled: true, sortOrder: 10 },
];

/* ─── Cached DB Fetchers ─── */

async function fetchTenantFromDb(identifier: { slug?: string; id?: string; domain?: string }): Promise<TenantContext | null> {
  if (!isSupabaseConfigured) return null;
  const client = createPublicClient();
  if (!client) return null;

  try {
    let query = client.from("schools").select("*");

    if (identifier.id) {
      query = query.eq("id", identifier.id);
    } else if (identifier.slug) {
      query = query.eq("slug", identifier.slug.toLowerCase());
    } else if (identifier.domain) {
      // Lookup domain in school_domains
      const { data: dom } = await client
        .from("school_domains")
        .select("school_id")
        .eq("domain", identifier.domain.toLowerCase())
        .maybeSingle();

      if (dom?.school_id) {
        query = query.eq("id", dom.school_id);
      } else {
        query = query.eq("custom_domain", identifier.domain.toLowerCase());
      }
    } else {
      // Fetch default active school
      query = query.eq("is_default", true);
    }

    const { data: school, error } = await query.maybeSingle();
    if (error || !school) return null;

    // Fetch theme
    const { data: theme } = await client
      .from("school_themes")
      .select("*")
      .eq("school_id", school.id)
      .maybeSingle();

    return {
      id: school.id,
      slug: school.slug,
      name: school.name,
      motto: school.motto ?? null,
      establishedYear: school.established_year ?? null,
      address: school.address ?? null,
      phone: school.phone ?? null,
      email: school.email ?? null,
      website: school.website ?? null,
      isActive: Boolean(school.is_active),
      subscriptionTier: (school.subscription_tier as any) || "free",
      theme: {
        primaryColor: theme?.primary_color || school.primary_color || "#0f172a",
        secondaryColor: theme?.secondary_color || "#1e293b",
        accentColor: theme?.accent_color || school.accent_color || "#d97706",
        fontFamily: (theme?.font_family as any) || "sans",
        logoUrl: theme?.logo_url || school.logo_url || null,
        faviconUrl: theme?.favicon_url || school.favicon_url || null,
        bannerUrl: theme?.banner_url || null,
        customCss: theme?.custom_css || null,
      },
    };
  } catch (err) {
    console.error("[fetchTenantFromDb] error:", err);
    return null;
  }
}

/**
 * Resolves the tenant context for the current request.
 * Order of evaluation:
 * 1. Explicit slug / domain passed
 * 2. Request headers (`x-tenant-slug`, `x-tenant-domain`)
 * 3. Request host (subdomain / custom domain)
 * 4. Database lookup or default active tenant
 * 5. Fallback mock tenant
 */
export async function resolveTenant(explicit?: { slug?: string; id?: string; domain?: string }): Promise<TenantContext> {
  let slug = explicit?.slug?.trim().toLowerCase();
  let domain = explicit?.domain?.trim().toLowerCase();
  let isPathScoped = Boolean(slug);

  if (explicit?.id) {
    const dbTenant = await fetchTenantFromDb({ id: explicit.id });
    if (dbTenant) return dbTenant;
  }

  if (!slug && !domain) {
    try {
      const headerList = await headers();
      const headerSlug = headerList.get("x-tenant-slug");
      const headerDomain = headerList.get("x-tenant-domain");
      const host = headerList.get("host") ?? "";

      if (headerSlug) {
        slug = headerSlug.toLowerCase();
      } else if (headerDomain) {
        domain = headerDomain.toLowerCase();
      } else if (host) {
        // Strip port
        const hostname = host.split(":")[0].toLowerCase();
        // Check for subdomain e.g. demo-school.localhost or demo-school.example.com
        const parts = hostname.split(".");
        if (parts.length > 2 && !["www", "admin", "platform", "api"].includes(parts[0])) {
          slug = parts[0];
        } else if (!["localhost", "127.0.0.1"].includes(hostname) && parts.length >= 2) {
          domain = hostname;
        }
      }
    } catch {
      // Called in build/static context without headers
    }
  }

  // 1. Try DB lookup
  if (slug || domain) {
    const dbTenant = await fetchTenantFromDb({ slug, domain });
    if (dbTenant) {
      dbTenant.isPathScoped = isPathScoped;
      return dbTenant;
    }

    // Check mock tenants for development/offline
    if (slug && MOCK_TENANTS[slug]) {
      const mock = { ...MOCK_TENANTS[slug], isPathScoped };
      return mock;
    }
  }

  // 2. Fetch default tenant from DB
  const defaultDb = await fetchTenantFromDb({});
  if (defaultDb) {
    return defaultDb;
  }

  // 3. Fallback to the neutral demo tenant
  return { ...MOCK_TENANTS["demo-school"], isPathScoped: false };
}

/**
 * Returns all configured pages for the given school.
 */
export async function getSchoolPages(schoolId: string): Promise<SchoolPageConfig[]> {
  const defaults: SchoolPageConfig[] = DEFAULT_PAGE_CONFIGS.map((p) => ({
    ...p,
    schoolId,
  }));

  if (!isSupabaseConfigured) return defaults;
  const client = createPublicClient();
  if (!client) return defaults;

  try {
    const { data, error } = await client
      .from("school_pages")
      .select("*")
      .eq("school_id", schoolId)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return defaults;

    return data.map((row: any) => ({
      id: row.id,
      schoolId: row.school_id,
      pageKey: row.page_key,
      title: row.title,
      navLabel: row.nav_label,
      slug: row.slug,
      isEnabled: Boolean(row.is_enabled),
      isInNav: Boolean(row.is_in_nav),
      sortOrder: Number(row.sort_order ?? 0),
      heroTitle: row.hero_title ?? null,
      heroDescription: row.hero_description ?? null,
      metaDescription: row.meta_description ?? null,
    }));
  } catch {
    return defaults;
  }
}

/**
 * Returns all custom pages for the given school.
 */
export async function getSchoolCustomPages(schoolId: string): Promise<CustomPage[]> {
  if (!isSupabaseConfigured) return [];
  const client = createPublicClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("custom_pages")
      .select("*")
      .eq("school_id", schoolId)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      schoolId: row.school_id,
      slug: row.slug,
      title: row.title,
      navLabel: row.nav_label,
      content: row.content,
      metaDescription: row.meta_description ?? null,
      isPublished: Boolean(row.is_published),
      isInNav: Boolean(row.is_in_nav),
      sortOrder: Number(row.sort_order ?? 0),
    }));
  } catch {
    return [];
  }
}

/**
 * Returns all homepage sections configuration for the given school.
 */
export async function getSchoolHomepageSections(schoolId: string): Promise<HomepageSectionConfig[]> {
  const defaults: HomepageSectionConfig[] = DEFAULT_HOMEPAGE_SECTIONS.map((s) => ({
    ...s,
    schoolId,
  }));

  if (!isSupabaseConfigured) return defaults;
  const client = createPublicClient();
  if (!client) return defaults;

  try {
    const { data, error } = await client
      .from("school_homepage_sections")
      .select("*")
      .eq("school_id", schoolId)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return defaults;

    return data.map((row: any) => ({
      id: row.id,
      schoolId: row.school_id,
      sectionKey: row.section_key,
      title: row.title,
      subtitle: row.subtitle ?? null,
      isEnabled: Boolean(row.is_enabled),
      sortOrder: Number(row.sort_order ?? 0),
      settings: row.settings ?? {},
    }));
  } catch {
    return defaults;
  }
}

/**
 * Checks whether a specific page is enabled for the tenant.
 */
export async function isPageEnabled(schoolId: string, pageKey: string): Promise<boolean> {
  const pages = await getSchoolPages(schoolId);
  const found = pages.find((p) => p.pageKey === pageKey || p.slug === pageKey);
  return found ? found.isEnabled : true;
}
