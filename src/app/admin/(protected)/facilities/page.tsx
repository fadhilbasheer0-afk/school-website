import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/auth";
import { fetchRows } from "@/lib/admin/fetch";
import { FacilitiesAdmin } from "@/components/admin/sections/FacilitiesAdmin";

export const metadata: Metadata = { title: "Facilities" };

export default async function AdminFacilitiesPage() {
  const session = await requireAdmin();
  const facilities = await fetchRows("facilities", session.schoolId);

  return <FacilitiesAdmin facilities={facilities} />;
}
