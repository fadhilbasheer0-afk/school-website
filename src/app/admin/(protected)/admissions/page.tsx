import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/auth";
import { fetchRows } from "@/lib/admin/fetch";
import { AdmissionsAdmin } from "@/components/admin/sections/AdmissionsAdmin";

export const metadata: Metadata = { title: "Admissions" };

export default async function AdminAdmissionsPage() {
  const session = await requireAdmin();
  const sections = await fetchRows("admissions", session.schoolId);

  return <AdmissionsAdmin sections={sections} />;
}
