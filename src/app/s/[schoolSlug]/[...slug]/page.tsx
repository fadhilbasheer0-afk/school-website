"use client";

import { notFound } from "next/navigation";
import { resolveTenant, getTenantUrl, getSchoolPages, isPageEnabled } from "@/lib/tenant";
import dynamic from "next/dynamic";
import { Metadata } from "next";

// Dynamically import page components to avoid loading all at once
const PageComponents: Record<string, React.ComponentType<any>> = {
  about: dynamic(() => import("@/app/about/page")),
  academics: dynamic(() => import("@/app/academics/page")),
  faculty: dynamic(() => import("@/app/faculty/page")),
  facilities: dynamic(() => import("@/app/facilities/page")),
  activities: dynamic(() => import("@/app/activities/page")),
  gallery: dynamic(() => import("@/app/gallery/page")),
  events: dynamic(() => import("@/app/events/[slug]/page")),
  admissions: dynamic(() => import("@/app/admissions/page")),
  news: dynamic(() => import("@/app/news/[slug]/page")),
  contact: dynamic(() => import("@/app/contact/page")),
  // Add more as needed
};

export async function generateMetadata({ params }: { params: { schoolSlug: string; slug: string[] } }): Promise<Metadata> {
  const { schoolSlug, slug } = params;
  const tenant = await resolveTenant({ slug: schoolSlug });
  const pageKey = slug[0] ?? "home";
  const title = `${tenant.name} - ${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)}`;
  return {
    title,
    description: tenant.motto ?? `${tenant.name} official website`,
    openGraph: { url: getTenantUrl(tenant, `/${pageKey}`) },
  };
}

export default async function PublicPage({ params }: { params: { schoolSlug: string; slug: string[] } }) {
  const { schoolSlug, slug } = params;
  const tenant = await resolveTenant({ slug: schoolSlug });
  if (!tenant || !tenant.isActive) notFound();

  const pageKey = slug[0] ?? "home";
  const enabled = await isPageEnabled(tenant.id, pageKey);
  if (!enabled) notFound();

  const Component = PageComponents[pageKey];
  if (!Component) notFound();

  // Pass tenant as prop if needed by page components
  return <Component />;
}
