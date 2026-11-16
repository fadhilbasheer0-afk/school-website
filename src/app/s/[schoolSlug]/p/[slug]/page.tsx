import React from "react";
import CustomPageView from "@/app/p/[slug]/page";

interface Props {
  params: Promise<{
    schoolSlug: string;
    slug: string;
  }>;
}

export default async function SchoolCustomPageView({ params }: Props) {
  const resolved = await params;
  return <CustomPageView params={Promise.resolve({ slug: resolved.slug })} />;
}
