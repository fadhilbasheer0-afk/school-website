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

const CONTACT_TYPES = [
  "address",
  "phone",
  "email",
  "hours",
  "website",
  "map",
  "coordinates",
  "social",
  "form",
  "other",
];

export async function saveContactInfo(input: {
  id?: string;
  label?: string;
  type?: string;
  value?: string;
  is_primary?: boolean;
  sort_order?: number;
  is_active?: boolean;
}): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  const label = str(input.label);
  const type = str(input.type);
  const value = str(input.value);
  if (!label) return fail("Label is required.");
  if (!value) return fail("Value is required.");
  if (!CONTACT_TYPES.includes(type)) return fail("Select a valid type.");
  return writeRow(session, "contact_information", input, {
    label,
    type,
    value,
    is_primary: bool(input.is_primary, false),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  });
}

export async function setPrimaryContact(id: string): Promise<ActionResult> {
  const session = await requireAdminOrNull();
  if (!session) return fail("Unauthorized.");
  if (!session.schoolId) return fail("No school attached to this account.");
  const supabase = await createClient();
  const { error: resetError } = await supabase
    .from("contact_information")
    .update({ is_primary: false })
    .eq("school_id", session.schoolId);
  if (resetError) return fail(resetError.message);
  const { error: setError } = await supabase
    .from("contact_information")
    .update({ is_primary: true })
    .eq("id", id);
  if (setError) return fail(setError.message);
  revalidateContent("contact_information");
  return { ok: true };
}
