"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, User, Search, X, ArrowRight, Newspaper } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { EmptyState } from "@/components/ui/FeedbackStates";
import { formatShortDate } from "@/lib/date";
import {
  newsCategories,
  type NewsArticle,
  type NewsCategory,
} from "@/data/news";

type Filter = "All" | NewsCategory;

const filterOptions: Filter[] = ["All", ...newsCategories];

export const NewsList: React.FC<{ news: NewsArticle[] }> = ({ news }) => {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    return news
      .filter((a) => filter === "All" || a.category === filter)
      .filter((a) => {
        if (!q) return true;
        return [a.title, a.summary, a.author, a.category].join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [filter, query, news]);

  const featured = useMemo(
    () => visible.find((a) => a.featured) ?? null,
    [visible]
  );
  const rest = useMemo(
    () => visible.filter((a) => a.id !== featured?.id),
    [visible, featured]
  );

  return (
    <div>
      {/* Category filter + search */}
      <div className="flex flex-col gap-4 mb-12">
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter news by category"
        >
          {filterOptions.map((option) => {
            const count =
              option === "All"
                ? news.length
                : news.filter((a) => a.category === option).length;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={filter === option}
                onClick={() => setFilter(option)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                  filter === option
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:text-amber-700 dark:hover:text-amber-400"
                }`}
              >
                {option}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    filter === option
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

        <div className="relative w-full lg:w-[420px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search announcements…"
            aria-label="Search news and announcements"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-11 pr-10 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No announcements found"
          description="Try a different category or search term — new announcements appear here as they are published."
          icon={<Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />}
        />
      ) : (
        <div className="flex flex-col gap-12">
          {/* Featured item */}
          {featured && (
            <Card className="overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <ImagePlaceholder
                    label={featured.image}
                    src={featured.image}
                    aspectRatio="aspect-video lg:aspect-auto lg:h-full"
                    className="rounded-b-none lg:rounded-r-none border-0"
                  />
                </div>
                <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white tracking-wider uppercase w-fit">
                      Featured
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 tracking-wider uppercase w-fit">
                      {featured.category}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mt-4 leading-snug">
                    {featured.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-3">
                    {featured.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 shrink-0 text-amber-500" />
                      {formatShortDate(featured.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 shrink-0 text-amber-500" />
                      {featured.author}
                    </span>
                  </div>
                  <Link
                    href={`/news/${featured.slug}`}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 group w-fit"
                  >
                    Read Full Announcement
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* News grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  return (
    <Card className="flex flex-col h-full">
      <ImagePlaceholder
        label={article.image}
        src={article.image}
        aspectRatio="aspect-video"
        className="rounded-b-none"
      />
      <CardHeader className="pb-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 tracking-wider uppercase w-fit">
          {article.category}
        </span>
        <Link href={`/news/${article.slug}`}>
          <CardTitle className="text-base md:text-lg mt-2.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-[1.35] line-clamp-2">
            {article.title}
          </CardTitle>
        </Link>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2.5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            {formatShortDate(article.date)}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 shrink-0" />
            {article.author}
          </span>
        </div>
      </CardHeader>
      <CardContent className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-2 flex-grow">
        {article.summary}
      </CardContent>
      <CardFooter className="pt-2">
        <Link
          href={`/news/${article.slug}`}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 group"
        >
          Read Full Announcement
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardFooter>
    </Card>
  );
};
