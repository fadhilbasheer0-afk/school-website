/**
 * Central site configuration shared across pages, SEO metadata, sitemap and
 * robots. Update these values when the CMS / production domain is connected.
 */
export const siteConfig = {
  name: "Irshad Academy",
  legalName: "Irshad International Academy",
  url: "https://www.irshadacademy.edu",
  description:
    "Irshad International Academy provides a legacy of academic excellence, personal growth, and global citizenship. Empowering students since 1995.",
  locale: "en_US",
  email: "info@irshadacademy.edu",
  principalEmail: "principal@irshadacademy.edu",
  admissionsEmail: "admissions@irshadacademy.edu",
  phoneMain: "+1 (800) 555-0190",
  phoneAdmissions: "+1 (800) 555-0199",
  address: {
    street: "125 Academy Road",
    city: "New York, NY 10024",
    gps: "40.7128° N, 74.0060° W",
    mapEmbedUrl:
      "https://www.google.com/maps?q=125%20Academy%20Road%2C%20New%20York%2C%20NY%2010024&output=embed",
    mapLinkUrl:
      "https://www.google.com/maps/search/?api=1&query=125+Academy+Road%2C+New+York%2C+NY+10024",
  },
  officeHours: [
    { label: "Monday – Friday", value: "08:00 AM – 04:30 PM" },
    { label: "Saturday", value: "09:00 AM – 12:00 PM (Admissions only)" },
    { label: "Sunday & Holidays", value: "Closed" },
  ],
  social: {
    facebook: "https://www.facebook.com/irshadacademy",
    twitter: "https://www.twitter.com/irshadacademy",
    instagram: "https://www.instagram.com/irshadacademy",
    linkedin: "https://www.linkedin.com/school/irshadacademy",
    youtube: "https://www.youtube.com/@irshadacademy",
  },
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
