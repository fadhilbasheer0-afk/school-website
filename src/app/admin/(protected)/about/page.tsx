import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/auth";
import { fetchRows } from "@/lib/admin/fetch";
import { AboutAdmin } from "@/components/admin/sections/AboutAdmin";

export const metadata: Metadata = { title: "About" };

export default async function AdminAboutPage() {
  const session = await requireAdmin();
  const content = await fetchRows("about_content", session.schoolId);

  return <AboutAdmin content={content} />;
}
