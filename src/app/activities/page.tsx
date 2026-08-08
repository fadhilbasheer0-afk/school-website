import React from "react";
import { Users } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ActivityDirectory } from "@/components/activities/ActivityDirectory";
import { getActivities } from "@/lib/content";

export default async function Activities() {
  const activities = await getActivities();
  return (
    <div className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Section Heading */}
        <SectionHeading
          badge="Beyond the Classroom"
          title="Activities & Achievements"
          subtitle="From sports and arts to clubs, competitions, and awards — discover how our students grow outside the classroom. Filter by category to explore."
          align="center"
          className="mx-auto"
        />

        {/* Banner Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 mb-16 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
              Holistic Philosophy
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-2 mb-4">
              Building Well-Rounded Leaders
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-light">
              At Pinecrest Academy, we believe education extends far beyond
              theory. Participation in extracurricular programmes teaches time
              management, resilience, civic duty, and leadership. Every student
              is encouraged to join at least one club and one athletic project
              each semester.
            </p>
          </div>
          <div className="lg:col-span-5 w-full">
            <ImagePlaceholder
              label="Student Council leaders coordinating a community food drive project"
              aspectRatio="aspect-video"
              icon={<Users className="w-10 h-10 text-slate-400" />}
            />
          </div>
        </div>

        {/* Activity Directory (categorised) */}
        <ActivityDirectory activities={activities} />
      </div>
    </div>
  );
}
