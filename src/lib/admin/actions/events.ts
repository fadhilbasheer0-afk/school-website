"use server";

import {
  fail,
  str,
  bool,
  dateOrNull,
  timeOrNull,
  isEmail,
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

export async function saveEvent(input: {
  id?: string;
  slug?: string;
  title?: string;
  category?: string;
  description?: string;
  start_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  image_url?: string;
  registration_url?: string;
  contact_email?: string;
  is_featured?: boolean;
  is_published?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  if (!session.schoolId) return fail("No school attached to this account.");
  const title = str(input.title);
  if (!title) return fail("Title is required.");
  const startDate = dateOrNull(input.start_date);
  if (!startDate) return fail("A start date is required (YYYY-MM-DD).");
  const contactEmail = str(input.contact_email);
  if (contactEmail && !isEmail(contactEmail)) {
    return fail("Enter a valid contact email.");
  }
  const slug = await resolveSlug(
    "events",
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
    description: str(input.description),
    start_date: startDate,
    start_time: timeOrNull(input.start_time),
    end_time: timeOrNull(input.end_time),
    venue: str(input.venue),
    image_url: str(input.image_url),
    registration_url: str(input.registration_url),
    contact_email: contactEmail || null,
    is_featured: bool(input.is_featured, false),
    is_published: bool(input.is_published, false),
  };
  const { error } = input.id
    ? await supabase.from("events").update(payload).eq("id", input.id)
    : await supabase
        .from("events")
        .insert({ ...payload, school_id: session.schoolId });
  if (error) return fail(error.message);
  revalidateContent("events");
  return { ok: true };
}
