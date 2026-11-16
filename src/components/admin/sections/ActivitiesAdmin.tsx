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
  TSwitch,
  TImage,
} from "@/components/admin/fields";
import { ASSET_FOLDERS } from "@/lib/storage";
import {
  saveActivity,
  saveAchievement,
  deleteRecord,
  setActive,
  moveRecord,
} from "@/lib/admin/actions/activities";

export function ActivitiesAdmin({
  activities,
  achievements,
}: {
  activities: Record<string, any>[];
  achievements: Record<string, any>[];
}) {
  const activityItems = activities.map((a) => ({
    id: a.id,
    title: a.name,
    subtitle: a.category || "Activity",
    published: Boolean(a.is_active),
    ...a,
  }));
  const achievementItems = achievements.map((a) => ({
    id: a.id,
    title: a.title,
    subtitle: [a.achieved_at, a.category].filter(Boolean).join(" · "),
    published: Boolean(a.is_active),
    ...a,
  }));

  return (
    <div>
      <PageHeader
        title="Activities & Achievements"
        description="Manage extracurricular activities and student achievements."
      />

      <Tabs
        tabs={[
          {
            key: "activities",
            label: "Activities",
            content: (
              <RecordManager
                title="Activities"
                addLabel="Add Activity"
                items={activityItems}
                emptyForm={() => ({
                  name: "",
                  category: "",
                  description: "",
                  image_url: "",
                  sort_order: 0,
                  is_active: true,
                })}
                renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
                  <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TInput label="Name" form={form} setForm={setForm} field="name" required />
                      <TInput label="Category" form={form} setForm={setForm} field="category" placeholder="e.g. Sports, Arts, Clubs" />
                    </div>
                    <TTextarea label="Description" form={form} setForm={setForm} field="description" rows={5} />
                    <TImage label="Image" form={form} setForm={setForm} field="image_url" folder={ASSET_FOLDERS.banners} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
                      <TSwitch label="Published on site" form={form} setForm={setForm} field="is_active" />
                    </div>
                    <FormActions error={error} submitting={submitting} onCancel={onCancel} />
                  </form>
                )}
                onSave={saveActivity}
                onDelete={(id) => deleteRecord("activities", id)}
                onToggle={(id, v) => setActive("activities", id, v)}
                onMove={(id, d) => moveRecord("activities", id, d)}
              />
            ),
          },
          {
            key: "achievements",
            label: "Achievements",
            content: (
              <RecordManager
                title="Achievements"
                addLabel="Add Achievement"
                items={achievementItems}
                emptyForm={() => ({
                  title: "",
                  category: "",
                  description: "",
                  achieved_at: "",
                  image_url: "",
                  sort_order: 0,
                  is_active: true,
                })}
                renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
                  <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TInput label="Title" form={form} setForm={setForm} field="title" required />
                      <TInput label="Date / Year" type="date" form={form} setForm={setForm} field="achieved_at" />
                    </div>
                    <TInput label="Category" form={form} setForm={setForm} field="category" placeholder="e.g. Sports, Academics" />
                    <TTextarea label="Description" form={form} setForm={setForm} field="description" rows={5} />
                    <TImage label="Image" form={form} setForm={setForm} field="image_url" folder={ASSET_FOLDERS.achievements} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
                      <TSwitch label="Published on site" form={form} setForm={setForm} field="is_active" />
                    </div>
                    <FormActions error={error} submitting={submitting} onCancel={onCancel} />
                  </form>
                )}
                onSave={saveAchievement}
                onDelete={(id) => deleteRecord("achievements", id)}
                onToggle={(id, v) => setActive("achievements", id, v)}
                onMove={(id, d) => moveRecord("achievements", id, d)}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
