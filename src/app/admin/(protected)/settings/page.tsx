import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/auth";
import { fetchSchoolSettings } from "@/lib/admin/fetch";
import { SettingsAdmin } from "@/components/admin/sections/SettingsAdmin";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const session = await requireAdmin();
  const settings = await fetchSchoolSettings(session.schoolId);

  return <SettingsAdmin settings={settings} />;
}
