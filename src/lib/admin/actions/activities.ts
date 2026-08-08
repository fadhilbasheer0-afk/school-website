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

export async function saveActivity(input: {
  id?: string;
  slug?: string;
  name?: string;
  category?: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  if (!session.schoolId) return fail("No school attached to this account.");
  const name = str(input.name);
  if (!name) return fail("Name is required.");
  const slug = await resolveSlug(
    "activities",
    session.schoolId,
    name,
    str(input.slug),
    input.id
  );
  const supabase = await createClient();
  const payload = {
    slug,
    name,
    category: str(input.category),
    description: str(input.description),
    image_url: str(input.image_url),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  };
  const { error } = input.id
    ? await supabase.from("activities").update(payload).eq("id", input.id)
    : await supabase
        .from("activities")
        .insert({ ...payload, school_id: session.schoolId });
  if (error) return fail(error.message);
  revalidateContent("activities");
  return { ok: true };
}

export async function saveAchievement(input: {
  id?: string;
  title?: string;
  category?: string;
  description?: string;
  achieved_at?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  const title = str(input.title);
  if (!title) return fail("Title is required.");
  return writeRow(session, "achievements", input, {
    title,
    category: str(input.category),
    description: str(input.description),
    achieved_at: dateOrNull(input.achieved_at),
    image_url: str(input.image_url),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  });
}
