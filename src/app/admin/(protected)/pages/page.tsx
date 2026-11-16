import React from "react";
import { requireAdmin } from "@/lib/supabase/auth";
import { getSchoolPages, DEFAULT_PAGE_CONFIGS } from "@/lib/tenant";
import { PagesManager } from "@/components/admin/pages/PagesManager";

export const metadata = {
  title: "Pages & Navigation",
};

export default async function AdminPagesPage() {
  const session = await requireAdmin();
  const schoolId = session.schoolId || "default";
  const pages = await getSchoolPages(schoolId);

  return <PagesManager initialPages={pages} />;
}
