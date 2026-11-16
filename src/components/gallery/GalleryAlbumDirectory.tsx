import React from "react";
import Link from "next/link";
import { Camera, ArrowRight } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { EmptyState } from "@/components/ui/FeedbackStates";
import type { GalleryAlbum } from "@/lib/content";
import type { GalleryImage } from "@/data/gallery";

export const GalleryAlbumDirectory: React.FC<{
  albums: GalleryAlbum[];
  photos: GalleryImage[];
}> = ({ albums, photos }) => {
  const photoCountByAlbum = React.useMemo(
    () =>
      photos.reduce<Record<string, number>>((acc, photo) => {
        if (photo.albumSlug) acc[photo.albumSlug] = (acc[photo.albumSlug] ?? 0) + 1;
        return acc;
      }, {}),
    [photos]
  );

  const coverByAlbum = React.useMemo(() => {
    const covers: Record<string, string | null> = {};
    for (const photo of photos) {
      if (photo.albumSlug && !covers[photo.albumSlug] && photo.src) {
        covers[photo.albumSlug] = photo.src;
      }
    }
    return covers;
  }, [photos]);

  if (albums.length === 0) {
    return (
      <EmptyState
        title="No photo albums yet"
        description="Albums and photographs will appear here once they are uploaded by the media team."
        icon={<Camera className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {albums.map((album) => {
        const count = photoCountByAlbum[album.slug] ?? 0;
        const cover = coverByAlbum[album.slug] ?? album.coverImage;
        return (
          <Link
            key={album.id}
            href={`/gallery/${album.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <ImagePlaceholder
              src={cover}
              alt={album.title}
              label={album.title}
              aspectRatio="aspect-[4/3]"
              className="rounded-none border-0"
            />
            <div className="flex flex-col p-6 text-left flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 uppercase">
                  <Camera className="w-3.5 h-3.5 mr-1" />
                  {count} {count === 1 ? "photo" : "photos"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {album.title}
              </h3>
              {album.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-2 line-clamp-2">
                  {album.description}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                View Album
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
