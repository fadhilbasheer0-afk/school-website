"use client";

import React, { useState } from "react";
import {
  Tabs,
  RecordManager,
  FormActions,
  PageHeader,
} from "@/components/admin/ui";
import {
  TInput,
  TTextarea,
  TNumber,
  TSwitch,
  TImage,
} from "@/components/admin/fields";
import { GalleryBulkUpload } from "@/components/admin/GalleryBulkUpload";
import { ASSET_FOLDERS } from "@/lib/storage";
import {
  saveGalleryAlbum,
  saveGalleryPhoto,
  deleteRecord,
  setActive,
  moveRecord,
} from "@/lib/admin/actions/gallery";

export function GalleryAdmin({
  albums,
  photos,
}: {
  albums: Record<string, any>[];
  photos: Record<string, any>[];
}) {
  const [selectedAlbumId, setSelectedAlbumId] = useState(albums[0]?.id ?? "");

  const albumItems = albums.map((a) => ({
    id: a.id,
    title: a.title,
    subtitle: a.slug,
    published: Boolean(a.is_active),
    ...a,
  }));

  const albumOptions = albums.map((a) => ({ value: a.id, label: a.title }));
  const selectedAlbum = albums.find((a) => a.id === selectedAlbumId);
  const scopedPhotos = photos.filter((p) => p.album_id === selectedAlbumId);
  const photoItems = scopedPhotos.map((p) => ({
    id: p.id,
    title: p.title || "Untitled photo",
    subtitle: [p.captured_at, p.alt_text || p.description].filter(Boolean).join(" · "),
    published: Boolean(p.is_active),
    ...p,
  }));

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="Manage photo albums and the photos within them. Photos can be added one at a time or uploaded in bulk, captioned, dated, reordered, replaced and published/unpublished."
      />

      <Tabs
        tabs={[
          {
            key: "albums",
            label: "Albums",
            content: (
              <RecordManager
                title="Albums"
                addLabel="Add Album"
                items={albumItems}
                emptyForm={() => ({
                  title: "",
                  description: "",
                  cover_image_url: "",
                  storage_path: "",
                  sort_order: 0,
                  is_active: true,
                })}
                renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
                  <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <TInput label="Title" form={form} setForm={setForm} field="title" required />
                    <TTextarea label="Description" form={form} setForm={setForm} field="description" rows={4} />
                    <TImage label="Cover Image" form={form} setForm={setForm} field="cover_image_url" folder={ASSET_FOLDERS.gallery} pathField="storage_path" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
                      <TSwitch label="Published on site" form={form} setForm={setForm} field="is_active" />
                    </div>
                    <FormActions error={error} submitting={submitting} onCancel={onCancel} />
                  </form>
                )}
                onSave={saveGalleryAlbum}
                onDelete={(id) => deleteRecord("gallery_albums", id)}
                onToggle={(id, v) => setActive("gallery_albums", id, v)}
                onMove={(id, d) => moveRecord("gallery_albums", id, d)}
              />
            ),
          },
          {
            key: "photos",
            label: "Photos",
            content: (
              <div className="flex flex-col gap-6">
                <div className="max-w-sm">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Album
                  </label>
                  <select
                    value={selectedAlbumId}
                    onChange={(e) => setSelectedAlbumId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-base text-slate-900 dark:text-white transition-all duration-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                  >
                    {albumOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <GalleryBulkUpload
                  albumId={selectedAlbumId}
                  albumLabel={selectedAlbum?.title ?? "selected album"}
                />

                <RecordManager
                  key={selectedAlbumId || "none"}
                  title="Photos"
                  addLabel="Add Photo"
                  items={photoItems}
                  emptyForm={() => ({
                    album_id: selectedAlbumId,
                    title: "",
                    description: "",
                    image_url: "",
                    storage_path: "",
                    alt_text: "",
                    captured_at: "",
                    sort_order: 0,
                    is_active: true,
                  })}
                  renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
                    <form onSubmit={onSubmit} className="flex flex-col gap-5">
                      <TImage label="Image" form={form} setForm={setForm} field="image_url" required folder={ASSET_FOLDERS.gallery} pathField="storage_path" />
                      <TInput label="Caption" form={form} setForm={setForm} field="title" helperText="Short caption shown with the photo." />
                      <TInput label="Alt Text" form={form} setForm={setForm} field="alt_text" />
                      <TInput label="Date Taken" type="date" form={form} setForm={setForm} field="captured_at" />
                      <TTextarea label="Description" form={form} setForm={setForm} field="description" rows={3} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
                        <TSwitch label="Published on site" form={form} setForm={setForm} field="is_active" />
                      </div>
                      <FormActions error={error} submitting={submitting} onCancel={onCancel} />
                    </form>
                  )}
                  onSave={saveGalleryPhoto}
                  onDelete={(id) => deleteRecord("gallery_photos", id)}
                  onToggle={(id, v) => setActive("gallery_photos", id, v)}
                  onMove={(id, d) => moveRecord("gallery_photos", id, d)}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
