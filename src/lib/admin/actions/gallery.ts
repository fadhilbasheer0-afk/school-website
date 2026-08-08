"use server";

import {
  fail,
  str,
  num,
  bool,
  dateOrNull,
  requireAdminOrNull,
  writeRow,
  resolveSlug,
  deleteRow,
  setActiveRow,
  moveRow,
} from "./shared";
import { createClient } from "@/lib/supabase/server";
import { revalidateContent } from "@/lib/admin/revalidate";
import type { ActionResult } from "@/lib/admin/types";

export async function deleteRecord(
  table: string,
  id: string
): Promise<ActionResult> {
  return deleteRow(table, id);
}
export async function setActive(
  table: string,
  id: string,
  value: boolean
): Promise<ActionResult> {
  return setActiveRow(table, id, value);
}
export async function moveRecord(
  table: string,
  id: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  return moveRow(table, id, direction);
}

export async function saveGalleryAlbum(input: {
  id?: string;
  slug?: string;
  title?: string;
  description?: string;
  cover_image_url?: string;
  storage_path?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  if (!session.schoolId) return fail("No school attached to this account.");
  const title = str(input.title);
  if (!title) return fail("Title is required.");
  const slug = await resolveSlug(
    "gallery_albums",
    session.schoolId,
    title,
    str(input.slug),
    input.id
  );
  const supabase = await createClient();
  const payload = {
    slug,
    title,
    description: str(input.description),
    cover_image_url: str(input.cover_image_url),
    storage_path: str(input.storage_path),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  };
  const { error } = input.id
    ? await supabase.from("gallery_albums").update(payload).eq("id", input.id)
    : await supabase
        .from("gallery_albums")
        .insert({ ...payload, school_id: session.schoolId });
  if (error) return fail(error.message);
  revalidateContent("gallery_albums");
  return { ok: true };
}

export async function saveGalleryPhoto(input: {
  id?: string;
  album_id?: string;
  title?: string;
  description?: string;
  image_url?: string;
  storage_path?: string;
  alt_text?: string;
  captured_at?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  const albumId = str(input.album_id);
  if (!albumId) return fail("An album is required.");
  const imageUrl = str(input.image_url);
  if (!imageUrl) return fail("Image URL is required.");
  return writeRow(session, "gallery_photos", input, {
    album_id: albumId,
    title: str(input.title),
    description: str(input.description),
    image_url: imageUrl,
    storage_path: str(input.storage_path),
    alt_text: str(input.alt_text),
    captured_at: dateOrNull(input.captured_at),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  });
}

export interface BulkPhotoInput {
  title?: string;
  description?: string;
  image_url?: string;
  storage_path?: string;
  alt_text?: string;
  captured_at?: string;
}

/** Creates multiple gallery photos (from a multi-file upload) in one call. */
export async function saveGalleryPhotosBatch(input: {
  album_id?: string;
  items?: BulkPhotoInput[];
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  if (!session.schoolId) return fail("No school attached to this account.");
  const albumId = str(input.album_id);
  if (!albumId) return fail("An album is required.");
  const items = Array.isArray(input.items) ? input.items : [];
  if (items.length === 0) return fail("No photos to add.");

  const rows = items.map((item, index) => {
    const imageUrl = str(item.image_url);
    if (!imageUrl) return null;
    return {
      school_id: session.schoolId,
      album_id: albumId,
      title: str(item.title),
      description: str(item.description),
      image_url: imageUrl,
      storage_path: str(item.storage_path),
      alt_text: str(item.alt_text),
      captured_at: dateOrNull(item.captured_at),
      sort_order: index + 1,
      is_active: true,
    };
  });

  const valid = rows.filter((r) => r !== null);
  if (valid.length === 0) return fail("Image URL is required for each photo.");

  const supabase = await createClient();
  const { error } = await supabase.from("gallery_photos").insert(valid);
  if (error) return fail(error.message);
  revalidateContent("gallery_photos");
  return { ok: true };
}
