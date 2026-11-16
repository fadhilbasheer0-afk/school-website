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

export async function saveAcademicContent(input: {
  id?: string;
  slug?: string;
  title?: string;
  summary?: string;
  body?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  if (!session.schoolId) return fail("No school attached to this account.");
  const title = str(input.title);
  if (!title) return fail("Title is required.");
  const slug = await resolveSlug(
    "academic_content",
    session.schoolId,
    title,
    str(input.slug),
    input.id
  );
  const supabase = await createClient();
  const payload = {
    slug,
    title,
    summary: str(input.summary),
    body: str(input.body),
    image_url: str(input.image_url),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  };
  const { error } = input.id
    ? await supabase.from("academic_content").update(payload).eq("id", input.id)
    : await supabase
        .from("academic_content")
        .insert({ ...payload, school_id: session.schoolId });
  if (error) return fail(error.message);
  revalidateContent("academic_content");
  return { ok: true };
}

const CLASS_LEVELS = ["Early Years", "Primary", "Middle", "High"];

export async function saveAcademicClass(input: {
  id?: string;
  level?: string;
  grade_label?: string;
  age_range?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  const gradeLabel = str(input.grade_label);
  if (!gradeLabel) return fail("Grade label is required.");
  const level = str(input.level);
  if (!CLASS_LEVELS.includes(level)) return fail("Select a valid class level.");
  return writeRow(session, "academic_classes", input, {
    level,
    grade_label: gradeLabel,
    age_range: str(input.age_range),
    description: str(input.description),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  });
}

export async function saveAcademicDepartment(input: {
  id?: string;
  slug?: string;
  name?: string;
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
    "academic_departments",
    session.schoolId,
    name,
    str(input.slug),
    input.id
  );
  const supabase = await createClient();
  const payload = {
    slug,
    name,
    description: str(input.description),
    image_url: str(input.image_url),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  };
  const { error } = input.id
    ? await supabase
        .from("academic_departments")
        .update(payload)
        .eq("id", input.id)
    : await supabase
        .from("academic_departments")
        .insert({ ...payload, school_id: session.schoolId });
  if (error) return fail(error.message);
  revalidateContent("academic_departments");
  return { ok: true };
}

export async function saveAcademicCalendar(input: {
  id?: string;
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  const title = str(input.title);
  if (!title) return fail("Title is required.");
  return writeRow(session, "academic_calendar", input, {
    title,
    description: str(input.description),
    start_date: dateOrNull(input.start_date),
    end_date: dateOrNull(input.end_date),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  });
}

export async function saveDocument(input: {
  id?: string;
  title?: string;
  description?: string;
  file_url?: string;
  category?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  const title = str(input.title);
  if (!title) return fail("Title is required.");
  return writeRow(session, "documents", input, {
    title,
    description: str(input.description),
    file_url: str(input.file_url),
    category: str(input.category),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  });
}
