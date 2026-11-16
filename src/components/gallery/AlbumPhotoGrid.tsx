"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Camera,
} from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { EmptyState } from "@/components/ui/FeedbackStates";
import type { GalleryImage } from "@/data/gallery";

/**
 * Responsive photo grid with a full-screen lightbox. Used on the album
 * detail page. Photos without a real `src` (no CMS upload yet) render a
 * neutral placeholder.
 */
export const AlbumPhotoGrid: React.FC<{ photos: GalleryImage[] }> = ({ photos }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const items = useMemo(
    () => [...photos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [photos]
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length));
  }, [items.length]);
  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % items.length));
  }, [items.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, prev, next]);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No photos yet"
        description="Photographs for this album will appear here once they are uploaded by the media team."
        icon={<Camera className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />}
      />
    );
  }

  const active = lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((image, idx) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setLightboxIndex(idx)}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="overflow-hidden">
              {image.src ? (
                // eslint-disable-next-line @next/next/no-img-element -- CMS uploads use plain <img>
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <ImagePlaceholder
                  label={image.alt}
                  aspectRatio="aspect-[4/3]"
                  icon={<ImageIcon className="w-8 h-8 text-slate-400" />}
                />
              )}
            </div>
            <div className="p-4">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{image.alt}</p>
              {image.caption && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">{image.caption}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close lightbox"
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous photo"
            className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
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
            className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-5xl w-full">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              {active.src ? (
                // eslint-disable-next-line @next/next/no-img-element -- CMS uploads use plain <img>
                <img
                  src={active.src}
                  alt={active.alt}
                  className="w-full max-h-[70vh] object-contain bg-slate-950"
                />
              ) : (
                <ImagePlaceholder
                  label={active.alt}
                  aspectRatio="aspect-[4/3]"
                  icon={<ImageIcon className="w-8 h-8 text-slate-400" />}
                />
              )}
            </div>
            <div className="flex items-center justify-between gap-4 mt-4 text-white">
              <div>
                <p className="text-sm font-bold">{active.alt}</p>
                {active.caption && <p className="text-xs text-slate-400 mt-1">{active.caption}</p>}
              </div>
              <span className="text-xs text-slate-400">
                {lightboxIndex! + 1} / {items.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
