import React from "react";
import GalleryAlbumDetailPage from "@/app/gallery/[slug]/page";

interface Props {
  params: Promise<{
    schoolSlug: string;
    slug: string;
  }>;
}

export default async function SchoolGalleryDetailPage({ params }: Props) {
  const resolved = await params;
  return <GalleryAlbumDetailPage params={Promise.resolve({ slug: resolved.slug })} />;
}
