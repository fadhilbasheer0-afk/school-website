import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FacultyDirectory } from "@/components/faculty/FacultyDirectory";
import { getTeachers } from "@/lib/content";

export default async function Faculty() {
  const members = await getTeachers();
  return (
    <div className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Section Heading */}
        <SectionHeading
          badge="Guiding Minds"
          title="Our Faculty & Staff"
          subtitle="Meet the educators who inspire, challenge, and guide our students every day — search by name or filter by department."
          align="center"
          className="mx-auto"
        />

        {/* Stats and Note */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 mb-16 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left items-center">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-2">
              Educators Committed to Excellence
            </h3>
            <p className="text-xs text-slate-400 font-light max-w-xl leading-relaxed">
              Over 75% of our teaching staff hold postgraduate degree
              designations and participate in regular curriculum workshops,
              certifying their academic guidelines.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end justify-center">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 px-3 py-1 rounded-full">
              CMS Managed directory
            </span>
          </div>
        </div>

        {/* Faculty Directory (search + filter) */}
        <FacultyDirectory members={members} />
      </div>
    </div>
  );
}
