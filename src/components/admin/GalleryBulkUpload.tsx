"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, X, Loader2, AlertCircle, Images as ImagesIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form";
import { useToast } from "@/components/admin/ui";
import { uploadFilesToStorage } from "@/lib/storage-upload";
import { saveGalleryPhotosBatch } from "@/lib/admin/actions/gallery";
import { validateFile, ASSET_FOLDERS, type StorageKind } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface PendingPhoto {
  id: string;
  file: File;
  url: string;
  title: string;
}

const IMAGE_KIND: StorageKind = "image";

/**
 * Multi-photo upload panel for a gallery album: pick several images, preview
 * them, give each a caption, then upload them all to storage and create the
 * gallery_photos rows in one call.
 */
export function GalleryBulkUpload({
  albumId,
  albumLabel,
}: {
  albumId: string;
  albumLabel: string;
}) {
  const router = useRouter();
  const { show } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [savedCount, setSavedCount] = useState(0);

  const hasAlbum = Boolean(albumId);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setError("");
    const next: PendingPhoto[] = [];
    for (const file of Array.from(files)) {
      const validation = validateFile(file, IMAGE_KIND);
      if (!validation.ok) {
        setError(validation.error);
        continue;
      }
      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        url: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, ""),
      });
    }
    setPending((prev) => [...prev, ...next]);
  };

  const updateTitle = (id: string, title: string) =>
    setPending((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title } : p))
    );

  const removePhoto = (id: string) =>
    setPending((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      return prev.filter((p) => p.id !== id);
    });

  const uploadAll = async () => {
    if (!hasAlbum || pending.length === 0) return;
    setUploading(true);
    setError("");
    setSavedCount(0);
    try {
      const stored = await uploadFilesToStorage(
        ASSET_FOLDERS.gallery,
        pending.map((p) => p.file),
        IMAGE_KIND,
        setProgress
      );

      const result = await saveGalleryPhotosBatch({
        album_id: albumId,
        items: stored.map((s, i) => ({
          title: pending[i]?.title || "",
          description: pending[i]?.title || "",
          image_url: s.url,
          storage_path: s.path,
          alt_text: pending[i]?.title || "",
          captured_at: "",
        })),
      });

      if (!result.ok) {
        throw new Error(result.error || "Failed to save the photos.");
      }

      setSavedCount(stored.length);
      setPending((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.url));
        return [];
      });
      setProgress(0);
      show(`${stored.length} photo${stored.length === 1 ? "" : "s"} uploaded to “${albumLabel}”.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!hasAlbum) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Upload Multiple Photos
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Add several photos to “{albumLabel}” at once. Each photo becomes a
            row you can edit, caption, reorder or unpublish afterwards.
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
          disabled={uploading}
        />
        {isSupabaseConfigured ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            leftIcon={uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagesIcon className="w-4 h-4" />}
          >
            {uploading ? "Uploading…" : "Choose Images"}
          </Button>
        ) : (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Upload requires Supabase to be configured.
          </p>
        )}
      </div>

      {pending.length > 0 && (
        <div className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pending.map((photo) => (
              <div
                key={photo.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800/60"
              >
                <div className="relative aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    disabled={uploading}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-950/60 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                    aria-label="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2">
                  <Input
                    value={photo.title}
                    onChange={(e) => updateTitle(photo.id, e.target.value)}
                    placeholder="Caption"
                    disabled={uploading}
                    className="!px-2 !py-1.5 !text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          {uploading && (
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-10 text-right">
                {progress}%
              </span>
            </div>
          )}

          {error && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 mt-3">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 mt-4">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {pending.length} photo{pending.length === 1 ? "" : "s"} selected
            </span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={uploadAll}
              disabled={uploading || pending.length === 0}
              leftIcon={uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            >
              {uploading ? "Uploading…" : `Upload ${pending.length} Photo${pending.length === 1 ? "" : "s"}`}
            </Button>
          </div>
        </div>
      )}

      {savedCount > 0 && (
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-3">
          {savedCount} photo{savedCount === 1 ? "" : "s"} added successfully.
        </p>
      )}
    </div>
  );
}
