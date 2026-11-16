"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, ArrowRight, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/FeedbackStates";
import { parseISODate, formatTime24 } from "@/lib/date";
import type { SchoolEvent } from "@/data/events";

type Tab = "upcoming" | "past";

export const EventsList: React.FC<{ events: SchoolEvent[] }> = ({ events }) => {
  const [tab, setTab] = useState<Tab>("upcoming");

  const { upcoming, past } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const up = events
      .filter((ev) => parseISODate(ev.startDate) >= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const pa = events
      .filter((ev) => parseISODate(ev.startDate) < today)
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
    return { upcoming: up, past: pa };
  }, [events]);

  const visible = tab === "upcoming" ? upcoming : past;

  return (
    <div>
      {/* Upcoming / Past toggle */}
      <div
        className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 mb-12"
        role="tablist"
        aria-label="Show upcoming or past events"
      >
        {(
          [
            { value: "upcoming", label: "Upcoming Events" },
            { value: "past", label: "Past Events" },
          ] as const
        ).map(({ value, label }) => {
          const isActive = tab === value;
          const count = value === "upcoming" ? upcoming.length : past.length;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(value)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                isActive
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
                  : "text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400"
              }`}
            >
              {label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 dark:bg-slate-900/10 text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={tab === "upcoming" ? "No upcoming events" : "No past events"}
          description={
            tab === "upcoming"
              ? "New events will appear here as they are scheduled. Check back soon."
              : "Past events will be archived here for reference."
          }
          icon={<CalendarClock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />}
        />
      ) : (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {visible.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}
    </div>
  );
};

const EventCard: React.FC<{ event: SchoolEvent }> = ({ event }) => {
  const date = parseISODate(event.startDate);
  return (
    <Card hoverEffect className="overflow-visible">
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Date callout */}
        <div className="w-20 h-20 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white flex flex-col items-center justify-center shrink-0 shadow-lg shadow-slate-900/15">
          <span className="text-2xl md:text-3xl font-black leading-none text-white">
            {date.getDate()}
          </span>
          <span className="text-[11px] uppercase font-bold text-amber-500 tracking-wider mt-1.5">
            {date.toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
            {date.getFullYear()}
          </span>
        </div>

        {/* Event details */}
        <div className="flex-grow text-left">
          <div className="flex flex-wrap gap-2 mb-2 items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 uppercase">
              {event.category}
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-snug">
            {event.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-2xl font-light">
            {event.description}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 mt-4 font-semibold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              {formatTime24(event.startTime)} – {formatTime24(event.endTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              {event.venue}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
          <Link href={`/events/${event.slug}`} className="w-full md:w-auto inline-block">
            <Button
              variant="outline"
              size="sm"
              className="w-full md:w-auto text-xs py-2 border-slate-200 dark:border-slate-800"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
