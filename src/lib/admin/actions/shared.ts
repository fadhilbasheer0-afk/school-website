import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/auth";
import {
  SCHOOL_ASSETS_BUCKET,
  bucketFromPublicUrl,
  isStoredInAppBucket,
  pathFromPublicUrl,
} from "@/lib/storage";
import { revalidateContent } from "@/lib/admin/revalidate";
import type { ActionResult } from "@/lib/admin/types";

export const fail = (error: string): ActionResult => ({ ok: false, error });

export const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
export const num = (v: unknown, fallback = 0) => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
export const bool = (v: unknown, fallback = false) =>
  typeof v === "boolean" ? v : fallback;
export const dateOrNull = (v: unknown) => {
  const s = str(v);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};
export const timeOrNull = (v: unknown) => {
  const s = str(v);
  return /^\d{2}:\d{2}(:\d{2})?$/.test(s) ? s : null;
};
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const TABLE_ALLOWLIST = new Set([
  "home_content",
  "home_hero_slides",
  "home_statistics",
  "about_content",
  "academic_content",
  "academic_classes",
  "academic_departments",
  "academic_calendar",
  "documents",
  "teachers",
  "facilities",
  "activities",
  "achievements",
  "gallery_albums",
  "gallery_photos",
  "announcements",
  "events",
  "admissions",
  "contact_information",
]);

export const assertTable = (table: string) => {
  if (!TABLE_ALLOWLIST.has(table)) throw new Error("Invalid table.");
  return table;
};

const FIELD_ALLOWLIST: Record<string, string[]> = {
  is_active: [
    "home_content",
    "home_hero_slides",
    "home_statistics",
    "about_content",
    "academic_content",
    "academic_classes",
    "academic_departments",
    "academic_calendar",
    "documents",
    "teachers",
    "facilities",
    "activities",
    "achievements",
    "gallery_albums",
    "gallery_photos",
    "admissions",
    "contact_information",
  ],
  is_published: ["announcements", "events"],
  is_featured: ["announcements", "events"],
};

export async function requireAdminOrNull() {
  const session = await getAdminSession();
  if (!session) return null;
  if (session.role !== "owner" && session.role !== "admin") return null;
  return session;
}

export async function writeRow(
  session: { schoolId: string | null },
  table: string,
  input: { id?: string },
  payload: Record<string, unknown>
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = input.id
    ? await supabase
        .from(assertTable(table))
        .update(payload)
        .eq("id", input.id)
    : await supabase
        .from(assertTable(table))
        .insert({ ...payload, school_id: session.schoolId });
  if (error) return fail(error.message);
  revalidateContent(table);
  return { ok: true };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  schoolId: string,
  base: string,
  excludeId?: string
) {
  const root = slugify(base) || "item";
  let slug = root;
  let i = 1;
  for (;;) {
    let query = supabase
      .from(table)
      .select("id")
      .eq("school_id", schoolId)
      .eq("slug", slug);
    if (excludeId) {
      query = query.neq("id", excludeId);
    }
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    i += 1;
    slug = `${root}-${i}`;
  }
}

export async function resolveSlug(
  table: string,
  schoolId: string,
  title: string,
  existing?: string,
  excludeId?: string
) {
  if (existing) return existing;
  const supabase = await createClient();
  return uniqueSlug(supabase, table, schoolId, title, excludeId);
}

/* ------------------------------------------------------------------ */
/* Generic row operations (allowlisted tables)                         */
/* ------------------------------------------------------------------ */

/** Columns that may hold a reference to a file in Supabase Storage. */
const STORAGE_REF_COLUMNS = [
  "image_url",
  "cover_image_url",
  "attachment_url",
  "file_url",
  "storage_path",
];

/**
 * Removes the storage objects referenced by a row (best-effort). Accepts
 * public URLs (`image_url` etc.) or raw object paths (`storage_path`).
 */
