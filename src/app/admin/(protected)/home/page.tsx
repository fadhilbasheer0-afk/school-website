import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/auth";
import {
  fetchRows,
  fetchSchoolSettings,
} from "@/lib/admin/fetch";
import { HomeAdmin } from "@/components/admin/sections/HomeAdmin";

export const metadata: Metadata = { title: "Home" };

export default async function AdminHomePage() {
  const session = await requireAdmin();
  const [settings, heroSlides, contentBlocks, statistics] = await Promise.all([
    fetchSchoolSettings(session.schoolId),
    fetchRows("home_hero_slides", session.schoolId),
    fetchRows("home_content", session.schoolId),
    fetchRows("home_statistics", session.schoolId),
  ]);

  return (
    <HomeAdmin
      settings={settings}
      heroSlides={heroSlides}
      contentBlocks={contentBlocks}
      statistics={statistics}
    />
  );
}
