import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/auth";
import { fetchRows, fetchTeachers } from "@/lib/admin/fetch";
import { FacultyAdmin } from "@/components/admin/sections/FacultyAdmin";

export const metadata: Metadata = { title: "Faculty" };

export default async function AdminFacultyPage() {
  const session = await requireAdmin();
  const [teachers, departments] = await Promise.all([
    fetchTeachers(session.schoolId),
    fetchRows("academic_departments", session.schoolId),
  ]);

  return <FacultyAdmin teachers={teachers} departments={departments} />;
}
