"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RecordManager,
  Tabs,
  FormActions,
  PageHeader,
  useToast,
} from "@/components/admin/ui";
import {
  TInput,
  TTextarea,
  TNumber,
  TSelect,
  TSwitch,
  TImage,
} from "@/components/admin/fields";
import { FormField, Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { ImageInput } from "@/components/admin/ImageInput";
import {
  saveHomeSettings,
  saveHomeContent,
  saveHeroSlide,
  saveStatistic,
  deleteRecord,
  setActive,
  moveRecord,
} from "@/lib/admin/actions/home";
import { ASSET_FOLDERS } from "@/lib/storage";
import type { ActionResult } from "@/lib/admin/types";

const HOME_SECTION_KEYS = [
  { value: "intro", label: "Intro" },
  { value: "cta", label: "Call to Action" },
  { value: "principal", label: "Principal's Message" },
  { value: "featured", label: "Featured Content" },
  { value: "admissions-cta", label: "Admissions CTA" },
  { value: "welcome", label: "Welcome" },
];

export function HomeAdmin({
  settings,
  heroSlides,
  contentBlocks,
  statistics,
}: {
  settings: Record<string, any> | null;
  heroSlides: Record<string, any>[];
  contentBlocks: Record<string, any>[];
  statistics: Record<string, any>[];
}) {
  const heroItems = heroSlides.map((s) => ({
    id: s.id,
    title: s.title || "Untitled slide",
    subtitle: s.subtitle,
    published: Boolean(s.is_active),
    ...s,
  }));
  const contentItems = contentBlocks.map((c) => ({
    id: c.id,
    title: c.title || c.section_key,
    subtitle: `${c.section_key}${c.subtitle ? " · " + c.subtitle : ""}`,
    published: Boolean(c.is_active),
    ...c,
  }));
  const statItems = statistics.map((s) => ({
    id: s.id,
    title: s.label || "Untitled",
    subtitle: s.value,
    published: Boolean(s.is_active),
    ...s,
  }));

  return (
    <div>
      <PageHeader
        title="Home"
        description="Manage the homepage: branding, hero slides, content sections and statistics."
      />

      {settings && <BrandingForm settings={settings} />}

      <Tabs
        tabs={[
          {
            key: "hero",
            label: "Hero Slides",
            content: (
              <RecordManager
                title="Hero Slides"
                description="Rotating banner slides at the top of the homepage."
                items={heroItems}
                emptyForm={() => ({
                  title: "",
                  subtitle: "",
                  image_url: "",
                  cta_label: "",
                  cta_url: "",
                  sort_order: 0,
                  is_active: true,
                })}
                renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
                  <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <TInput label="Title" form={form} setForm={setForm} field="title" required />
                    <TTextarea label="Subtitle" form={form} setForm={setForm} field="subtitle" rows={3} />
                    <TImage label="Slide Image" form={form} setForm={setForm} field="image_url" folder={ASSET_FOLDERS.banners} helperText="Large banner image (recommended 1920×720)." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TInput label="Button Label" form={form} setForm={setForm} field="cta_label" />
                      <TInput label="Button Link" form={form} setForm={setForm} field="cta_url" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
                      <TSwitch label="Visible on site" form={form} setForm={setForm} field="is_active" />
                    </div>
                    <FormActions error={error} submitting={submitting} onCancel={onCancel} />
                  </form>
                )}
                onSave={saveHeroSlide}
                onDelete={(id) => deleteRecord("home_hero_slides", id)}
                onToggle={(id, v) => setActive("home_hero_slides", id, v)}
                onMove={(id, d) => moveRecord("home_hero_slides", id, d)}
              />
            ),
          },
          {
            key: "content",
            label: "Content Sections",
            content: (
              <RecordManager
                title="Content Sections"
                description="Sections such as welcome, call-to-action, principal's message and featured content."
                items={contentItems}
                emptyForm={() => ({
                  section_key: "intro",
                  title: "",
                  subtitle: "",
                  body: "",
                  image_url: "",
                  cta_label: "",
                  cta_url: "",
                  sort_order: 0,
                  is_active: true,
                })}
                renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
                  <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <TSelect label="Section" form={form} setForm={setForm} field="section_key" options={HOME_SECTION_KEYS} required />
                    <TInput label="Title" form={form} setForm={setForm} field="title" required />
                    <TInput label="Subtitle" form={form} setForm={setForm} field="subtitle" />
                    <TTextarea label="Body" form={form} setForm={setForm} field="body" rows={6} />
                    <TImage label="Image" form={form} setForm={setForm} field="image_url" folder={ASSET_FOLDERS.banners} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TInput label="Button Label" form={form} setForm={setForm} field="cta_label" />
                      <TInput label="Button Link" form={form} setForm={setForm} field="cta_url" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
                      <TSwitch label="Visible on site" form={form} setForm={setForm} field="is_active" />
                    </div>
                    <FormActions error={error} submitting={submitting} onCancel={onCancel} />
                  </form>
                )}
                onSave={saveHomeContent}
                onDelete={(id) => deleteRecord("home_content", id)}
                onToggle={(id, v) => setActive("home_content", id, v)}
                onMove={(id, d) => moveRecord("home_content", id, d)}
              />
            ),
          },
          {
            key: "stats",
            label: "Statistics",
            content: (
              <RecordManager
                title="Statistics"
                description="Numbers highlighted on the homepage, e.g. “28+ Years of Excellence”."
                items={statItems}
                emptyForm={() => ({ label: "", value: "", sort_order: 0, is_active: true })}
                renderForm={({ form, setForm, error, submitting, onSubmit, onCancel }) => (
                  <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TInput label="Label" form={form} setForm={setForm} field="label" required />
                      <TInput label="Value" form={form} setForm={setForm} field="value" required placeholder="e.g. 28+" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <TNumber label="Order" form={form} setForm={setForm} field="sort_order" />
                      <TSwitch label="Visible on site" form={form} setForm={setForm} field="is_active" />
                    </div>
                    <FormActions error={error} submitting={submitting} onCancel={onCancel} />
                  </form>
                )}
                onSave={saveStatistic}
                onDelete={(id) => deleteRecord("home_statistics", id)}
                onToggle={(id, v) => setActive("home_statistics", id, v)}
                onMove={(id, d) => moveRecord("home_statistics", id, d)}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

function BrandingForm({ settings }: { settings: Record<string, any> }) {
  const router = useRouter();
  const { show } = useToast();
  const [form, setForm] = useState({
    school_name: settings.school_name ?? "",
    tagline: settings.tagline ?? "",
    logo_url: settings.logo_url ?? "",
    favicon_url: settings.favicon_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result: ActionResult = await saveHomeSettings(form);
      if (result.ok) {
        show("Branding saved.");
        router.refresh();
      } else {
        setError(result.error || "Failed to save branding.");
      }
    } catch {
      setError("Failed to save branding.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8 mb-8 flex flex-col gap-5"
    >
      <div>
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Branding</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          School name, tagline, logo and favicon used across the site.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="School Name">
          <Input
            value={form.school_name}
            onChange={(e) => setForm({ ...form, school_name: e.target.value })}
          />
        </FormField>
        <FormField label="Tagline">
          <Input
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ImageInput label="Logo" folder={ASSET_FOLDERS.logo} value={form.logo_url} onChange={(v) => setForm({ ...form, logo_url: v })} />
        <ImageInput label="Favicon" folder={ASSET_FOLDERS.logo} value={form.favicon_url} onChange={(v) => setForm({ ...form, favicon_url: v })} />
      </div>

      <div className="flex items-center gap-3 justify-end pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
        {error && (
          <p className="flex-1 text-xs font-medium text-red-600 dark:text-red-400 text-left">{error}</p>
        )}
        <Button type="submit" variant="primary" isLoading={saving}>
          Save Branding
        </Button>
      </div>
    </form>
  );
}