async function removeRowStorageObjects(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  id: string
): Promise<void> {
  try {
    const { data: row } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();
    if (!row) return;

    const pathsByBucket = new Map<string, string[]>();
    const push = (bucket: string, path: string) => {
      const list = pathsByBucket.get(bucket) ?? [];
      list.push(path);
      pathsByBucket.set(bucket, list);
    };

    const collect = (value: unknown) => {
      if (typeof value !== "string" || !value) return;
      if (isStoredInAppBucket(value)) {
        const bucket = bucketFromPublicUrl(value);
        const path = pathFromPublicUrl(value);
        if (bucket && path) push(bucket, path);
      } else {
        // Raw object path (e.g. storage_path) — uploads always target school-assets.
        push(SCHOOL_ASSETS_BUCKET, value);
      }
    };

    for (const column of STORAGE_REF_COLUMNS) {
      collect(row[column]);
    }

    // Deleting an album cascades to its photos in the database; clean up the
    // photo objects too so they do not become orphans in Storage.
    if (table === "gallery_albums") {
      const { data: photos } = await supabase
        .from("gallery_photos")
        .select("image_url, storage_path")
        .eq("album_id", id);
      for (const photo of photos ?? []) {
        for (const column of ["image_url", "storage_path"] as const) {
          collect(photo[column]);
        }
      }
    }

    for (const [bucket, paths] of pathsByBucket) {
      await supabase.storage.from(bucket).remove(paths);
    }
  } catch {
    /* storage cleanup must never fail the record deletion */
  }
}

export async function deleteRow(
  table: string,
  id: string
): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  const supabase = await createClient();
  await removeRowStorageObjects(supabase, assertTable(table), id);
  const { error } = await supabase
    .from(assertTable(table))
    .delete()
    .eq("id", id);
  if (error) return fail(error.message);
  revalidateContent(table);
  return { ok: true };
}

async function setFlag(
  table: string,
  id: string,
  field: keyof typeof FIELD_ALLOWLIST,
  value: boolean
): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  if (!FIELD_ALLOWLIST[field]?.includes(table)) return fail("Invalid table.");
  const supabase = await createClient();
  const { error } = await supabase
    .from(assertTable(table))
    .update({ [field]: value })
    .eq("id", id);
  if (error) return fail(error.message);
  revalidateContent(table);
  return { ok: true };
}

export const setActiveRow = (table: string, id: string, value: boolean) =>
  setFlag(table, id, "is_active", value);

export const setPublishedRow = (table: string, id: string, value: boolean) =>
  setFlag(table, id, "is_published", value);

export const setFeaturedRow = (table: string, id: string, value: boolean) =>
  setFlag(table, id, "is_featured", value);

export async function moveRow(
  table: string,
  id: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  const supabase = await createClient();

  const { data: current } = await supabase
    .from(assertTable(table))
    .select("id, sort_order")
    .eq("id", id)
    .single();

  if (!current) return fail("Record not found.");

  const { data: neighbor } = await supabase
    .from(assertTable(table))
    .select("id, sort_order")
    .eq("school_id", session.schoolId)
    .filter(
      "sort_order",
      direction === "up" ? "lt" : "gt",
      current.sort_order
    )
    .order("sort_order", { ascending: direction === "up" ? false : true })
    .limit(1)
    .maybeSingle();

  if (!neighbor) return { ok: true };

  const currentOrder = num(current.sort_order, 0);
  const neighborOrder = num(neighbor.sort_order, 0);

  const { error: e1 } = await supabase
    .from(assertTable(table))
    .update({ sort_order: neighborOrder })
    .eq("id", current.id);
  if (e1) return fail(e1.message);

  const { error: e2 } = await supabase
    .from(assertTable(table))
    .update({ sort_order: currentOrder })
    .eq("id", neighbor.id);
  if (e2) return fail(e2.message);

  revalidateContent(table);
  return { ok: true };
}
