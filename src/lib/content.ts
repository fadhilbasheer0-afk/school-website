import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/public";
import { CACHE_TAGS } from "@/lib/cache";
import { siteConfig } from "@/lib/site";
import { MOCK_TENANTS } from "@/lib/tenant";
import {
  newsArticles,
  type NewsArticle,
  type NewsCategory,
} from "@/data/news";
import {
  events as staticEvents,
  type SchoolEvent,
  type EventCategory,
} from "@/data/events";
import {
  facultyMembers,
  type FacultyMember,
  type FacultyDepartment,
  type FacultyType,
} from "@/data/faculty";
import {
  galleryImages,
  type GalleryImage,
  type GalleryCategory,
} from "@/data/gallery";
import {
  activities as staticActivities,
  type ActivityItem,
  type ActivityCategory,
} from "@/data/activities";
import {
  facilities as staticFacilities,
  type FacilityCategory,
} from "@/data/facilities";

/**
 * Public data access layer.
 *
 * Every fetcher prefers live Supabase rows and transparently falls back to the
 * static seed modules in `src/data` (or to `siteConfig` / inline defaults)
 * whenever Supabase is unconfigured, the query fails, or the table has no rows
 * yet. Server Components call these functions directly.
 *
 * Caching:
 *  - Reads use an ANON-ONLY, cookie-free client (`@/lib/supabase/public`), so
 *    queries run under RLS without touching request cookies.
 *  - Every fetcher is wrapped in `unstable_cache()` tagged with
 *    `CACHE_TAGS.*`. Admin writes call `revalidateContent()` (see
 *    `@/lib/admin/revalidate`) which invalidates the affected tags/routes so
 *    CMS edits appear on the public site immediately.
 */

type Row = Record<string, any>;

/* ─── helpers ─────────────────────────────────────────────── */

const NEWS_CATEGORIES: NewsCategory[] = [
  "Academic",
  "Science & STEM",
  "Sports",
  "Arts & Drama",
  "Community",
];

const EVENT_CATEGORIES: EventCategory[] = [
  "Academic",
  "Sports",
  "Arts & Culture",
  "Community",
];

const FACULTY_DEPARTMENTS: FacultyDepartment[] = [
  "Leadership",
  "STEM",
  "Humanities",
  "Languages",
  "Arts",
  "Athletics",
];

const GALLERY_CATEGORIES: GalleryCategory[] = [
  "Academics",
  "Athletics",
  "Arts",
  "Campus Life",
];

const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  "sports",
  "arts",
  "cultural",
  "clubs",
  "competitions",
  "awards",
  "student-achievements",
  "school-achievements",
];

function inList<T extends string>(value: unknown, list: readonly T[], fallback: T): T {
  const v = String(value ?? "");
  return (list as readonly string[]).includes(v) ? (v as T) : fallback;
}

/**
 * Strips HTML/script fragments and control characters from admin-authored text
 * before it reaches the public site. React escapes rendered text by default,
 * but this is defense-in-depth for content that may contain markup and is
 * cheap to apply on every field read.
 */
export function sanitizeText(value: unknown): string {
  return asString(value)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*(iframe|object|embed|form)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\s(on\w+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .trim();
}

/** Only allows safe URL schemes and relative/internal links. */
export function safeUrl(value: unknown): string {
  const v = asString(value).trim();
  if (!v) return "";
  if (/^(javascript|data|vbscript):/i.test(v)) return "";
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
  if (v.startsWith("/") || v.startsWith("#") || v.startsWith("?") || v.startsWith(".")) return v;
  return "";
}

function asString(value: unknown): string {
  if (typeof value !== "string") return "";
  // Defense-in-depth: sanitize every string read from the DB before public
  // rendering. Plain text passes through untouched; embedded HTML/scripts and
  // control characters are stripped.
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*(iframe|object|embed|form)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\s(on\w+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .trim();
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter((s) => s.length > 0);
  }
  if (typeof value === "string") return value ? [value] : [];
  return [];
}

function dateOnly(value: unknown): string {
  const v = asString(value);
  return v.slice(0, 10);
}

function timeHM(value: unknown): string {
  const v = asString(value);
  return v.slice(0, 5) || "00:00";
}

/** Splits a DB text body into display paragraphs. */
function toParagraphs(content: unknown, fallbackParagraph?: string): string[] {
  const text = asString(content).trim();
  if (!text) return fallbackParagraph ? [fallbackParagraph] : [];
  const split = text.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 0);
  return split.length > 0 ? split : [text];
}

