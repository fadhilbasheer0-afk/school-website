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

export async function saveAdmissionSection(input: {
  id?: string;
  section_key?: string;
  title?: string;
  body?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  const sectionKey = str(input.section_key);
  const title = str(input.title);
  if (!sectionKey) return fail("Section key is required.");
  if (!title) return fail("Title is required.");
  return writeRow(session, "admissions", input, {
    section_key: sectionKey,
    title,
    body: str(input.body),
    image_url: str(input.image_url),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  });
}
