"use client";

import React from "react";
import { RecordManager, FormActions, PageHeader } from "@/components/admin/ui";
import {
  TInput,
  TNumber,
  TSelect,
  TSwitch,
} from "@/components/admin/fields";
import {
  saveContactInfo,
  deleteRecord,
  setActive,
  moveRecord,
} from "@/lib/admin/actions/contact";

const CONTACT_TYPES = [
  { value: "address", label: "Address" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "hours", label: "Office Hours" },
  { value: "website", label: "Website" },
  { value: "map", label: "Map / Directions" },
  { value: "coordinates", label: "Coordinates" },
  { value: "social", label: "Social Link" },
  { value: "form", label: "Contact Form" },
  { value: "other", label: "Other" },
];

export function ContactAdmin({ contact }: { contact: Record<string, any>[] }) {
  const items = contact.map((c) => ({
    id: c.id,
    title: c.label,
    subtitle: [c.type, c.is_primary ? "Primary" : ""].filter(Boolean).join(" · "),
    published: Boolean(c.is_active),
  }));

  return (
    <div>
      <PageHeader
        title="Contact"
        description="Manage the contact details shown on the Contact page."
      />

      <RecordManager
        title="Contact Details"
        addLabel="Add Detail"
        items={items}
        emptyForm={() => ({
          label: "",
          type: "phone",
          value: "",
          is_primary: false,
          sort_order: 0,
          is_active: true,
        })}
        renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TInput label="Label" form={form} setForm={setForm} field="label" required placeholder="e.g. Main Office" />
              <TSelect label="Type" form={form} setForm={setForm} field="type" options={CONTACT_TYPES} required />
            </div>
            <TInput label="Value" form={form} setForm={setForm} field="value" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
              <TSwitch label="Primary contact" form={form} setForm={setForm} field="is_primary" />
            </div>
            <TSwitch label="Visible on site" form={form} setForm={setForm} field="is_active" />
            <FormActions error={error} submitting={submitting} onCancel={onCancel} />
          </form>
        )}
        onSave={saveContactInfo}
        onDelete={(id) => deleteRecord("contact_information", id)}
        onToggle={(id, v) => setActive("contact_information", id, v)}
        onMove={(id, d) => moveRecord("contact_information", id, d)}
      />
    </div>
  );
}
