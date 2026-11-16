import React from "react";
import { requireAdmin } from "@/lib/supabase/auth";
import { getSchoolHomepageSections } from "@/lib/tenant";
import { SectionsManager } from "@/components/admin/sections/SectionsManager";

export const metadata = {
  title: "Homepage Sections",
};

export default async function AdminSectionsPage() {
  const session = await requireAdmin();
  const schoolId = session.schoolId || "default";
  const sections = await getSchoolHomepageSections(schoolId);

  return <SectionsManager initialSections={sections} />;
}
