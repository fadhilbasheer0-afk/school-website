"use client";

import React from "react";
import { RecordManager, FormActions, PageHeader } from "@/components/admin/ui";
import {
  TInput,
  TTextarea,
  TSwitch,
  TImage,
  TFile,
} from "@/components/admin/fields";
import { ASSET_FOLDERS } from "@/lib/storage";
import {
  saveAnnouncement,
  deleteRecord,
  setPublished,
  setFeatured,
} from "@/lib/admin/actions/news";

export function NewsAdmin({ announcements }: { announcements: Record<string, any>[] }) {
  const items = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    subtitle: [a.category, a.published_at ? new Date(a.published_at).toLocaleDateString() : "Draft"]
      .filter(Boolean)
      .join(" · "),
    published: Boolean(a.is_published),
    featured: Boolean(a.is_featured),
    ...a,
  }));

  return (
    <div>
      <PageHeader
        title="News & Announcements"
        description="Manage news posts and announcements. Posts are ordered by publish date."
      />

      <RecordManager
        title="Posts"
        addLabel="New Post"
        items={items}
        showReorder={false}
        emptyForm={() => ({
          title: "",
          category: "",
          summary: "",
          content: "",
          author: "",
          image_url: "",
          attachment_url: "",
          is_featured: false,
          is_published: false,
        })}
        renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <TInput label="Title" form={form} setForm={setForm} field="title" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TInput label="Category" form={form} setForm={setForm} field="category" placeholder="e.g. Announcement, News" />
              <TInput label="Author" form={form} setForm={setForm} field="author" />
            </div>
            <TTextarea label="Summary" form={form} setForm={setForm} field="summary" rows={3} />
            <TTextarea label="Content" form={form} setForm={setForm} field="content" rows={10} />
            <TImage label="Featured Image" form={form} setForm={setForm} field="image_url" folder={ASSET_FOLDERS.banners} />
            <TFile label="Attachment" form={form} setForm={setForm} field="attachment_url" folder={ASSET_FOLDERS.documents} helperText="Optional PDF or document linked to this post." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TSwitch label="Featured" form={form} setForm={setForm} field="is_featured" />
              <TSwitch label="Published" form={form} setForm={setForm} field="is_published" />
            </div>
            <FormActions error={error} submitting={submitting} onCancel={onCancel} />
          </form>
        )}
        onSave={saveAnnouncement}
        onDelete={(id) => deleteRecord("announcements", id)}
        onToggle={(id, v) => setPublished("announcements", id, v)}
        onToggleFeatured={(id, v) => setFeatured("announcements", id, v)}
        confirmMessage={(item) => `This will permanently delete “${item.title}”.`}
      />
    </div>
  );
}
