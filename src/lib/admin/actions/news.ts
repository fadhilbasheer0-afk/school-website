"use server";

import {
  fail,
  str,
  bool,
  requireAdminOrNull,
  resolveSlug,
  deleteRow,
  setPublishedRow,
  setFeaturedRow,
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
export async function setPublished(
  table: string,
  id: string,
  value: boolean
): Promise<ActionResult> {
  return setPublishedRow(table, id, value);
}
export async function setFeatured(
  table: string,
  id: string,
  value: boolean
): Promise<ActionResult> {
  return setFeaturedRow(table, id, value);
}

export async function saveAnnouncement(input: {
  id?: string;
  slug?: string;
  title?: string;
  category?: string;
  summary?: string;
  content?: string;
  author?: string;
  image_url?: string;
  attachment_url?: string;
  published_at?: string;
  is_featured?: boolean;
  is_published?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  if (!session.schoolId) return fail("No school attached to this account.");
  const title = str(input.title);
  if (!title) return fail("Title is required.");
  const isPublished = bool(input.is_published, false);
  const publishedAt =
    str(input.published_at) || (isPublished ? new Date().toISOString() : null);
  const slug = await resolveSlug(
    "announcements",
    session.schoolId,
    title,
    str(input.slug),
    input.id
  );
  const supabase = await createClient();
  const payload = {
    slug,
    title,
    category: str(input.category),
    summary: str(input.summary),
    content: str(input.content),
    author: str(input.author),
    image_url: str(input.image_url),
    attachment_url: str(input.attachment_url),
    published_at: publishedAt,
    is_featured: bool(input.is_featured, false),
    is_published: isPublished,
  };
  const { error } = input.id
    ? await supabase.from("announcements").update(payload).eq("id", input.id)
    : await supabase
        .from("announcements")
        .insert({ ...payload, school_id: session.schoolId });
  if (error) return fail(error.message);
  revalidateContent("announcements");
  return { ok: true };
}
