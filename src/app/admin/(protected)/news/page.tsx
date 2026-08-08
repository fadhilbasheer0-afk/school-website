import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/auth";
import { fetchRows } from "@/lib/admin/fetch";
import { NewsAdmin } from "@/components/admin/sections/NewsAdmin";

export const metadata: Metadata = { title: "News & Announcements" };

export default async function AdminNewsPage() {
  const session = await requireAdmin();
  const announcements = await fetchRows("announcements", session.schoolId, {
    orderBy: "published_at",
    ascending: false,
  });

  return <NewsAdmin announcements={announcements} />;
}
