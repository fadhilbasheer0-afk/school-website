"use client";

import React from "react";
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
  TSelect,
  TSwitch,
  TImage,
  TFile,
} from "@/components/admin/fields";
import { ASSET_FOLDERS } from "@/lib/storage";
import {
  saveAcademicContent,
  saveAcademicClass,
  saveAcademicDepartment,
  saveAcademicCalendar,
  saveDocument,
  deleteRecord,
  setActive,
  moveRecord,
} from "@/lib/admin/actions/academics";

const CLASS_LEVELS = [
  { value: "Early Years", label: "Early Years" },
  { value: "Primary", label: "Primary" },
  { value: "Middle", label: "Middle School" },
  { value: "High", label: "High School" },
];

export function AcademicsAdmin({
  content,
  classes,
  departments,
  calendar,
  documents,
}: {
  content: Record<string, any>[];
  classes: Record<string, any>[];
  departments: Record<string, any>[];
  calendar: Record<string, any>[];
  documents: Record<string, any>[];
}) {
  const contentItems = content.map((c) => ({
    id: c.id,
    title: c.title || c.slug,
    subtitle: c.slug,
    published: Boolean(c.is_active),
    ...c,
  }));
  const classItems = classes.map((c) => ({
    id: c.id,
    title: c.grade_label || c.level,
    subtitle: c.level,
    published: Boolean(c.is_active),
    ...c,
  }));
  const deptItems = departments.map((d) => ({
    id: d.id,
    title: d.name,
    subtitle: d.slug,
    published: Boolean(d.is_active),
    ...d,
  }));
  const calItems = calendar.map((c) => ({
    id: c.id,
    title: c.title,
    subtitle: [c.start_date, c.end_date].filter(Boolean).join(" → "),
    published: Boolean(c.is_active),
    ...c,
  }));
  const docItems = documents.map((d) => ({
    id: d.id,
    title: d.title,
    subtitle: d.category || "Document",
    published: Boolean(d.is_active),
    ...d,
  }));

  return (
    <div>
      <PageHeader
        title="Academics"
        description="Manage academic content, classes, departments, the academic calendar and downloadable documents."
      />

      <Tabs
        tabs={[
          {
            key: "content",
            label: "Content",
            content: (
              <RecordManager
                title="Content Sections"
                description="General academic information, curriculum overview, etc."
                items={contentItems}
                emptyForm={() => ({
                  slug: "",
                  title: "",
                  summary: "",
                  body: "",
                  image_url: "",
                  sort_order: 0,
                  is_active: true,
                })}
                renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
                  <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <TInput label="Slug" form={form} setForm={setForm} field="slug" required helperText="Used for the URL, e.g. “curriculum”." />
                    <TInput label="Title" form={form} setForm={setForm} field="title" required />
                    <TTextarea label="Summary" form={form} setForm={setForm} field="summary" rows={3} />
                    <TTextarea label="Body" form={form} setForm={setForm} field="body" rows={8} />
                    <TImage label="Image" form={form} setForm={setForm} field="image_url" folder={ASSET_FOLDERS.banners} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
                      <TSwitch label="Visible on site" form={form} setForm={setForm} field="is_active" />
                    </div>
                    <FormActions error={error} submitting={submitting} onCancel={onCancel} />
                  </form>
                )}
                onSave={saveAcademicContent}
                onDelete={(id) => deleteRecord("academic_content", id)}
                onToggle={(id, v) => setActive("academic_content", id, v)}
                onMove={(id, d) => moveRecord("academic_content", id, d)}
              />
            ),
          },
          {
            key: "classes",
            label: "Classes",
            content: (
              <RecordManager
                title="Classes"
                description="Grade levels offered by the school."
                items={classItems}
                emptyForm={() => ({
                  level: "Primary",
                  grade_label: "",
                  age_range: "",
                  description: "",
                  sort_order: 0,
                  is_active: true,
                })}
                renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
                  <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TSelect label="Level" form={form} setForm={setForm} field="level" options={CLASS_LEVELS} required />
                      <TInput label="Grade Label" form={form} setForm={setForm} field="grade_label" required placeholder="e.g. Grade 1" />
                    </div>
                    <TInput label="Age Range" form={form} setForm={setForm} field="age_range" placeholder="e.g. 6 – 7 years" />
                    <TTextarea label="Description" form={form} setForm={setForm} field="description" rows={5} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
                      <TSwitch label="Visible on site" form={form} setForm={setForm} field="is_active" />
                    </div>
                    <FormActions error={error} submitting={submitting} onCancel={onCancel} />
                  </form>
                )}
                onSave={saveAcademicClass}
                onDelete={(id) => deleteRecord("academic_classes", id)}
                onToggle={(id, v) => setActive("academic_classes", id, v)}
                onMove={(id, d) => moveRecord("academic_classes", id, d)}
              />
            ),
          },
          {
            key: "departments",
            label: "Departments",
            content: (
              <RecordManager
                title="Departments"
                description="Subject departments shown on the Academics page."
                items={deptItems}
                emptyForm={() => ({
                  slug: "",
                  name: "",
                  description: "",
                  image_url: "",
                  sort_order: 0,
                  is_active: true,
                })}
                renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
                  <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <TInput label="Name" form={form} setForm={setForm} field="name" required />
                    <TInput label="Slug" form={form} setForm={setForm} field="slug" required helperText="Used for the URL, e.g. “science”." />
                    <TTextarea label="Description" form={form} setForm={setForm} field="description" rows={5} />
                    <TImage label="Image" form={form} setForm={setForm} field="image_url" folder={ASSET_FOLDERS.banners} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
                      <TSwitch label="Visible on site" form={form} setForm={setForm} field="is_active" />
                    </div>
                    <FormActions error={error} submitting={submitting} onCancel={onCancel} />
                  </form>
                )}
                onSave={saveAcademicDepartment}
                onDelete={(id) => deleteRecord("academic_departments", id)}
                onToggle={(id, v) => setActive("academic_departments", id, v)}
                onMove={(id, d) => moveRecord("academic_departments", id, d)}
              />
            ),
          },
          {
            key: "calendar",
            label: "Calendar",
            content: (
              <RecordManager
                title="Academic Calendar"
                description="Term dates and important academic events."
                items={calItems}
                emptyForm={() => ({
                  title: "",
                  description: "",
                  start_date: "",
                  end_date: "",
                  sort_order: 0,
                  is_active: true,
                })}
                renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
                  <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <TInput label="Title" form={form} setForm={setForm} field="title" required />
                    <TTextarea label="Description" form={form} setForm={setForm} field="description" rows={4} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TInput label="Start Date" type="date" form={form} setForm={setForm} field="start_date" />
                      <TInput label="End Date" type="date" form={form} setForm={setForm} field="end_date" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
                      <TSwitch label="Visible on site" form={form} setForm={setForm} field="is_active" />
                    </div>
                    <FormActions error={error} submitting={submitting} onCancel={onCancel} />
                  </form>
                )}
                onSave={saveAcademicCalendar}
                onDelete={(id) => deleteRecord("academic_calendar", id)}
                onToggle={(id, v) => setActive("academic_calendar", id, v)}
                onMove={(id, d) => moveRecord("academic_calendar", id, d)}
              />
            ),
          },
          {
            key: "documents",
            label: "Documents",
            content: (
              <RecordManager
                title="Documents"
                description="Curriculum downloads and school documents."
                items={docItems}
                emptyForm={() => ({
                  title: "",
                  description: "",
                  file_url: "",
                  category: "",
                  sort_order: 0,
                  is_active: true,
                })}
                renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
                  <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <TInput label="Title" form={form} setForm={setForm} field="title" required />
                    <TTextarea label="Description" form={form} setForm={setForm} field="description" rows={4} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TFile label="File" form={form} setForm={setForm} field="file_url" folder={ASSET_FOLDERS.documents} helperText="Upload a PDF or document." />
                      <TInput label="Category" form={form} setForm={setForm} field="category" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
                      <TSwitch label="Visible on site" form={form} setForm={setForm} field="is_active" />
                    </div>
                    <FormActions error={error} submitting={submitting} onCancel={onCancel} />
                  </form>
                )}
                onSave={saveDocument}
                onDelete={(id) => deleteRecord("documents", id)}
                onToggle={(id, v) => setActive("documents", id, v)}
                onMove={(id, d) => moveRecord("documents", id, d)}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
