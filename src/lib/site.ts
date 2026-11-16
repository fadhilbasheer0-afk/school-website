/**
 * Central site configuration shared across pages, SEO metadata, sitemap and
 * robots. Update these values when the CMS / production domain is connected.
 */
type SiteSocialLinks = Partial<Record<"facebook" | "twitter" | "instagram" | "linkedin" | "youtube", string>>;

export const siteConfig = {
  name: "Demo School",
  legalName: "Demo School",
  url: "https://example.edu",
  description: "A school website powered by a customizable multi-tenant platform.",
  locale: "en_US",
  email: "",
  principalEmail: "",
  admissionsEmail: "",
  phoneMain: "",
  phoneAdmissions: "",
  address: {
    street: "",
    city: "",
    gps: "",
    mapEmbedUrl: "",
    mapLinkUrl: "",
  },
  officeHours: [] as { label: string; value: string }[],
  social: {} as SiteSocialLinks,
};

/** Static top-level routes included in the sitemap. */
export const staticRoutes: { path: string; changeFrequency?: string; priority?: number }[] = [
  { path: "", changeFrequency: "yearly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/academics", changeFrequency: "monthly", priority: 0.8 },
  { path: "/admissions", changeFrequency: "monthly", priority: 0.9 },
  { path: "/activities", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/events", changeFrequency: "weekly", priority: 0.8 },
  { path: "/facilities", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faculty", changeFrequency: "monthly", priority: 0.7 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.6 },
  { path: "/news", changeFrequency: "weekly", priority: 0.8 },
];
