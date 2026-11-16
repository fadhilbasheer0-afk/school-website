import React from "react";
import { notFound } from "next/navigation";
import { BellRing } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { EventsList } from "@/components/events/EventsList";
import { getEvents } from "@/lib/content";
import { resolveTenant, isPageEnabled } from "@/lib/tenant";

export default async function Events() {
  const tenant = await resolveTenant();
  const enabled = await isPageEnabled(tenant.id, "events");
  if (!enabled) notFound();

  const events = await getEvents(tenant.id);
  return (
    <div className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Navigation Section Heading */}
        <SectionHeading
          badge="Campus Calendar"
          title="School Events & Gatherings"
          subtitle="Keep up with assemblies, Parent-Teacher conferences, sports tournaments, and student exhibitions."
          align="center"
          className="mx-auto"
        />

        {/* Dynamic reminder banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 mb-16 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
              <BellRing className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="font-bold text-white text-base">Subscribe to Campus Calendar</h4>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Automatically synchronize these event dates with your personal Google Agenda or Apple Calendar calendars.
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0 w-full md:w-auto">
            Sync Calendar
          </Button>
        </div>

        {/* Interactive events directory */}
        <EventsList events={events} />
      </div>
    </div>
  );
}
