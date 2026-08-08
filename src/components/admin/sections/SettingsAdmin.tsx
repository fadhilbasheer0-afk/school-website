"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast, Switch } from "@/components/admin/ui";
import { TInput, TTextarea } from "@/components/admin/fields";
import { TImage } from "@/components/admin/fields";
import { ASSET_FOLDERS } from "@/lib/storage";
import { FormField, Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";
import { saveSettings } from "@/lib/admin/actions/settings";
import type { ActionResult } from "@/lib/admin/types";

export function SettingsAdmin({ settings }: { settings: Record<string, any> | null }) {
  const router = useRouter();
  const { show } = useToast();
  const [form, setForm] = useState(() => {
    const office_hours: { label: string; value: string }[] = Array.isArray(
      settings?.office_hours
    )
      ? (settings.office_hours as { label: string; value: string }[])
      : [{ label: "Monday – Friday", value: "8:00 AM – 4:30 PM" }];
    const social_links =
      settings?.social_links && typeof settings.social_links === "object"
        ? settings.social_links
        : { facebook: "", twitter: "", instagram: "", linkedin: "", youtube: "" };
    const contact_form =
      settings?.contact_form && typeof settings.contact_form === "object"
        ? settings.contact_form
        : { enabled: true, recipient_email: "", subject_prefix: "" };
    return {
      school_name: settings?.school_name ?? "",
      tagline: settings?.tagline ?? "",
      logo_url: settings?.logo_url ?? "",
      favicon_url: settings?.favicon_url ?? "",
      primary_color: settings?.primary_color ?? "#1e3a5f",
      secondary_color: settings?.secondary_color ?? "#f59e0b",
      contact_email: settings?.contact_email ?? "",
      contact_phone: settings?.contact_phone ?? "",
      contact_address: settings?.contact_address ?? "",
      website_url: settings?.website_url ?? "",
      map_url: settings?.map_url ?? "",
      coordinates: settings?.coordinates ?? "",
      footer_about: settings?.footer_about ?? "",
      footer_copyright: settings?.footer_copyright ?? "",
      currency: settings?.currency ?? "USD",
      timezone: settings?.timezone ?? "UTC",
      office_hours,
      social_links,
      contact_form,
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));
  const setSocial = (key: string, value: string) =>
    setForm((f) => ({ ...f, social_links: { ...f.social_links, [key]: value } }));
  const setContactForm = (key: string, value: any) =>
    setForm((f) => ({ ...f, contact_form: { ...f.contact_form, [key]: value } }));
  const setHour = (i: number, key: "label" | "value", value: string) =>
    setForm((f) => ({
      ...f,
      office_hours: f.office_hours.map((h, idx) => (idx === i ? { ...h, [key]: value } : h)),
    }));
  const addHour = () =>
    setForm((f) => ({ ...f, office_hours: [...f.office_hours, { label: "", value: "" }] }));
  const removeHour = (i: number) =>
    setForm((f) => ({ ...f, office_hours: f.office_hours.filter((_, idx) => idx !== i) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const result: ActionResult = await saveSettings({
      ...form,
      office_hours: form.office_hours.filter((h) => h.label || h.value),
      social_links: Object.fromEntries(
        Object.entries(form.social_links).filter(([, v]) => Boolean(v))
      ),
    });
    if (result.ok) {
      show("Settings saved.");
      router.refresh();
    } else {
      setError(result.error || "Failed to save settings.");
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Site-wide settings: branding, contact details, footer, office hours, social links and the contact form.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {error && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400 max-w-[240px] text-right">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" isLoading={saving}>
            Save Settings
          </Button>
        </div>
      </div>

      <Card title="Branding" description="School name, logo and favicon used across the site.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TInput label="School Name" form={form} setForm={setForm} field="school_name" />
          <TInput label="Tagline" form={form} setForm={setForm} field="tagline" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TImage label="Logo" folder={ASSET_FOLDERS.logo} form={form} setForm={setForm} field="logo_url" />
          <TImage label="Favicon" folder={ASSET_FOLDERS.logo} form={form} setForm={setForm} field="favicon_url" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ColorField label="Primary Color" value={form.primary_color} onChange={(v) => set("primary_color", v)} />
          <ColorField label="Secondary Color" value={form.secondary_color} onChange={(v) => set("secondary_color", v)} />
        </div>
      </Card>

      <Card title="Contact" description="Main contact details shown in the header and footer.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TInput label="Contact Email" type="email" form={form} setForm={setForm} field="contact_email" />
          <TInput label="Contact Phone" form={form} setForm={setForm} field="contact_phone" />
        </div>
        <TInput label="Address" form={form} setForm={setForm} field="contact_address" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TInput label="Website URL" form={form} setForm={setForm} field="website_url" />
          <TInput label="Map URL" form={form} setForm={setForm} field="map_url" helperText="Google Maps embed or directions link." />
        </div>
        <TInput label="Coordinates" form={form} setForm={setForm} field="coordinates" placeholder="e.g. 12.345678, 98.765432" />
      </Card>

      <Card title="Office Hours" description="Reception and office opening hours.">
        <div className="flex flex-col gap-3">
          {form.office_hours.map((h, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
              <Input
                value={h.label}
                onChange={(e) => setHour(i, "label", e.target.value)}
                placeholder="Days, e.g. Monday – Friday"
              />
              <Input
                value={h.value}
                onChange={(e) => setHour(i, "value", e.target.value)}
                placeholder="Hours, e.g. 8:00 AM – 4:30 PM"
              />
              <button
                type="button"
                onClick={() => removeHour(i)}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                aria-label="Remove hours row"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div>
            <Button type="button" variant="outline" size="sm" onClick={addHour} leftIcon={<Plus className="w-4 h-4" />}>
              Add Hours Row
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Social Links" description="Links shown in the site footer.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Facebook">
            <Input value={form.social_links.facebook ?? ""} onChange={(e) => setSocial("facebook", e.target.value)} />
          </FormField>
          <FormField label="Twitter / X">
            <Input value={form.social_links.twitter ?? ""} onChange={(e) => setSocial("twitter", e.target.value)} />
          </FormField>
          <FormField label="Instagram">
            <Input value={form.social_links.instagram ?? ""} onChange={(e) => setSocial("instagram", e.target.value)} />
          </FormField>
          <FormField label="LinkedIn">
            <Input value={form.social_links.linkedin ?? ""} onChange={(e) => setSocial("linkedin", e.target.value)} />
          </FormField>
          <FormField label="YouTube">
            <Input value={form.social_links.youtube ?? ""} onChange={(e) => setSocial("youtube", e.target.value)} />
          </FormField>
        </div>
      </Card>

      <Card title="Contact Form" description="Configuration for the contact form on the Contact page.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:pt-2">
            <Switch
              checked={Boolean(form.contact_form.enabled)}
              onChange={(v) => setContactForm("enabled", v)}
              label="Enable contact form"
            />
          </div>
          <FormField label="Recipient Email" helperText="Where form submissions are emailed.">
            <Input
              type="email"
              value={form.contact_form.recipient_email ?? ""}
              onChange={(e) => setContactForm("recipient_email", e.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Subject Prefix">
          <Input
            value={form.contact_form.subject_prefix ?? ""}
            onChange={(e) => setContactForm("subject_prefix", e.target.value)}
            placeholder="e.g. [Website Contact]"
          />
        </FormField>
      </Card>

      <Card title="Regional" description="Currency and timezone used for dates and fees.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TInput label="Currency" form={form} setForm={setForm} field="currency" placeholder="e.g. USD" />
          <TInput label="Timezone" form={form} setForm={setForm} field="timezone" placeholder="e.g. UTC, Africa/Lagos" />
        </div>
      </Card>

      <Card title="Footer" description="About text and copyright line shown in the site footer.">
        <TTextarea label="Footer About" form={form} setForm={setForm} field="footer_about" rows={3} />
        <TInput label="Copyright Line" form={form} setForm={setForm} field="footer_copyright" placeholder="e.g. © 2026 Fadhil Comprehensive College. All rights reserved." />
      </Card>
    </form>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8 flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h3>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <FormField label={label}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white cursor-pointer"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </FormField>
  );
}
