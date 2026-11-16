import React from "react";
import { notFound } from "next/navigation";
import { Camera } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryAlbumDirectory } from "@/components/gallery/GalleryAlbumDirectory";
import { GalleryDirectory } from "@/components/gallery/GalleryDirectory";
import { getGalleryAlbums, getGalleryImages } from "@/lib/content";
import { resolveTenant, isPageEnabled } from "@/lib/tenant";

export default async function Gallery() {
  const tenant = await resolveTenant();
  const enabled = await isPageEnabled(tenant.id, "gallery");
  if (!enabled) notFound();

  const [albums, images] = await Promise.all([
    getGalleryAlbums(tenant.id),
    getGalleryImages(undefined, tenant.id),
  ]);

  return (
    <div className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <SectionHeading
          badge="Media Archives"
          title="Campus Photo Gallery"
          subtitle="Explore visual snapshots of student activities, state-of-the-art facilities, and student achievement milestones."
          align="center"
          className="mx-auto"
        />

        {albums.length > 0 ? (
          <div className="mt-12">
            <GalleryAlbumDirectory albums={albums} photos={images} />
          </div>
        ) : (
          <>
            {/* CMS Notice */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 md:p-8 my-16 text-center max-w-2xl mx-auto">
              <Camera className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-pulse" />
              <h3 className="text-lg font-bold text-white mb-2">CMS Media Repository</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                This module represents visual layouts ready for rendering. Administrators upload actual
                photographs, event directories, and campus tours using the CMS database.
              </p>
            </div>

            {/* Interactive gallery directory (seed fallback) */}
            <GalleryDirectory images={images} />
          </>
        )}
      </div>
    </div>
  );
}
