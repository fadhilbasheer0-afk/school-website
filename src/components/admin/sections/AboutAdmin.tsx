"use client";

import React from "react";
import { RecordManager, FormActions, PageHeader } from "@/components/admin/ui";
import {
  TInput,
  TTextarea,
  TNumber,
  TSelect,
  TSwitch,
  TImage,
} from "@/components/admin/fields";
import { ASSET_FOLDERS } from "@/lib/storage";
import {
  saveAboutContent,
  deleteRecord,
  setActive,
  moveRecord,
} from "@/lib/admin/actions/about";

const ABOUT_SECTION_KEYS = [
  { value: "intro", label: "Introduction" },
  { value: "history", label: "History" },
  { value: "vision", label: "Vision" },
  { value: "mission", label: "Mission" },
  { value: "core-values", label: "Core Values" },
  { value: "principal", label: "Principal's Message" },
  { value: "management", label: "Management" },
];

export function AboutAdmin({ content }: { content: Record<string, any>[] }) {
  const items = content.map((c) => ({
    id: c.id,
    title: c.title || c.section_key,
    subtitle: c.section_key,
    published: Boolean(c.is_active),
    ...c,
  }));

  return (
    <div>
      <PageHeader
        title="About"
        description="Manage the About page: introduction, history, vision, mission, core values, principal and management."
      />

      <RecordManager
        title="Content Sections"
        description="Each section appears on the About page in the order shown."
        items={items}
        emptyForm={() => ({
          section_key: "intro",
          title: "",
          body: "",
          image_url: "",
          sort_order: 0,
          is_active: true,
        })}
        renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <TSelect label="Section" form={form} setForm={setForm} field="section_key" options={ABOUT_SECTION_KEYS} required />
            <TInput label="Title" form={form} setForm={setForm} field="title" required />
            <TTextarea label="Body" form={form} setForm={setForm} field="body" rows={8} />
            <TImage label="Image" form={form} setForm={setForm} field="image_url" folder={ASSET_FOLDERS.banners} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
              <TSwitch label="Visible on site" form={form} setForm={setForm} field="is_active" />
            </div>
            <FormActions error={error} submitting={submitting} onCancel={onCancel} />
          </form>
        )}
        onSave={saveAboutContent}
        onDelete={(id) => deleteRecord("about_content", id)}
        onToggle={(id, v) => setActive("about_content", id, v)}
        onMove={(id, d) => moveRecord("about_content", id, d)}
      />
    </div>
  );
}
