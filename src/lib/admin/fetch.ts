import { createClient } from "@/lib/supabase/server";

type Row = Record<string, any>;

/**
 * Fetches all rows for a school-scoped table, ordered by a column. Returns an
 * empty array on error so pages degrade gracefully.
 */
export async function fetchRows(
  table: string,
  schoolId: string | null,
  opts: { orderBy?: string; ascending?: boolean } = {}
): Promise<Row[]> {
  const supabase = await createClient();
  try {
    let q = supabase.from(table).select("*");
    if (schoolId) {
      q = q.eq("school_id", schoolId);
    }
    q = q.order(opts.orderBy ?? "sort_order", {
      ascending: opts.ascending ?? true,
    });
    const { data, error } = await q;
    if (error) return [];
    return data as Row[];
  } catch {
    return [];
  }
}

/** Teachers joined with their department name. */
export async function fetchTeachers(schoolId: string | null): Promise<Row[]> {
  const supabase = await createClient();
  try {
    let q = supabase.from("teachers").select("*, academic_departments(name)");
    if (schoolId) {
      q = q.eq("school_id", schoolId);
    }
    q = q.order("sort_order", { ascending: true });
    const { data, error } = await q;
    if (error) return [];
    return data as Row[];
  } catch {
    return [];
  }
}

/** Fetches the school settings row, or null when it does not exist. */
export async function fetchSchoolSettings(
  schoolId: string | null
): Promise<Row | null> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("school_settings")
      .select("*")
      .eq("school_id", schoolId)
      .maybeSingle();
    if (error || !data) return null;
    return data as Row;
  } catch {
    return null;
  }
}
