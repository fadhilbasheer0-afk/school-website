import { updateTag, revalidatePath } from "next/cache";
import { TABLE_CONTENT_MAP, type CacheTag } from "@/lib/cache";

/**
 * Invalidates the public content cache after an admin write.
 *
 * Map is @/lib/cache#TABLE_CONTENT_MAP (table → public tags + routes). Call
 * this from every server action that mutates a CMS table so edits reach the
 * public site immediately:
 *
 *   - updateTag(tag)       — immediately expires the tagged unstable_cache
 *     entries (read-your-own-writes: the next request blocks and fetches fresh
 *     rows instead of serving stale content).
 *   - revalidatePath(path) — forces the affected public page(s) to re-render,
 *     including SSG detail pages.
 *
 * updateTag may only be called from within a Server Action, which is always
 * the case here (every caller lives in src/lib/admin/actions).
 */
export function revalidateContent(table: string): void {
  const entry = TABLE_CONTENT_MAP[table];
  if (!entry) return;

  for (const tag of new Set<CacheTag>(entry.tags)) {
    updateTag(tag);
  }

  if (entry.purgeClient) {
    // Site-wide change (settings/home): purge the client router cache too so
    // returning visitors cannot keep seeing a stale header/footer.
    revalidatePath("/", "layout");
  } else {
    for (const path of new Set(entry.paths)) {
      revalidatePath(path);
    }
  }

  for (const pattern of entry.pagePatterns ?? []) {
    revalidatePath(pattern, "page");
  }
}
