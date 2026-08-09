/**
 * Supabase Storage helpers — pure functions shared by the admin upload
 * components (client) and the server actions that clean up objects.
 *
 * Files live in the public `school-assets` bucket under one of the fixed
 * folders below. PostgreSQL stores the public URL (image_url / file_url) and,
 * where the column exists, the object path (storage_path).
 */

export const SCHOOL_ASSETS_BUCKET = "school-assets";

export const ASSET_FOLDERS = {
  logo: "logo",
  banners: "banners",
  teachers: "teachers",
  gallery: "gallery",
  facilities: "facilities",
  events: "events",
  achievements: "achievements",
  documents: "documents",
} as const;

export type AssetFolder = (typeof ASSET_FOLDERS)[keyof typeof ASSET_FOLDERS];

export type StorageKind = "image" | "document";

export interface FileTypeRule {
  accept: string[];
  maxBytes: number;
  label: string;
}

/** Allowed MIME types and size limits for each upload kind. */
export const FILE_TYPE_RULES: Record<StorageKind, FileTypeRule> = {
  image: {
    accept: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
    maxBytes: 5 * 1024 * 1024, // 5 MB
    label: "images (JPG, PNG, WebP, GIF or AVIF)",
  },
  document: {
    accept: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ],
    maxBytes: 10 * 1024 * 1024, // 10 MB
    label: "documents (PDF, Word, Excel, PowerPoint or text)",
  },
};

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${text} ${units[i]}`;
}

/** Sanitises a file name to safe ASCII characters and a sensible length. */
export function sanitizeFileName(name: string): string {
  const normalized = name
    .trim()
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "");
  const lastDot = normalized.lastIndexOf(".");
  const base = lastDot > 0 ? normalized.slice(0, lastDot) : normalized;
  const ext = lastDot > 0 ? normalized.slice(lastDot + 1) : "";
  const cleanBase = base
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  const stem = cleanBase || "file";
  return (cleanExt ? `${stem}.${cleanExt}` : stem).slice(0, 80) || "file";
}

/**
 * Builds the object path for a new upload.
 * Objects live under `{schoolId}/{folder}/{file}` so the storage RLS policy
 * can enforce that admins only write into their own school's folder.
 */
export function buildStoragePath(schoolId: string, folder: string, file: File): string {
  const safeName = sanitizeFileName(file.name);
  const cleanSchool = schoolId.replace(/^\/+|\/+$/g, "");
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  return `${cleanSchool}/${cleanFolder}/${Date.now()}-${safeName}`;
}

/** True when a MIME type is allowed for the given upload kind. */
export function isAllowedType(type: string, kind: StorageKind): boolean {
  return FILE_TYPE_RULES[kind].accept.includes((type || "").toLowerCase());
}

/** Validates a file against the rules for an upload kind. */
export function validateFile(
  file: File,
  kind: StorageKind
): { ok: true } | { ok: false; error: string } {
  const rule = FILE_TYPE_RULES[kind];
  if (!isAllowedType(file.type, kind)) {
    return {
      ok: false,
      error: `Unsupported file type “${file.type || "unknown"}”. Please upload ${rule.label}.`,
    };
  }
  if (file.size > rule.maxBytes) {
    return {
      ok: false,
      error: `File is too large (${formatBytes(file.size)}). Maximum size is ${formatBytes(rule.maxBytes)}.`,
    };
  }
  if (file.size === 0) {
    return { ok: false, error: "The selected file is empty." };
  }
  return { ok: true };
}

/** Extracts the object path from a public storage URL, or null when it is not a storage URL. */
export function pathFromPublicUrl(url: string): string | null {
  const match = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/.exec(url);
  return match ? decodeURIComponent(match[2]) : null;
}

/** Extracts the bucket name from a public storage URL, or null. */
export function bucketFromPublicUrl(url: string): string | null {
  const match = /\/storage\/v1\/object\/public\/([^/]+)\//.exec(url);
  return match ? decodeURIComponent(match[1]) : null;
}

/** True when the URL points at an object in one of the app's storage buckets. */
export function isStoredInAppBucket(url: string): boolean {
  const bucket = bucketFromPublicUrl(url);
  return bucket === SCHOOL_ASSETS_BUCKET || bucket === "school-media";
}
