"use server";

import {
  fail,
  str,
  num,
  bool,
  requireAdminOrNull,
  writeRow,
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

export async function saveHomeSettings(input: {
  id?: string;
  school_name?: string;
  tagline?: string;
  logo_url?: string;
  favicon_url?: string;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  if (!session.schoolId) return fail("No school attached to this account.");
  const supabase = await createClient();
  const { error } = await supabase
    .from("school_settings")
    .update({
      school_name: str(input.school_name),
      tagline: str(input.tagline),
      logo_url: str(input.logo_url),
      favicon_url: str(input.favicon_url),
    })
    .eq("school_id", session.schoolId);
  if (error) return fail(error.message);
  revalidateContent("school_settings");
  return { ok: true };
}

export async function saveHomeContent(input: {
  id?: string;
  section_key?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  image_url?: string;
  cta_label?: string;
  cta_url?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  const sectionKey = str(input.section_key);
  const title = str(input.title);
  if (!sectionKey) return fail("Section key is required.");
  if (!title) return fail("Title is required.");
  return writeRow(session, "home_content", input, {
    section_key: sectionKey,
    title,
    subtitle: str(input.subtitle),
    body: str(input.body),
    image_url: str(input.image_url),
    cta_label: str(input.cta_label),
    cta_url: str(input.cta_url),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  });
}

export async function saveHeroSlide(input: {
  id?: string;
  title?: string;
  subtitle?: string;
  image_url?: string;
  cta_label?: string;
  cta_url?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  const title = str(input.title);
  if (!title) return fail("Title is required.");
  return writeRow(session, "home_hero_slides", input, {
    title,
    subtitle: str(input.subtitle),
    image_url: str(input.image_url),
    cta_label: str(input.cta_label),
    cta_url: str(input.cta_url),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  });
}

export async function saveStatistic(input: {
  id?: string;
  label?: string;
  value?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  const label = str(input.label);
  const value = str(input.value);
  if (!label) return fail("Label is required.");
  if (!value) return fail("Value is required.");
  return writeRow(session, "home_statistics", input, {
    label,
    value,
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  });
}
