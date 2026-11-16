import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/auth";
import { fetchRows } from "@/lib/admin/fetch";
import { ActivitiesAdmin } from "@/components/admin/sections/ActivitiesAdmin";

export const metadata: Metadata = { title: "Activities & Achievements" };

export default async function AdminActivitiesPage() {
  const session = await requireAdmin();
  const [activities, achievements] = await Promise.all([
    fetchRows("activities", session.schoolId),
    fetchRows("achievements", session.schoolId),
  ]);

  return <ActivitiesAdmin activities={activities} achievements={achievements} />;
}