/**
 * Resolves the default (public) school's id so public reads are scoped to the
 * public tenant. Returns null when the school row is missing — RLS still
 * guarantees only active schools' content is visible anonymously.
 */
const DEFAULT_SCHOOL_SLUG = "demo-school";
const DEFAULT_SCHOOL_ID = "7a04d7c8-4b8e-4f0d-9f3c-2f6f6e4a1b5d";

async function getDefaultSchoolId(client: SupabaseClient): Promise<string | null> {
  try {
    const { data } = await client
      .from("schools")
      .select("id")
      .eq("is_default", true)
      .maybeSingle();
    if (data?.id) return data.id;

    const { data: fallbackSchool } = await client
      .from("schools")
      .select("id")
      .eq("slug", DEFAULT_SCHOOL_SLUG)
      .maybeSingle();
    return fallbackSchool?.id ?? DEFAULT_SCHOOL_ID;
  } catch {
    return DEFAULT_SCHOOL_ID;
  }
}

/** Runs a DB-backed callback, falling back when Supabase is unavailable. */
async function withClient<T>(
  fn: (client: SupabaseClient) => Promise<T>,
  fallback: T
): Promise<T> {
  if (!isSupabaseConfigured) return fallback;
  const client = createPublicClient();
  if (!client) return fallback;
  try {
    return await fn(client);
  } catch {
    return fallback;
  }
}

/** Generic table reader: maps rows to public types, falling back on any failure. */
async function fetchTable<T>(
  table: string,
  mapper: (row: Row) => T,
  fallback: T[],
  options?: {
    orderBy?: string;
    ascending?: boolean;
    scopeSchool?: boolean;
    schoolId?: string | null;
    eq?: Record<string, unknown>;
    limit?: number;
  }
): Promise<T[]> {
  return withClient(async (client) => {
    let schoolId: string | null = null;
    if (options?.scopeSchool !== false) {
      schoolId = options?.schoolId || (await getDefaultSchoolId(client));
    }
    let query = client.from(table).select("*");
    if (schoolId) query = query.eq("school_id", schoolId);
    if (options?.eq) {
      for (const [key, value] of Object.entries(options.eq)) query = query.eq(key, value);
    }
    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true });
    }
    if (options?.limit) query = query.limit(options.limit);
    const { data, error } = await query;
    if (error) throw error;
    const rows = (data ?? []) as Row[];
    if (rows.length === 0) return fallback;
    const mapped = rows.map(mapper);
    return mapped.length > 0 ? mapped : fallback;
  }, fallback);
}

/**
 * Wraps a public fetcher in the Next.js data cache so CMS edits can be pushed
 * to visitors via `updateTag` (see @/lib/admin/revalidate). The fallback
 * (static seed) is cached too — that only happens when Supabase is
 * unconfigured or a query fails.
 */
function cacheable<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  key: string[],
  tag: string
): T {
  const wrapped = unstable_cache(fn, ["content", ...key], {
    tags: [tag],
    revalidate: 60,
  });
  return wrapped as T;
}

/* ─── public types ────────────────────────────────────────── */

export interface PublicFacility {
  id: string;
  title: string;
  category: FacilityCategory;
  description: string;
  features: string[];
  mainImage: string;
  galleryImages: string[];
}

export interface HomeStat {
  value: string;
  label: string;
}

export interface HeroSlide {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  ctaLabel: string;
  ctaUrl: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
}

export interface SchoolSettings {
  schoolName: string;
  tagline: string;
  logoUrl: string | null;
  primaryColor: string | null;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  websiteUrl: string;
  mapUrl: string;
  coordinates: string;
  footerAbout: string;
  footerCopyright: string;
  officeHours: { label: string; value: string }[];
  socialLinks: Record<string, string>;
  contactForm: {
    enabled: boolean;
    recipientEmail: string | null;
    subjectPrefix: string | null;
  };
}

export interface ContactEntry {
  id: string;
  label: string;
  type: string;
  value: string;
  isPrimary: boolean;
}

export interface PublicAcademicClass {
  id: string;
  level: string;
  gradeLabel: string;
  ageRange: string;
  description: string;
}

export interface PublicDepartment {
  id: string;
  name: string;
  description: string;
}

