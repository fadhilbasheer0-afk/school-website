import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User as UserIcon, Clock, Megaphone } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Button } from "@/components/ui/Button";
import { formatShortDate } from "@/lib/date";
import { getAnnouncementBySlug, getAnnouncements } from "@/lib/content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await getAnnouncements();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getAnnouncementBySlug(slug);
  if (!article) {
    return { title: "Announcement Not Found" };
  }
  return {
    title: `${article.title} | School News`,
    description: article.summary,
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getAnnouncementBySlug(slug);
  if (!article) notFound();

  const all = await getAnnouncements();
  const related = all
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => {
      const aMatch = a.category === article.category;
      const bMatch = b.category === article.category;
      if (aMatch !== bMatch) return aMatch ? -1 : 1;
      return b.date.localeCompare(a.date);
    })
    .slice(0, 3);

  return (
    <div className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 font-sans">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to News
        </Link>

        {/* Article header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              <Megaphone className="w-3.5 h-3.5" />
              {article.category}
            </span>
            {article.featured && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
                Featured
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mt-6">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mt-6">
            <span className="inline-flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              {formatShortDate(article.date)}
            </span>
            <span className="inline-flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              {article.author}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              ~{Math.max(1, Math.round(article.content.join(" ").split(/\s+/).length / 220))} min read
            </span>
          </div>
        </header>

        {/* Article cover */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xl shadow-slate-100/50 dark:shadow-none mb-10">
          <ImagePlaceholder
            src={article.image}
            alt={article.title}
            label={article.image}
            aspectRatio="aspect-[21/9]"
            className="rounded-none border-0"
          />
        </div>

        {/* Article body */}
        <article className="max-w-none">
          {article.content.map((paragraph, idx) => (
            <p
              key={idx}
              className={`text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 ${
                idx === 0
                  ? "first-letter:text-5xl first-letter:font-extrabold first-letter:text-amber-600 dark:first-letter:text-amber-400 first-letter:mr-2 first-letter:float-left first-letter:leading-[0.85]"
                  : ""
              }`}
            >
              {paragraph}
            </p>
          ))}
        </article>

        {/* Back to news */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {article.author}
            </p>
            <p className="text-xs text-slate-400">
              School Communications Team
            </p>
          </div>
          <Link href="/news" className="inline-block">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              All Announcements
            </Button>
          </Link>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
              Related Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link key={rel.slug} href={`/news/${rel.slug}`} className="group">
                  <ImagePlaceholder
                    src={rel.image}
                    alt={rel.title}
                    label={rel.image}
                    aspectRatio="aspect-video"
                    className="transition-all duration-300 group-hover:border-amber-500/40"
                  />
                  <div className="flex flex-col text-left mt-3 px-0.5">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-widest uppercase">
                      {rel.category}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {rel.title}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1.5">
                      {formatShortDate(rel.date)} · {rel.author}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
