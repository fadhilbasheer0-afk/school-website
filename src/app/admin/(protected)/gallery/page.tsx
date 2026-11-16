import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/auth";
import { fetchRows } from "@/lib/admin/fetch";
import { GalleryAdmin } from "@/components/admin/sections/GalleryAdmin";

export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  const session = await requireAdmin();
  const [albums, photos] = await Promise.all([
    fetchRows("gallery_albums", session.schoolId),
    fetchRows("gallery_photos", session.schoolId),
  ]);

  return <GalleryAdmin albums={albums} photos={photos} />;
}
