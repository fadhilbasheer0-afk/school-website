/** True when a string looks like an absolute image URL (http/https). */
export function isImageUrl(value: string | null | undefined): value is string {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}
