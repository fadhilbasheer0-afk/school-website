interface TenantUrlContext {
  slug: string;
  isPathScoped?: boolean;
}

/** Builds a URL that keeps navigation inside the selected school's path. */
export function getTenantUrl(tenant: TenantUrlContext, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!tenant.isPathScoped) return cleanPath;
  return cleanPath === "/" ? `/s/${tenant.slug}` : `/s/${tenant.slug}${cleanPath}`;
}
