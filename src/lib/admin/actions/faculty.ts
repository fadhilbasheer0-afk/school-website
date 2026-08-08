"use server";

import {
  fail,
  str,
  num,
  bool,
  isEmail,
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

export async function saveTeacher(input: {
  id?: string;
  name?: string;
  title?: string;
  department_id?: string;
  bio?: string;
  image_url?: string;
  email?: string;
  phone?: string;
  qualifications?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  const name = str(input.name);
  if (!name) return fail("Name is required.");
  const email = str(input.email);
  if (email && !isEmail(email)) return fail("Enter a valid email address.");
  return writeRow(session, "teachers", input, {
    name,
    title: str(input.title),
    department_id: str(input.department_id) || null,
    bio: str(input.bio),
    image_url: str(input.image_url),
    email: email || null,
    phone: str(input.phone) || null,
    qualifications: str(input.qualifications),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  });
}
