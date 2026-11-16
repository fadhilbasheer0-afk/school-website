"use client";

import React from "react";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import { Switch } from "@/components/admin/ui";
import { ImageInput, FileInput } from "@/components/admin/ImageInput";
import type { UploadMeta } from "@/components/admin/FileUpload";
import { ASSET_FOLDERS, type AssetFolder } from "@/lib/storage";
import type { AdminForm } from "@/components/admin/ui";

export type FormSetter = (value: any) => void;

export function TInput({
  form,
  setForm,
  field,
  label,
  id,
  required,
  type = "text",
  placeholder,
  helperText,
}: {
  form: AdminForm;
  setForm: FormSetter;
  field: string;
  label: string;
  id?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  helperText?: string;
}) {
  return (
    <FormField label={label} id={id} helperText={helperText}>
      <Input
        id={id}
        type={type}
        value={typeof form[field] === "string" ? form[field] : ""}
        onChange={(e) => setForm((f: AdminForm) => ({ ...f, [field]: e.target.value }))}
        placeholder={placeholder}
        required={required}
      />
    </FormField>
  );
}

export function TTextarea({
  form,
  setForm,
  field,
  label,
  id,
  rows = 5,
  required,
  placeholder,
  helperText,
}: {
  form: AdminForm;
  setForm: FormSetter;
  field: string;
  label: string;
  id?: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
}) {
  return (
    <FormField label={label} id={id} helperText={helperText}>
      <Textarea
        id={id}
        rows={rows}
        value={typeof form[field] === "string" ? form[field] : ""}
        onChange={(e) => setForm((f: AdminForm) => ({ ...f, [field]: e.target.value }))}
        placeholder={placeholder}
        required={required}
      />
    </FormField>
  );
}

export function TNumber({
  form,
  setForm,
  field,
  label,
  id,
  min = 0,
}: {
  form: AdminForm;
  setForm: FormSetter;
  field: string;
  label: string;
  id?: string;
  min?: number;
}) {
  return (
    <FormField label={label} id={id}>
      <Input
        id={id}
        type="number"
        min={min}
        value={Number(form[field]) || 0}
        onChange={(e) => setForm((f: AdminForm) => ({ ...f, [field]: Number(e.target.value) }))}
      />
    </FormField>
  );
}

export function TSelect({
  form,
  setForm,
  field,
  label,
  id,
  options,
  placeholder,
  required,
  helperText,
}: {
  form: AdminForm;
  setForm: FormSetter;
  field: string;
  label: string;
  id?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  helperText?: string;
}) {
  const value = typeof form[field] === "string" ? form[field] : "";
  const hasValue = options.some((o) => o.value === value);
  const all = hasValue
    ? options
    : [{ value, label: value || "(current)" }, ...options];
  return (
    <FormField label={label} id={id} helperText={helperText}>
      <select
        id={id}
        value={value}
        onChange={(e) => setForm((f: AdminForm) => ({ ...f, [field]: e.target.value }))}
        required={required}
        className="w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-base text-slate-900 dark:text-white transition-all duration-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {all.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

export function TSwitch({
  form,
  setForm,
  field,
  label,
  className = "pt-2",
}: {
  form: AdminForm;
  setForm: FormSetter;
  field: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Switch
        id={field}
        checked={Boolean(form[field])}
        onChange={(v) => setForm((f: AdminForm) => ({ ...f, [field]: v }))}
        label={label}
      />
    </div>
  );
}

export function TImage({
  form,
  setForm,
  field,
  label,
  id,
  helperText,
  required,
  folder = ASSET_FOLDERS.banners,
  pathField,
  policyNote,
}: {
  form: AdminForm;
  setForm: FormSetter;
  field: string;
  label: string;
  id?: string;
  helperText?: string;
  required?: boolean;
  folder?: AssetFolder | string;
  pathField?: string;
  policyNote?: string;
}) {
  const handleChange = (value: string, meta?: UploadMeta) => {
    setForm((f: AdminForm) => {
      const next: AdminForm = { ...f, [field]: value };
      if (pathField) {
        next[pathField] = meta?.path ?? "";
      }
      return next;
    });
  };
  return (
    <ImageInput
      label={label}
      id={id}
      value={typeof form[field] === "string" ? form[field] : ""}
      onChange={handleChange}
      helperText={helperText}
      required={required}
      folder={folder}
      policyNote={policyNote}
    />
  );
}

export function TFile({
  form,
  setForm,
  field,
  label,
  id,
  helperText,
  required,
  folder = ASSET_FOLDERS.documents,
  pathField,
}: {
  form: AdminForm;
  setForm: FormSetter;
  field: string;
  label: string;
  id?: string;
  helperText?: string;
  required?: boolean;
  folder?: AssetFolder | string;
  pathField?: string;
}) {
  const handleChange = (value: string, meta?: UploadMeta) => {
    setForm((f: AdminForm) => {
      const next: AdminForm = { ...f, [field]: value };
      if (pathField) {
        next[pathField] = meta?.path ?? "";
      }
      return next;
    });
  };
  return (
    <FileInput
      label={label}
      id={id}
      value={typeof form[field] === "string" ? form[field] : ""}
      onChange={handleChange}
      helperText={helperText}
      required={required}
      folder={folder}
    />
  );
}
