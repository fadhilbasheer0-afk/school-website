import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Images as ImagesIcon, Camera } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { AlbumPhotoGrid } from "@/components/gallery/AlbumPhotoGrid";
import { getGalleryAlbums, getGalleryAlbumBySlug } from "@/lib/content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const albums = await getGalleryAlbums();
  return albums.map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getGalleryAlbumBySlug(slug);
  if (!detail) {
    return { title: "Album Not Found | Pinecrest Academy" };
  }
  return {
    title: `${detail.album.title} | Campus Gallery`,
    description: detail.album.description || `Photo album from Pinecrest Academy.`,
  };
}

export default async function GalleryAlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await getGalleryAlbumBySlug(slug);
  if (!detail) notFound();

  const { album, photos } = detail;

  return (
    <div className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>

        {/* Album cover */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xl shadow-slate-100/50 dark:shadow-none">
          <ImagePlaceholder
            src={album.coverImage}
            alt={album.title}
            label={album.title}
            aspectRatio="aspect-[21/9]"
            className="rounded-none border-0"
          />
        </div>

        {/* Album header */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 tracking-wider uppercase">
              Photo Album
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Camera className="w-4 h-4" />
              {photos.length} {photos.length === 1 ? "photo" : "photos"}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-4 leading-tight">
            {album.title}
          </h1>
          {album.description && (
            <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mt-3 max-w-2xl">
              {album.description}
            </p>
          )}
        </div>

        {/* Photos */}
        <div className="mt-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Photos in this album
            </h2>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ImagesIcon className="w-4 h-4" />
              All Albums
            </Link>
          </div>
          <AlbumPhotoGrid photos={photos} />
        </div>
      </div>
    </div>
  );
}