export interface PublicCalendarEntry {
  id: string;
  title: string;
  dates: string;
  description: string;
}

export interface PublicDocument {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  category: string;
}

export interface AboutSection {
  title: string;
  body: string;
  imageUrl: string | null;
}

export interface AcademicData {
  classes: PublicAcademicClass[];
  departments: PublicDepartment[];
  calendar: PublicCalendarEntry[];
  documents: PublicDocument[];
}

export interface PublicAdmissionSection {
  id: string;
  sectionKey: string;
  title: string;
  body: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
}

export interface GalleryAlbumDetail {
  album: GalleryAlbum;
  photos: GalleryImage[];
}

/* ─── news / announcements ────────────────────────────────── */

function mapAnnouncement(row: Row): NewsArticle {
  const title = asString(row.title);
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title,
    category: inList(row.category, NEWS_CATEGORIES, "Community"),
    date: dateOnly(row.published_at ?? row.created_at),
    author: asString(row.author) || "Office of Communications",
    summary: asString(row.summary) || asString(row.content).slice(0, 160),
    content: toParagraphs(row.content, asString(row.summary)),
    image: asString(row.image_url) || `${title} — article photograph`,
    featured: Boolean(row.is_featured),
  };
}

async function fetchAnnouncements(_cursor?: undefined, schoolId?: string | null): Promise<NewsArticle[]> {
  return fetchTable(
    "announcements",
    mapAnnouncement,
    newsArticles,
    {
      orderBy: "published_at",
      ascending: false,
      eq: { is_published: true },
      schoolId,
    }
  );
}

export const getAnnouncements = cacheable(fetchAnnouncements, ["announcements"], CACHE_TAGS.news);

async function fetchAnnouncementBySlug(slug: string): Promise<NewsArticle | null> {
  return withClient(async (client) => {
    const schoolId = await getDefaultSchoolId(client);
    let query = client
      .from("announcements")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true);
    if (schoolId) query = query.eq("school_id", schoolId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapAnnouncement(data) : null;
  }, null);
}

export const getAnnouncementBySlug = cacheable(fetchAnnouncementBySlug, ["announcement"], CACHE_TAGS.news);

/* ─── events ──────────────────────────────────────────────── */

function mapEvent(row: Row): SchoolEvent {
  const startTime = timeHM(row.start_time);
  return {
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    category: inList(row.category, EVENT_CATEGORIES, "Community"),
    description: asString(row.description),
    startDate: asString(row.start_date),
    startTime,
    endTime: timeHM(row.end_time) || startTime,
    venue: asString(row.venue) || "Campus",
    image: asString(row.image_url) || `${asString(row.title)} — event photograph`,
  };
}

async function fetchEvents(schoolId?: string | null): Promise<SchoolEvent[]> {
  return fetchTable("events", mapEvent, staticEvents, {
    orderBy: "start_date",
    ascending: true,
    eq: { is_published: true },
    schoolId,
  });
}

export const getEvents = cacheable(fetchEvents, ["events"], CACHE_TAGS.events);

async function fetchEventBySlug(slug: string): Promise<SchoolEvent | null> {
  return withClient(async (client) => {
    const schoolId = await getDefaultSchoolId(client);
    let query = client
      .from("events")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true);
    if (schoolId) query = query.eq("school_id", schoolId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapEvent(data) : null;
  }, null);
}

export const getEventBySlug = cacheable(fetchEventBySlug, ["event"], CACHE_TAGS.events);

/* ─── faculty ─────────────────────────────────────────────── */

function mapTeacher(row: Row): FacultyMember {
  const department = inList(row.academic_departments?.name, FACULTY_DEPARTMENTS, "Humanities");
  const type: FacultyType = department === "Leadership" ? "leadership" : "faculty";
  return {
    id: asString(row.id),
    name: asString(row.name),
    role: asString(row.title) || "Faculty",
    department,
    education: asString(row.qualifications),
    experience: "",
    bio: asString(row.bio),
    email: asString(row.email) || undefined,
    phone: asString(row.phone) || undefined,
    type,
  };
}

