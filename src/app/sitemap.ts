import type { MetadataRoute } from "next";
import { siteConfig, staticRoutes } from "@/lib/site";
import { newsArticles } from "@/data/news";
import { events } from "@/data/events";
import { galleryImages } from "@/data/gallery";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const lastModified = new Date();

  const staticUrls: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: route.priority,
  }));

  const dynamicUrls: MetadataRoute.Sitemap = [
    ...newsArticles.map((article) => ({
      url: `${base}/news/${article.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...events.map((event) => ({
      url: `${base}/events/${event.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...galleryImages.map((image) => ({
      url: `${base}/gallery/${image.id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];

  return [...staticUrls, ...dynamicUrls];
}
