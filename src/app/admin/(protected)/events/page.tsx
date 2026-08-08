import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/auth";
import { fetchRows } from "@/lib/admin/fetch";
import { EventsAdmin } from "@/components/admin/sections/EventsAdmin";

export const metadata: Metadata = { title: "Events" };

export default async function AdminEventsPage() {
  const session = await requireAdmin();
  const events = await fetchRows("events", session.schoolId, {
    orderBy: "start_date",
    ascending: true,
  });

  return <EventsAdmin events={events} />;
}
