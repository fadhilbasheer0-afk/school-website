import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/auth";
import { fetchRows } from "@/lib/admin/fetch";
import { AcademicsAdmin } from "@/components/admin/sections/AcademicsAdmin";

export const metadata: Metadata = { title: "Academics" };

export default async function AdminAcademicsPage() {
  const session = await requireAdmin();
  const [content, classes, departments, calendar, documents] =
    await Promise.all([
      fetchRows("academic_content", session.schoolId),
      fetchRows("academic_classes", session.schoolId),
      fetchRows("academic_departments", session.schoolId),
      fetchRows("academic_calendar", session.schoolId),
      fetchRows("documents", session.schoolId),
    ]);

  return (
    <AcademicsAdmin
      content={content}
      classes={classes}
      departments={departments}
      calendar={calendar}
      documents={documents}
    />
  );
}
