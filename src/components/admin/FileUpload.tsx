"use client";

import React, { useRef, useState } from "react";
import {
  UploadCloud,
  X,
  RefreshCw,
  FileText,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  deleteStoredObjects,
  uploadFileToStorage,
} from "@/lib/storage-upload";
import {
  FILE_TYPE_RULES,
  formatBytes,
  pathFromPublicUrl,
  type StorageKind,
} from "@/lib/storage";

export interface UploadMeta {
  path?: string;
}

/**
 * Reusable single-file uploader. Stores the file in the `school-assets`
 * bucket under `folder`, shows a live progress bar, and supports replace
 * (deletes the previous object) and remove (deletes the object and clears
 * the value). The raw value is a public URL; the storage object path is
 * reported through the `meta` argument so forms can persist it.
 */
export function FileUpload({
  kind,
  folder,
  value,
  onChange,
  accept,
  maxSizeBytes,
  disabled = false,
  required = false,
  placeholder = "https://… or upload a file",
  policyNote,
}: {
  kind: StorageKind;
  folder: string;
  value: string;
  onChange: (value: string, meta?: UploadMeta) => void;
  accept?: string;
  maxSizeBytes?: number;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  policyNote?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const rule = FILE_TYPE_RULES[kind];
  const sizeLimit = maxSizeBytes ?? rule.maxBytes;
  const acceptAttr = accept ?? rule.accept.join(",");
  const isImage = kind === "image";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError("");

    // Replace: remove the previous object once the new upload succeeds.
    const previousPath = value ? pathFromPublicUrl(value) : null;

    try {
      const stored = await uploadFileToStorage(
        folder,
        file,
        kind,
        setProgress
      );
      onChange(stored.url, { path: stored.path });
      if (previousPath) await deleteStoredObjects([previousPath]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    const previousPath = value ? pathFromPublicUrl(value) : null;
    onChange("", { path: undefined });
    if (previousPath) await deleteStoredObjects([previousPath]);
  };

  const openPicker = () => fileRef.current?.click();

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileRef}
        type="file"
        accept={acceptAttr}
        onChange={handleFile}
        disabled={disabled || uploading}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        {isImage ? (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        )}

        {value && (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
              {isImage ? "Image uploaded" : "File uploaded"}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {value}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {isSupabaseConfigured ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openPicker}
                disabled={disabled || uploading}
                leftIcon={
                  uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : value ? (
                    <RefreshCw className="w-4 h-4" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )
                }
              >
                {uploading
                  ? "Uploading…"
                  : value
                    ? "Replace"
                    : "Upload"}
              </Button>
              {value && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled || uploading}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
                  aria-label="Remove and delete file"
                  title="Remove and delete the file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Upload requires Supabase to be configured.
            </p>
          )}
        </div>
      </div>

      {uploading && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-10 text-right">
            {progress}%
          </span>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}

      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || uploading}
        required={required}
      />

      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug">
        Accepts {rule.label} up to {formatBytes(sizeLimit)}.
        {policyNote ? ` ${policyNote}` : ""}
      </p>
    </div>
  );
}
