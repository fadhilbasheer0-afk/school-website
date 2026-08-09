"use client";

import React, { useMemo, useState } from "react";
import { Calendar, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { EmptyState } from "@/components/ui/FeedbackStates";
import {
  activityCategoryLabels,
  activityCategories,
  type ActivityItem,
  type ActivityCategory,
} from "@/data/activities";

type Filter = "All" | ActivityCategory;

const filterOptions: Filter[] = ["All", ...activityCategories];

const categoryColor: Record<ActivityCategory, string> = {
  sports: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  arts: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
  cultural: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  clubs: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  competitions: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  awards: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300",
  "student-achievements": "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  "school-achievements": "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
};

export const ActivityDirectory: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(
    () => (filter === "All" ? activities : activities.filter((a) => a.category === filter)),
    [filter, activities]
  );

  // When filtering by a single category, render one grouped section.
  const groups = useMemo(() => {
    if (filter !== "All") {
      return [{ category: filter, items: filtered }];
    }
    return activityCategories
      .map((category) => ({
        category,
        items: activities.filter((a) => a.category === category),
      }))
      .filter((group) => group.items.length > 0);
  }, [filter, filtered, activities]);

  const hasResults = filtered.length > 0;

  return (
    <div>
      {/* Category Tabs */}
      <div
        className="flex flex-wrap items-center gap-2 mb-12"
        role="tablist"
        aria-label="Filter activities by category"
      >
        {filterOptions.map((option) => {
          const isActive = filter === option;
          const label = option === "All" ? "All" : activityCategoryLabels[option];
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                isActive
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:text-amber-700 dark:hover:text-amber-400"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {!hasResults ? (
        <EmptyState
          title="Nothing in this category yet"
          description="New activities and achievements will appear here as they are published."
          icon={<Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />}
        />
      ) : (
        <div className="flex flex-col gap-16">
          {groups.map((group) => (
            <section key={group.category} aria-label={activityCategoryLabels[group.category]}>
              <div className="flex items-center gap-3 mb-8">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${categoryColor[group.category]}`}
                >
                  {activityCategoryLabels[group.category]}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {group.items.length} {group.items.length === 1 ? "item" : "items"}
                </span>
                <span className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {group.items.map((item) => (
                  <ActivityCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

const ActivityCard: React.FC<{ item: ActivityItem }> = ({ item }) => {
  return (
    <Card className="flex flex-col h-full">
      <ImagePlaceholder
        label={item.image}
        src={item.image}
        aspectRatio="aspect-video"
        className="rounded-b-none"
      />
      <CardHeader className="pb-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit ${categoryColor[item.category]}`}
        >
          {activityCategoryLabels[item.category]}
        </span>
        <CardTitle className="text-lg mt-2 leading-snug">{item.title}</CardTitle>
      </CardHeader>
      <div className="p-6 pt-0 flex flex-col gap-3 flex-grow">
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-grow">
          {item.description}
        </p>
        {item.date && (
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            {item.date}
          </div>
        )}
      </div>
    </Card>
  );
};
