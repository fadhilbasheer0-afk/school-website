/**
 * Shared cache-tag registry for the multi-tenant public content cache.
 *
 * Public fetchers in `@/lib/content` and `@/lib/tenant` are wrapped in `unstable_cache()` and
 * tagged with one of these tags. Admin server actions call
 * `revalidateContent()` (@/lib/admin/revalidate) after every write, which
 * invalidates the affected tags and routes so CMS edits appear on the public
 * site.
 *
 * This module is import-safe from both the public server layer and the admin
 * server-action layer (it has no server-only imports).
 */

export const CACHE_TAGS = {
  home: "content-home",
  about: "content-about",
  academics: "content-academics",
  admissions: "content-admissions",
  contact: "content-contact",
  facilities: "content-facilities",
  faculty: "content-faculty",
  gallery: "content-gallery",
  news: "content-news",
  events: "content-events",
  activities: "content-activities",
  achievements: "content-achievements",
  settings: "content-settings",
  pages: "content-pages",
  sections: "content-sections",
  themes: "content-themes",
  custom_pages: "content-custom-pages",
  domains: "content-domains",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * Maps a CMS table to the public cache tags + public routes it affects.
 *
 *   tags         — unstable_cache tags invalidated with updateTag() after a write
 *   paths        — literal public routes that must re-render
 *   pagePatterns — SSG detail routes (dynamic segments) that must re-render
 *   purgeClient  — site-wide change: purge the client router cache too
 */
export const TABLE_CONTENT_MAP: Record<
  string,
  {
    tags: CacheTag[];
    paths: string[];
    pagePatterns?: string[];
    purgeClient?: boolean;
  }
> = {
  // Home
  home_content: { tags: [CACHE_TAGS.home], paths: ["/"], purgeClient: true },
  home_hero_slides: { tags: [CACHE_TAGS.home], paths: ["/"], purgeClient: true },
  home_statistics: { tags: [CACHE_TAGS.home], paths: ["/"], purgeClient: true },
  school_homepage_sections: { tags: [CACHE_TAGS.sections, CACHE_TAGS.home], paths: ["/"], purgeClient: true },
  achievements: {
    tags: [CACHE_TAGS.achievements, CACHE_TAGS.home],
    paths: ["/", "/activities"],
    purgeClient: true,
  },
  // About
  about_content: { tags: [CACHE_TAGS.about], paths: ["/about"] },
  // Academics
  academic_content: { tags: [CACHE_TAGS.academics], paths: ["/academics"] },
  academic_classes: { tags: [CACHE_TAGS.academics], paths: ["/academics"] },
  academic_departments: { tags: [CACHE_TAGS.academics], paths: ["/academics"] },
  academic_calendar: { tags: [CACHE_TAGS.academics], paths: ["/academics"] },
  documents: { tags: [CACHE_TAGS.academics], paths: ["/academics"] },
  // Admissions
  admissions: { tags: [CACHE_TAGS.admissions], paths: ["/admissions"] },
  // Contact
  contact_information: { tags: [CACHE_TAGS.contact], paths: ["/contact"] },
  school_settings: {
    tags: [CACHE_TAGS.settings, CACHE_TAGS.home, CACHE_TAGS.contact],
    paths: ["/", "/contact"],
    purgeClient: true,
  },
  school_themes: {
    tags: [CACHE_TAGS.themes, CACHE_TAGS.settings, CACHE_TAGS.home],
    paths: ["/"],
    purgeClient: true,
  },
  school_pages: {
    tags: [CACHE_TAGS.pages, CACHE_TAGS.settings, CACHE_TAGS.home],
    paths: ["/", "/about", "/academics", "/faculty", "/facilities", "/activities", "/gallery", "/events", "/admissions", "/news", "/contact"],
    purgeClient: true,
  },
  custom_pages: {
    tags: [CACHE_TAGS.custom_pages],
    paths: ["/"],
    pagePatterns: ["/p/[slug]"],
    purgeClient: true,
  },
  school_domains: {
    tags: [CACHE_TAGS.domains],
    paths: ["/"],
    purgeClient: true,
  },
  // Directory / content lists
  facilities: { tags: [CACHE_TAGS.facilities], paths: ["/facilities"] },
  teachers: { tags: [CACHE_TAGS.faculty], paths: ["/faculty"] },
  gallery_albums: {
    tags: [CACHE_TAGS.gallery],
    paths: ["/gallery"],
    pagePatterns: ["/gallery/[slug]"],
  },
  gallery_photos: {
    tags: [CACHE_TAGS.gallery],
    paths: ["/gallery"],
    pagePatterns: ["/gallery/[slug]"],
  },
  announcements: {
    tags: [CACHE_TAGS.news],
    paths: ["/news"],
    pagePatterns: ["/news/[slug]"],
  },
  events: {
    tags: [CACHE_TAGS.events],
    paths: ["/events"],
    pagePatterns: ["/events/[slug]"],
  },
  activities: { tags: [CACHE_TAGS.activities], paths: ["/activities"] },
};