async function fetchTeachers(_cursor?: undefined, schoolId?: string | null): Promise<FacultyMember[]> {
  return withClient(async (client) => {
    schoolId = schoolId || await getDefaultSchoolId(client);
    let query = client
      .from("teachers")
      .select("*, academic_departments(name)")
      .eq("is_active", true);
    if (schoolId) query = query.eq("school_id", schoolId);
    const { data, error } = await query.order("sort_order", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as Row[];
    if (rows.length === 0) return facultyMembers;
    const mapped = rows.map(mapTeacher);
    return mapped.length > 0 ? mapped : facultyMembers;
  }, facultyMembers);
}

export const getTeachers = cacheable(fetchTeachers, ["teachers"], CACHE_TAGS.faculty);

/* ─── gallery ─────────────────────────────────────────────── */

function mapPhoto(row: Row): GalleryImage {
  const title = asString(row.title) || asString(row.description) || "Campus photograph";
  const imageUrl = asString(row.image_url);
  const storagePath = asString(row.storage_path);
  return {
    id: asString(row.id),
    src: imageUrl || (storagePath.startsWith("http") ? storagePath : null),
    alt: asString(row.alt_text) || title,
    caption: asString(row.description) || undefined,
    category: inList(row.gallery_albums?.title, GALLERY_CATEGORIES, "Campus Life"),
    albumSlug: asString(row.gallery_albums?.slug) || undefined,
    order: Number(row.sort_order ?? 0),
  };
}

async function fetchGalleryImages(_cursor?: undefined, schoolId?: string | null): Promise<GalleryImage[]> {
  return withClient(async (client) => {
    schoolId = schoolId || await getDefaultSchoolId(client);
    let query = client
      .from("gallery_photos")
      .select("*, gallery_albums(slug, title)")
      .eq("is_active", true);
    if (schoolId) query = query.eq("school_id", schoolId);
    const { data, error } = await query.order("sort_order", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as Row[];
    if (rows.length === 0) return galleryImages;
    const mapped = rows.map(mapPhoto);
    return mapped.length > 0 ? mapped : galleryImages;
  }, galleryImages);
}

export const getGalleryImages = cacheable(fetchGalleryImages, ["gallery-photos"], CACHE_TAGS.gallery);

async function fetchGalleryAlbums(schoolId?: string | null): Promise<GalleryAlbum[]> {
  return withClient(async (client) => {
    schoolId = schoolId || await getDefaultSchoolId(client);
    let query = client
      .from("gallery_albums")
      .select("id, title, slug, description, cover_image_url")
      .eq("is_active", true);
    if (schoolId) query = query.eq("school_id", schoolId);
    const { data, error } = await query.order("sort_order", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as Row[];
    if (rows.length === 0) return [];
    return rows.map((row) => ({
      id: asString(row.id),
      title: asString(row.title),
      slug: asString(row.slug),
      description: asString(row.description),
      coverImage: asString(row.cover_image_url) || null,
    }));
  }, []);
}

export const getGalleryAlbums = cacheable(fetchGalleryAlbums, ["gallery-albums"], CACHE_TAGS.gallery);

async function fetchGalleryAlbumBySlug(slug: string): Promise<GalleryAlbumDetail | null> {
  return withClient(async (client) => {
    const schoolId = await getDefaultSchoolId(client);
    let albumQuery = client
      .from("gallery_albums")
      .select("id, title, slug, description, cover_image_url")
      .eq("slug", slug)
      .eq("is_active", true);
    if (schoolId) albumQuery = albumQuery.eq("school_id", schoolId);
    const { data: album, error } = await albumQuery.maybeSingle();
    if (error) throw error;
    if (!album) return null;

    const photosQuery = client
      .from("gallery_photos")
      .select("*, gallery_albums(slug, title)")
      .eq("album_id", album.id)
      .eq("is_active", true);
    const { data: photoRows } = await photosQuery.order("sort_order", { ascending: true });
    const photos = ((photoRows ?? []) as Row[]).map(mapPhoto);

    return {
      album: {
        id: asString(album.id),
        title: asString(album.title),
        slug: asString(album.slug),
        description: asString(album.description),
        coverImage: asString(album.cover_image_url) || null,
      },
      photos,
    };
  }, null);
}

export const getGalleryAlbumBySlug = cacheable(fetchGalleryAlbumBySlug, ["gallery-album"], CACHE_TAGS.gallery);

/* ─── activities ──────────────────────────────────────────── */

function mapActivity(row: Row): ActivityItem {
  return {
    id: asString(row.id),
    title: asString(row.name),
    category: inList(row.category, ACTIVITY_CATEGORIES, "clubs"),
    description: asString(row.description),
    date: "",
    image: asString(row.image_url) || `${asString(row.name)} — activity photograph`,
  };
}

async function fetchActivities(schoolId?: string | null): Promise<ActivityItem[]> {
  return fetchTable("activities", mapActivity, staticActivities, {
    orderBy: "sort_order",
    ascending: true,
    schoolId,
  });
}

export const getActivities = cacheable(fetchActivities, ["activities"], CACHE_TAGS.activities);

/* ─── facilities ──────────────────────────────────────────── */

function inferFacilityCategory(name: string): FacilityCategory {
  const n = name.toLowerCase();
  if (/(lab|science|library|computer|classroom|resource)/.test(n)) return "Academic";
  if (/(aquatic|pool|arena|track|sport|gym|field|stadium)/.test(n)) return "Sports";
  if (/(auditorium|studio|theatre|theater|art|music|performance)/.test(n)) return "Arts";
  if (/(playground|garden|outdoor|playfield|green)/.test(n)) return "Outdoor";
  return "Common";
}

function mapFacility(row: Row): PublicFacility {
  const name = asString(row.name);
  return {
    id: asString(row.id),
    title: name,
    category: inferFacilityCategory(name),
    description: asString(row.description),
    features: asStringArray(row.features),
    mainImage: asString(row.image_url) || `${name} — facility photograph`,
    galleryImages: [],
  };
}

const seedFacilities: PublicFacility[] = staticFacilities.map((f) => ({
  id: f.id,
  title: f.title,
  category: f.category,
  description: f.description,
  features: f.features,
  mainImage: f.mainImage,
  galleryImages: f.galleryImages,
}));

async function fetchFacilities(_cursor?: undefined, schoolId?: string | null): Promise<PublicFacility[]> {
  return fetchTable("facilities", mapFacility, seedFacilities, {
    orderBy: "sort_order",
    ascending: true,
    schoolId,
  });
}

export const getFacilities = cacheable(fetchFacilities, ["facilities"], CACHE_TAGS.facilities);

async function fetchFacilityBySlug(slug: string): Promise<PublicFacility | null> {
  return withClient(async (client) => {
    const schoolId = await getDefaultSchoolId(client);
    let query = client.from("facilities").select("*").eq("slug", slug).eq("is_active", true);
    if (schoolId) query = query.eq("school_id", schoolId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapFacility(data) : null;
  }, null);
}

export const getFacilityBySlug = cacheable(fetchFacilityBySlug, ["facility"], CACHE_TAGS.facilities);

/* ─── achievements / home stats / hero ────────────────────── */

async function fetchAchievements(schoolId?: string | null): Promise<AchievementItem[]> {
  const fallback: AchievementItem[] = [
    {
      id: "national-science-olympiad",
      title: "National Science Olympiad — Gold Medal",
      category: "Academic",
      description:
        "Grade 11 students secured first place in the chemistry and physics divisions at the 2026 National Science Olympiad.",
      date: "2026",
    },
    {
      id: "ib-diploma-98",
      title: "IB Diploma — 98% Pass Rate",
      category: "Academic",
      description:
        "Our 2025 graduating class achieved a 98% pass rate in the International Baccalaureate Diploma Programme, well above the global average of 80%.",
      date: "2025",
    },
    {
      id: "state-swim-5-gold",
      title: "State Swimming Championship — 5 Gold Medals",
      category: "Sports",
      description:
        "The school swim team won five individual gold medals and a team relay silver at the 2026 State Interschool Championships.",
      date: "2026",
    },
  ];
  return fetchTable(
    "achievements",
    (row: Row): AchievementItem => {
      const achievedAt = dateOnly(row.achieved_at);
      const createdAt = asString(row.created_at);
      return {
        id: asString(row.id),
        title: asString(row.title),
        category: asString(row.category) || "Achievement",
        description: asString(row.description),
        date: achievedAt || (createdAt ? createdAt.slice(0, 4) : ""),
      };
    },
    fallback,
    { orderBy: "sort_order", ascending: true, schoolId }
  );
}

export const getAchievements = cacheable(fetchAchievements, ["achievements"], CACHE_TAGS.achievements);

async function fetchHomeStats(schoolId?: string | null): Promise<HomeStat[]> {
  const fallback: HomeStat[] = [
    { value: "25+", label: "Years of Excellence" },
    { value: "1,200+", label: "Students Enrolled" },
    { value: "100%", label: "University Placement" },
    { value: "15:1", label: "Student–Teacher Ratio" },
    { value: "35+", label: "Nationalities" },
    { value: "40+", label: "Clubs & Activities" },
  ];
  return fetchTable(
    "home_statistics",
    (row: Row): HomeStat => ({
      value: asString(row.value),
      label: asString(row.label),
    }),
    fallback,
    { orderBy: "sort_order", ascending: true, schoolId }
  );
}

export const getHomeStats = cacheable(fetchHomeStats, ["home-stats"], CACHE_TAGS.home);

async function fetchHeroSlides(schoolId?: string | null): Promise<HeroSlide[]> {
  return fetchTable(
    "home_hero_slides",
    (row: Row): HeroSlide => ({
      title: asString(row.title),
      subtitle: asString(row.subtitle),
      imageUrl: asString(row.image_url) || null,
      ctaLabel: asString(row.cta_label),
      ctaUrl: asString(row.cta_url),
    }),
    [],
    { orderBy: "sort_order", ascending: true, schoolId }
  );
}

export const getHeroSlides = cacheable(fetchHeroSlides, ["hero-slides"], CACHE_TAGS.home);

/* ─── settings & contact ──────────────────────────────────── */

function fallbackSettings(schoolId?: string | null): SchoolSettings {
  let matchedMock = MOCK_TENANTS["demo-school"];
  if (schoolId) {
    const found = Object.values(MOCK_TENANTS).find(
      (m) => m.id === schoolId || m.slug === schoolId.toLowerCase()
    );
    if (found) matchedMock = found;
  }

  return {
    schoolName: matchedMock.name,
    tagline: matchedMock.motto || "",
    logoUrl: matchedMock.theme.logoUrl,
    primaryColor: matchedMock.theme.primaryColor,
    contactEmail: matchedMock.email || siteConfig.email,
    contactPhone: matchedMock.phone || siteConfig.phoneMain,
    contactAddress: matchedMock.address || [siteConfig.address.street, siteConfig.address.city].filter(Boolean).join(", "),
    websiteUrl: matchedMock.website || siteConfig.url,
    mapUrl: siteConfig.address.mapEmbedUrl,
    coordinates: siteConfig.address.gps,
    footerAbout: matchedMock.motto || siteConfig.description,
    footerCopyright: `© ${new Date().getFullYear()} ${matchedMock.name}. All rights reserved.`,
    officeHours: siteConfig.officeHours,
    socialLinks: siteConfig.social,
    contactForm: {
      enabled: true,
      recipientEmail: matchedMock.email || siteConfig.email,
      subjectPrefix: `[${matchedMock.name} Contact]`,
    },
  };
}

async function fetchSchoolSettings(schoolId?: string | null): Promise<SchoolSettings> {
  const fallback = fallbackSettings(schoolId);

  return withClient(async (client) => {
    let resolvedId = schoolId;
    if (!resolvedId) {
      resolvedId = await getDefaultSchoolId(client);
    }
    let query = client.from("school_settings").select("*");
    if (resolvedId) query = query.eq("school_id", resolvedId);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return fallback;

    const officeHours =
      Array.isArray(data.office_hours) && data.office_hours.length > 0
        ? data.office_hours.map((h: any) => ({
            label: asString(h?.label) || "Office Hours",
            value: asString(h?.value),
          }))
        : fallback.officeHours;

    const socialLinks =
      data.social_links && typeof data.social_links === "object"
        ? { ...fallback.socialLinks, ...(data.social_links as Record<string, string>) }
        : fallback.socialLinks;

    const contactForm =
      data.contact_form && typeof data.contact_form === "object"
        ? { ...fallback.contactForm, ...(data.contact_form as Record<string, unknown>) }
        : fallback.contactForm;

    return {
      schoolName: asString(data.school_name) || fallback.schoolName,
      tagline: asString(data.tagline) || fallback.tagline,
      logoUrl: asString(data.logo_url) || null,
      primaryColor: asString(data.primary_color) || null,
      contactEmail: asString(data.contact_email) || fallback.contactEmail,
      contactPhone: asString(data.contact_phone) || fallback.contactPhone,
      contactAddress: asString(data.contact_address) || fallback.contactAddress,
      websiteUrl: asString(data.website_url) || fallback.websiteUrl,
      mapUrl: asString(data.map_url) || fallback.mapUrl,
      coordinates: asString(data.coordinates) || fallback.coordinates,
      footerAbout: asString(data.footer_about) || fallback.footerAbout,
      footerCopyright: asString(data.footer_copyright) || fallback.footerCopyright,
      officeHours,
      socialLinks,
      contactForm,
    };
  }, fallback);
}

export const getSchoolSettings = cacheable(fetchSchoolSettings, ["school-settings"], CACHE_TAGS.settings);

async function fetchContactInfo(schoolId?: string | null): Promise<ContactEntry[]> {
  const fallback: ContactEntry[] = [
    {
      id: "address",
      label: "School Address",
      type: "address",
      value: `${siteConfig.address.street}, ${siteConfig.address.city}`,
      isPrimary: true,
    },
    {
      id: "phone",
      label: "Phone",
      type: "phone",
      value: siteConfig.phoneMain,
      isPrimary: true,
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      value: siteConfig.email,
      isPrimary: true,
    },
  ];
  return fetchTable(
    "contact_information",
    (row: Row): ContactEntry => ({
      id: asString(row.id),
      label: asString(row.label),
      type: asString(row.type) || "other",
      value: asString(row.value),
      isPrimary: Boolean(row.is_primary),
    }),
    fallback,
    { orderBy: "sort_order", ascending: true, schoolId }
  );
}

export const getContactInfo = cacheable(fetchContactInfo, ["contact-info"], CACHE_TAGS.contact);

/* ─── about & academics (CMS content sections) ────────────── */

async function fetchAboutSections(schoolId?: string | null): Promise<Record<string, AboutSection>> {
  return withClient(async (client) => {
    schoolId = schoolId || await getDefaultSchoolId(client);
    let query = client
      .from("about_content")
      .select("section_key, title, body, image_url")
      .eq("is_active", true);
    if (schoolId) query = query.eq("school_id", schoolId);
    const { data, error } = await query.order("sort_order", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as Row[];
    const result: Record<string, AboutSection> = {};
    for (const row of rows) {
      result[asString(row.section_key)] = {
        title: asString(row.title),
        body: asString(row.body),
        imageUrl: asString(row.image_url) || null,
      };
    }
    return result;
  }, {});
}

export const getAboutSections = cacheable(fetchAboutSections, ["about-sections"], CACHE_TAGS.about);

async function fetchAdmissions(schoolId?: string | null): Promise<PublicAdmissionSection[]> {
  return fetchTable(
    "admissions",
    (row: Row): PublicAdmissionSection => ({
      id: asString(row.id),
      sectionKey: asString(row.section_key),
      title: asString(row.title),
      body: asString(row.body),
    }),
    [],
    { orderBy: "sort_order", ascending: true, schoolId }
  );
}

export const getAdmissions = cacheable(fetchAdmissions, ["admissions"], CACHE_TAGS.admissions);

async function fetchAcademicData(schoolId?: string | null): Promise<AcademicData> {
  const [classes, departments, calendar, documents] = await Promise.all([
    fetchTable(
      "academic_classes",
      (row: Row): PublicAcademicClass => ({
        id: asString(row.id),
        level: asString(row.level),
        gradeLabel: asString(row.grade_label),
        ageRange: asString(row.age_range),
        description: asString(row.description),
      }),
      [],
      { orderBy: "sort_order", ascending: true, schoolId }
    ),
    fetchTable(
      "academic_departments",
      (row: Row): PublicDepartment => ({
        id: asString(row.id),
        name: asString(row.name),
        description: asString(row.description),
      }),
      [],
      { orderBy: "sort_order", ascending: true, schoolId }
    ),
    fetchTable(
      "academic_calendar",
      (row: Row): PublicCalendarEntry => ({
        id: asString(row.id),
        title: asString(row.title),
        dates: [asString(row.start_date), asString(row.end_date)].filter(Boolean).join(" – "),
        description: asString(row.description),
      }),
      [],
      { orderBy: "sort_order", ascending: true, schoolId }
    ),
    fetchTable(
      "documents",
      (row: Row): PublicDocument => ({
        id: asString(row.id),
        title: asString(row.title),
        description: asString(row.description),
        fileUrl: asString(row.file_url),
        category: asString(row.category),
      }),
      [],
      { orderBy: "sort_order", ascending: true, schoolId }
    ),
  ]);
  return { classes, departments, calendar, documents };
}

export const getAcademicData = cacheable(fetchAcademicData, ["academic-data"], CACHE_TAGS.academics);
