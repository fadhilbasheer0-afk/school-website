"use server";

import {
  fail,
  str,
  num,
  bool,
  requireAdminOrNull,
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

const toStringList = (v: unknown): string[] => {
  if (Array.isArray(v)) {
    return v.map((x) => str(x)).filter(Boolean);
  }
  return str(v)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
};

export async function saveFacility(input: {
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  features?: string[] | string;
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
    "facilities",
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
    features: JSON.stringify(toStringList(input.features)),
    image_url: str(input.image_url),
    sort_order: num(input.sort_order, 0),
    is_active: bool(input.is_active, true),
  };
  const { error } = input.id
    ? await supabase.from("facilities").update(payload).eq("id", input.id)
    : await supabase
        .from("facilities")
        .insert({ ...payload, school_id: session.schoolId });
  if (error) return fail(error.message);
  revalidateContent("facilities");
  return { ok: true };
}
