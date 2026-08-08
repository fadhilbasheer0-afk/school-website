import { revalidateTag, revalidatePath } from "next/cache";
import { TABLE_CONTENT_MAP, type CacheTag } from "@/lib/cache";

/**
 * Invalidates the public content cache after an admin write.
 *
 * Map is @/lib/cache#TABLE_CONTENT_MAP (table → public tags + routes). Call
 * this from every server action that mutates a CMS table so edits reach the
 * public site on the next visit:
 *
 *   - revalidateTag(tag, "max") — marks the tagged unstable_cache entries
 *     stale (stale-while-revalidate), so fresh rows are fetched next visit.
 *   - revalidatePath(path)     — forces the affected public page to re-render.
 */
export function revalidateContent(table: string): void {
  const entry = TABLE_CONTENT_MAP[table];
  if (!entry) return;

  for (const tag of new Set<CacheTag>(entry.tags)) {
    revalidateTag(tag, "max");
  }
  for (const path of new Set(entry.paths)) {
    revalidatePath(path);
  }
}
