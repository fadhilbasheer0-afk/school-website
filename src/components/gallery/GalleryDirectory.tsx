"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Maximize2,
  Camera,
} from "lucide-react";
import { EmptyState } from "@/components/ui/FeedbackStates";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import {
  galleryCategories,
  type GalleryImage,
  type GalleryCategory,
} from "@/data/gallery";

type Filter = "All" | GalleryCategory;

const filterOptions: Filter[] = ["All", ...galleryCategories];

/**
 * Renders the real photo once Supabase Storage provides a `src`;
 * falls back to a neutral placeholder otherwise.
 */
const GalleryPhoto: React.FC<{
  image: GalleryImage;
  aspectRatio?: string;
  iconClassName?: string;
}> = ({ image, aspectRatio = "aspect-[4/3]", iconClassName = "w-8 h-8 text-slate-400" }) => {
  if (image.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- CMS uploads use plain <img>
      <img
        src={image.src}
        alt={image.alt}
        className={`w-full h-full object-cover ${aspectRatio} rounded-xl`}
        loading="lazy"
      />
    );
  }
  return (
    <ImagePlaceholder
      label={image.alt}
      aspectRatio={aspectRatio}
      icon={<ImageIcon className={iconClassName} />}
    />
  );
};

export const GalleryDirectory: React.FC<{ images: GalleryImage[] }> = ({ images }) => {
  const [filter, setFilter] = useState<Filter>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const items = useMemo(
    () =>
      filter === "All"
        ? [...images].sort((a, b) => a.order - b.order)
        : images
            .filter((img) => img.category === filter)
            .sort((a, b) => a.order - b.order),
    [filter, images]
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length)),
    [items.length]
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length]
  );

  // Keyboard navigation + scroll lock while the lightbox is open.
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, prev, next, closeLightbox]);

  const activeImage = lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <div>
      {/* Album / category navigation */}
      <div
        className="flex flex-wrap items-center gap-2 mb-12"
        role="tablist"
        aria-label="Browse gallery albums"
      >
        {filterOptions.map((option) => {
          const isActive = filter === option;
          const count =
            option === "All" ? images.length : images.filter((i) => i.category === option).length;
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setFilter(option);
                setLightboxIndex(null);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                isActive
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:text-amber-700 dark:hover:text-amber-400"
              }`}
            >
              {option}
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

      {items.length === 0 ? (
        <EmptyState
          title={`No photos in ${filter === "All" ? "this album" : filter} yet`}
          description="Photographs will appear here once they are uploaded by the media team."
          icon={<Camera className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />}
        />
      ) : (
        /* Responsive photo grid */
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [&>*]:mb-6">
          {items.map((image, index) => (
            <figure
              key={image.id}
              className="group break-inside-avoid bg-white dark:bg-slate-900/50 p-3 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                aria-label={`Open photo: ${image.alt}`}
                className="relative block w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <GalleryPhoto
                  image={image}
                  aspectRatio={index % 3 === 0 ? "aspect-[4/3]" : "aspect-square"}
                />
                <span className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="w-11 h-11 rounded-full bg-white/90 text-slate-900 flex items-center justify-center">
                    <Maximize2 className="w-5 h-5" />
                  </span>
                </span>
              </button>
              <figcaption className="px-1 pt-3 pb-1 text-left">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-widest uppercase">
                  {image.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {image.alt}
                </h4>
                {image.caption && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {image.caption}
                  </p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo viewer: ${activeImage.alt}`}
          className="fixed inset-0 z-[60] flex flex-col bg-slate-950/95 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between p-4 sm:p-6 text-white">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                {activeImage.category}
              </span>
              <span className="text-sm font-semibold mt-0.5">
                {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {items.length}
              </span>
            </div>
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close photo viewer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Photo + caption */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-12 min-h-0">
            <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <GalleryPhoto image={activeImage} aspectRatio="aspect-video" iconClassName="w-16 h-16 text-slate-500" />
            </div>
            <div className="max-w-4xl w-full mt-6 text-center px-2" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-white font-bold text-lg leading-snug">{activeImage.alt}</h4>
              {activeImage.caption && (
                <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">{activeImage.caption}</p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 p-6">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous photo"
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next photo"
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
