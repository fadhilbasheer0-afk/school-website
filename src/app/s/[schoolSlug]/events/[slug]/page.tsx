import React from "react";
import EventDetailPage from "@/app/events/[slug]/page";

interface Props {
  params: Promise<{
    schoolSlug: string;
    slug: string;
  }>;
}

export default async function SchoolEventDetailPage({ params }: Props) {
  const resolved = await params;
  return <EventDetailPage params={Promise.resolve({ slug: resolved.slug })} />;
}
