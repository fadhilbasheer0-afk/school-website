"use client";

import React from "react";
import { FormField } from "@/components/ui/Form";
import { FileUpload, type UploadMeta } from "@/components/admin/FileUpload";
import { ASSET_FOLDERS, type AssetFolder } from "@/lib/storage";

/**
 * Image URL field with a preview and an upload control that stores the file
 * in the public `school-assets` storage bucket under `folder` (defaults to
 * `banners` for generic content images).
 */
export function ImageInput({
  label,
  id,
  value,
  onChange,
  helperText,
  required = false,
  folder = ASSET_FOLDERS.banners,
  policyNote = "Use only authentic school photographs. Avoid AI-generated, stock or third-party images.",
}: {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string, meta?: UploadMeta) => void;
  helperText?: string;
  required?: boolean;
  folder?: AssetFolder | string;
  policyNote?: string;
}) {
  return (
    <FormField label={label} id={id} helperText={helperText}>
      <FileUpload
        kind="image"
        folder={folder}
        value={value}
        onChange={onChange}
        required={required}
        policyNote={policyNote}
      />
    </FormField>
  );
}

/**
 * File (document) URL field with an upload control that stores the file in
 * the `documents` folder of the `school-assets` storage bucket.
 */
export function FileInput({
  label,
  id,
  value,
  onChange,
  helperText,
  required = false,
  folder = ASSET_FOLDERS.documents,
}: {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string, meta?: UploadMeta) => void;
  helperText?: string;
  required?: boolean;
  folder?: AssetFolder | string;
}) {
  return (
    <FormField label={label} id={id} helperText={helperText}>
      <FileUpload kind="document" folder={folder} value={value} onChange={onChange} required={required} />
    </FormField>
  );
}
