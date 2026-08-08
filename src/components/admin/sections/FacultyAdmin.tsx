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
  saveTeacher,
  deleteRecord,
  setActive,
  moveRecord,
} from "@/lib/admin/actions/faculty";

export function FacultyAdmin({
  teachers,
  departments,
}: {
  teachers: Record<string, any>[];
  departments: Record<string, any>[];
}) {
  const items = teachers.map((t) => ({
    id: t.id,
    title: t.name,
    subtitle: [t.title, t.academic_departments?.name].filter(Boolean).join(" · "),
    published: Boolean(t.is_active),
    ...t,
  }));

  const deptOptions = departments.map((d) => ({ value: d.id, label: d.name }));

  return (
    <div>
      <PageHeader
        title="Faculty & Staff"
        description="Manage teacher and staff profiles shown on the Faculty page."
      />

      <RecordManager
        title="Faculty Members"
        addLabel="Add Faculty Member"
        items={items}
        emptyForm={() => ({
          name: "",
          title: "",
          department_id: "",
          qualifications: "",
          email: "",
          phone: "",
          bio: "",
          image_url: "",
          sort_order: 0,
          is_active: true,
        })}
        renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TInput label="Full Name" form={form} setForm={setForm} field="name" required />
              <TInput label="Designation" form={form} setForm={setForm} field="title" placeholder="e.g. Head of Mathematics" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TSelect label="Department" form={form} setForm={setForm} field="department_id" options={deptOptions} placeholder="No department" />
              <TInput label="Qualifications" form={form} setForm={setForm} field="qualifications" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TInput label="Email" type="email" form={form} setForm={setForm} field="email" />
              <TInput label="Phone" form={form} setForm={setForm} field="phone" />
            </div>
            <TTextarea label="Biography" form={form} setForm={setForm} field="bio" rows={5} />
            <TImage label="Photo" form={form} setForm={setForm} field="image_url" folder={ASSET_FOLDERS.teachers} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
              <TSwitch label="Published on site" form={form} setForm={setForm} field="is_active" />
            </div>
            <FormActions error={error} submitting={submitting} onCancel={onCancel} />
          </form>
        )}
        onSave={saveTeacher}
        onDelete={(id) => deleteRecord("teachers", id)}
        onToggle={(id, v) => setActive("teachers", id, v)}
        onMove={(id, d) => moveRecord("teachers", id, d)}
        confirmMessage={(item) => `This will permanently delete “${item.title}” from the faculty directory.`}
      />
    </div>
  );
}
