import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Calendar as CalendarIcon, BellRing, Bookmark } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Button } from "@/components/ui/Button";
import { parseISODate, formatLongDate, formatTime24 } from "@/lib/date";
import { getEventBySlug, getEvents } from "@/lib/content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return { title: "Event Not Found" };
  }
  return {
    title: `${event.title} | Campus Calendar`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const date = parseISODate(event.startDate);
  const all = await getEvents();
  const otherEvents = all
    .filter((ev) => ev.slug !== event.slug)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 3);

  return (
    <div className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 font-sans">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        {/* Hero */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xl shadow-slate-100/50 dark:shadow-none">
          <ImagePlaceholder
            src={event.image}
            alt={event.title}
            label={event.image}
            aspectRatio="aspect-[21/9]"
            className="rounded-none border-0"
          />
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
              {event.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <BellRing className="w-4 h-4 text-amber-500" />
              Campus Calendar
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mt-5">
            {event.title}
          </h1>

          {/* Key details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatLongDate(event.startDate)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatTime24(event.startTime)} – {formatTime24(event.endTime)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Venue</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {event.venue}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-10">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              About this Event
            </h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Date callout / calendar sync */}
          <div className="mt-10 bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl border border-slate-700 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-black leading-none text-white">{date.getDate()}</span>
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mt-1">
                  {date.toLocaleDateString("en-US", { month: "short" })}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Don&rsquo;t miss this event</span>
                <span className="text-xs text-slate-400 font-light mt-0.5">
                  Add it to your calendar so your family stays in the loop.
                </span>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="secondary" size="sm" leftIcon={<CalendarIcon className="w-4 h-4" />} className="flex-1 sm:flex-none">
                Sync Calendar
              </Button>
              <Button variant="ghost" size="sm" leftIcon={<Bookmark className="w-4 h-4" />} className="flex-1 sm:flex-none text-slate-300">
                Save
              </Button>
            </div>
          </div>

          <Link
            href="/events"
            className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Events
          </Link>
        </div>

        {/* Other events */}
        {otherEvents.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200/60 dark:border-slate-800/80">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
              More on the Campus Calendar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherEvents.map((other) => {
                const otherDate = parseISODate(other.startDate);
                return (
                  <Link
                    key={other.id}
                    href={`/events/${other.slug}`}
                    className="group rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 uppercase">
                        {other.category}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {otherDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {other.title}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {formatTime24(other.startTime)} · {other.venue}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
