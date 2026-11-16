import React from "react";
import { requireAdmin } from "@/lib/supabase/auth";
import { getSchoolCustomPages } from "@/lib/tenant";
import { CustomPagesManager } from "@/components/admin/custom-pages/CustomPagesManager";

export const metadata = {
  title: "Custom Pages",
};

export default async function AdminCustomPagesPage() {
  const session = await requireAdmin();
  const schoolId = session.schoolId || "default";
  const pages = await getSchoolCustomPages(schoolId);

  return <CustomPagesManager initialPages={pages} />;
}
