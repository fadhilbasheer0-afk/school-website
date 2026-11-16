import React from "react";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsList } from "@/components/news/NewsList";
import { getAnnouncements } from "@/lib/content";
import { resolveTenant, isPageEnabled } from "@/lib/tenant";

export default async function News() {
  const tenant = await resolveTenant();
  const enabled = await isPageEnabled(tenant.id, "news");
  if (!enabled) notFound();

  const announcements = await getAnnouncements(undefined, tenant.id);
  return (
    <div className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Section Title */}
        <SectionHeading
          badge="Notice Board"
          title="School News & Announcements"
          subtitle="Stay informed about campus achievements, scholastic milestones, and policy updates."
          align="center"
          className="mx-auto"
        />

        {/* Interactive news directory */}
        <NewsList news={announcements} />
      </div>
    </div>
  );
}
