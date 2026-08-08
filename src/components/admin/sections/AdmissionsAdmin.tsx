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
  saveAdmissionSection,
  deleteRecord,
  setActive,
  moveRecord,
} from "@/lib/admin/actions/admissions";

const ADMISSION_SECTION_KEYS = [
  { value: "introduction", label: "Introduction" },
  { value: "eligibility", label: "Eligibility" },
  { value: "classes", label: "Classes Available" },
  { value: "documents", label: "Required Documents" },
  { value: "procedure", label: "Admission Procedure" },
  { value: "important-dates", label: "Important Dates" },
  { value: "application-link", label: "Application Link" },
  { value: "fees", label: "Fee Structure" },
  { value: "forms", label: "Downloadable Forms" },
  { value: "contact", label: "Admissions Contact" },
];

export function AdmissionsAdmin({ sections }: { sections: Record<string, any>[] }) {
  const items = sections.map((s) => ({
    id: s.id,
    title: s.title || s.section_key,
    subtitle: s.section_key,
    published: Boolean(s.is_active),
    ...s,
  }));

  return (
    <div>
      <PageHeader
        title="Admissions"
        description="Manage admissions content: introduction, eligibility, documents, procedure, fees, forms and contact."
      />

      <RecordManager
        title="Admission Sections"
        addLabel="Add Section"
        items={items}
        emptyForm={() => ({
          section_key: "introduction",
          title: "",
          body: "",
          image_url: "",
          sort_order: 0,
          is_active: true,
        })}
        renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <TSelect label="Section" form={form} setForm={setForm} field="section_key" options={ADMISSION_SECTION_KEYS} required />
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
        onSave={saveAdmissionSection}
        onDelete={(id) => deleteRecord("admissions", id)}
        onToggle={(id, v) => setActive("admissions", id, v)}
        onMove={(id, d) => moveRecord("admissions", id, d)}
      />
    </div>
  );
}
