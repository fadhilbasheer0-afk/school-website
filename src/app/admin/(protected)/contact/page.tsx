import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/auth";
import { fetchRows } from "@/lib/admin/fetch";
import { ContactAdmin } from "@/components/admin/sections/ContactAdmin";

export const metadata: Metadata = { title: "Contact" };

export default async function AdminContactPage() {
  const session = await requireAdmin();
  const contact = await fetchRows("contact_information", session.schoolId);

  return <ContactAdmin contact={contact} />;
}
