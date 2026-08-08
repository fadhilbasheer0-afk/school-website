"use client";

import React from "react";
import { RecordManager, FormActions, PageHeader } from "@/components/admin/ui";
import {
  TInput,
  TTextarea,
  TSwitch,
  TImage,
} from "@/components/admin/fields";
import { ASSET_FOLDERS } from "@/lib/storage";
import {
  saveEvent,
  deleteRecord,
  setPublished,
  setFeatured,
} from "@/lib/admin/actions/events";

export function EventsAdmin({ events }: { events: Record<string, any>[] }) {
  const items = events.map((e) => ({
    id: e.id,
    title: e.title,
    subtitle: [e.category, e.start_date, e.venue].filter(Boolean).join(" · "),
    published: Boolean(e.is_published),
    featured: Boolean(e.is_featured),
    ...e,
  }));

  return (
    <div>
      <PageHeader
        title="Events"
        description="Manage school events. Events are ordered by start date."
      />

      <RecordManager
        title="Events"
        addLabel="Add Event"
        items={items}
        showReorder={false}
        emptyForm={() => ({
          title: "",
          category: "",
          description: "",
          start_date: "",
          start_time: "",
          end_time: "",
          venue: "",
          image_url: "",
          registration_url: "",
          contact_email: "",
          is_featured: false,
          is_published: false,
        })}
        renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <TInput label="Title" form={form} setForm={setForm} field="title" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TInput label="Category" form={form} setForm={setForm} field="category" placeholder="e.g. Sports, Cultural" />
              <TInput label="Venue" form={form} setForm={setForm} field="venue" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <TInput label="Start Date" type="date" form={form} setForm={setForm} field="start_date" required />
              <TInput label="Start Time" type="time" form={form} setForm={setForm} field="start_time" />
              <TInput label="End Time" type="time" form={form} setForm={setForm} field="end_time" />
            </div>
            <TTextarea label="Description" form={form} setForm={setForm} field="description" rows={5} />
            <TImage label="Image" form={form} setForm={setForm} field="image_url" folder={ASSET_FOLDERS.events} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TInput label="Registration URL" form={form} setForm={setForm} field="registration_url" />
              <TInput label="Contact Email" type="email" form={form} setForm={setForm} field="contact_email" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TSwitch label="Featured" form={form} setForm={setForm} field="is_featured" />
              <TSwitch label="Published" form={form} setForm={setForm} field="is_published" />
            </div>
            <FormActions error={error} submitting={submitting} onCancel={onCancel} />
          </form>
        )}
        onSave={saveEvent}
        onDelete={(id) => deleteRecord("events", id)}
        onToggle={(id, v) => setPublished("events", id, v)}
        onToggleFeatured={(id, v) => setFeatured("events", id, v)}
        confirmMessage={(item) => `This will permanently delete the event “${item.title}”.`}
      />
    </div>
  );
}
