"use client";

import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SCHOOL_ASSETS_BUCKET,
  buildStoragePath,
  isStoredInAppBucket,
  pathFromPublicUrl,
  validateFile,
  bucketFromPublicUrl,
  type StorageKind,
} from "@/lib/storage";

export interface StoredFile {
  url: string;
  path: string;
  name: string;
}

function requireSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Supabase is not configured on this site.");
  }
  return url.replace(/\/$/, "");
}

/**
 * Resolves the authenticated user's school id so uploads land in the
 * `{schoolId}/{folder}/...` layout required by the storage RLS policy.
 * Returns null when the profile is missing (RLS would reject the upload).
 */
async function getCurrentSchoolId(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .maybeSingle();
  return typeof data?.school_id === "string" && data.school_id
    ? data.school_id
    : null;
}

/**
 * Uploads a single file to `school-assets/{folder}` with a live progress
 * callback. Uses a raw XMLHttpRequest against the Storage REST API so the
 * caller gets real progress events; falls back to the supabase-js upload
 * (without granular progress) when no session token is available.
 */
export async function uploadFileToStorage(
  folder: string,
  file: File,
  kind: StorageKind,
  onProgress?: (percent: number) => void
): Promise<StoredFile> {
  const validation = validateFile(file, kind);
  if (!validation.ok) throw new Error(validation.error);

  const supabase = createClient();
  const schoolId = await getCurrentSchoolId(supabase);
  if (!schoolId) {
    throw new Error("Unable to resolve your school. Make sure you are signed in as an admin.");
  }
  const path = buildStoragePath(schoolId, folder, file);
  onProgress?.(0);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (token) {
    const url = `${requireSupabaseUrl()}/storage/v1/object/${SCHOOL_ASSETS_BUCKET}/${encodePath(path)}`;
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(100);
          resolve();
        } else {
          let message = `Upload failed (${xhr.status}).`;
          try {
            const body = JSON.parse(xhr.responseText) as { message?: string };
            if (body?.message) message = body.message;
          } catch {
            /* keep the generic message */
          }
          reject(new Error(message));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload."));
      xhr.ontimeout = () => reject(new Error("Upload timed out."));
      xhr.send(file);
    });
  } else {
    const { error } = await supabase.storage
      .from(SCHOOL_ASSETS_BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    onProgress?.(100);
  }

  const { data: publicData } = supabase.storage
    .from(SCHOOL_ASSETS_BUCKET)
    .getPublicUrl(path);
  return { url: publicData.publicUrl, path, name: file.name };
}

/**
 * Uploads several files sequentially, reporting aggregate progress. Stops at
 * the first failure and deletes the files uploaded before it.
 */
export async function uploadFilesToStorage(
  folder: string,
  files: File[],
  kind: StorageKind,
  onProgress?: (percent: number) => void
): Promise<StoredFile[]> {
  const stored: StoredFile[] = [];
  let completed = 0;
  try {
    for (const file of files) {
      const uploaded = await uploadFileToStorage(folder, file, kind, (p) => {
        const overall = Math.round(((completed + p / 100) / files.length) * 100);
        onProgress?.(overall);
      });
      stored.push(uploaded);
      completed += 1;
    }
    onProgress?.(100);
    return stored;
  } catch (err) {
    await deleteStoredObjects(stored.map((s) => s.path));
    throw err;
  }
}

function encodePath(path: string): string {
  return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

/**
 * Deletes objects from storage. Accepts public URLs or object paths. Failures
 * are swallowed so a stale reference can never break a UI action.
 */
export async function deleteStoredObjects(
  refs: (string | null | undefined)[]
): Promise<void> {
  const supabase = createClient();
  for (const ref of refs) {
    if (!ref) continue;
    const bucket = isStoredInAppBucket(ref) ? bucketFromPublicUrl(ref) : SCHOOL_ASSETS_BUCKET;
    const path = isStoredInAppBucket(ref) ? pathFromPublicUrl(ref) : ref;
    if (!bucket || !path) continue;
    try {
      await supabase.storage.from(bucket).remove([path]);
    } catch {
      /* ignore — the object may already be gone */
    }
  }
}
