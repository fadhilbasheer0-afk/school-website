import React from "react";
import NewsArticlePage from "@/app/news/[slug]/page";

interface Props {
  params: Promise<{
    schoolSlug: string;
    slug: string;
  }>;
}

export default async function SchoolNewsDetailPage({ params }: Props) {
  const resolved = await params;
  return <NewsArticlePage params={Promise.resolve({ slug: resolved.slug })} />;
}
