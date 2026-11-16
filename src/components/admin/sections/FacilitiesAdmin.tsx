"use client";

import React from "react";
import { RecordManager, FormActions, PageHeader } from "@/components/admin/ui";
import {
  TInput,
  TTextarea,
  TNumber,
  TSwitch,
  TImage,
} from "@/components/admin/fields";
import { FormField, Textarea } from "@/components/ui/Form";
import { ASSET_FOLDERS } from "@/lib/storage";
import {
  saveFacility,
  deleteRecord,
  setActive,
  moveRecord,
} from "@/lib/admin/actions/facilities";

export function FacilitiesAdmin({ facilities }: { facilities: Record<string, any>[] }) {
  const items = facilities.map((f) => ({
    id: f.id,
    title: f.name,
    subtitle: Array.isArray(f.features) && f.features.length ? `${f.features.length} features` : undefined,
    published: Boolean(f.is_active),
    ...f,
  }));

  return (
    <div>
      <PageHeader
        title="Facilities"
        description="Manage campus facilities: name, description, features, images and visibility."
      />

      <RecordManager
        title="Facilities"
        addLabel="Add Facility"
        items={items}
        emptyForm={() => ({
          name: "",
          description: "",
          features: "",
          image_url: "",
          sort_order: 0,
          is_active: true,
        })}
        editForm={(merged, item) => ({
          ...merged,
          features: Array.isArray(item.features) ? item.features.join("\n") : item.features ?? "",
        })}
        renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <TInput label="Name" form={form} setForm={setForm} field="name" required />
            <TTextarea label="Description" form={form} setForm={setForm} field="description" rows={5} />
            <FormField
              label="Features"
              helperText="One feature per line, e.g. “Physics laboratory”, “Tennis courts”."
            >
              <Textarea
                rows={4}
                value={typeof form.features === "string" ? form.features : ""}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
              />
            </FormField>
            <TImage label="Image" form={form} setForm={setForm} field="image_url" folder={ASSET_FOLDERS.facilities} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
              <TSwitch label="Published on site" form={form} setForm={setForm} field="is_active" />
            </div>
            <FormActions error={error} submitting={submitting} onCancel={onCancel} />
          </form>
        )}
        onSave={async (form) =>
          saveFacility({
            ...form,
            features:
              typeof form.features === "string"
                ? form.features.split("\n").map((s) => s.trim()).filter(Boolean)
                : form.features,
          })
        }
        onDelete={(id) => deleteRecord("facilities", id)}
        onToggle={(id, v) => setActive("facilities", id, v)}
        onMove={(id, d) => moveRecord("facilities", id, d)}
      />
    </div>
  );
}
