"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Star,
  Inbox,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ActionResult } from "@/lib/admin/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type AdminForm = Record<string, any>;

export interface RecordItem {
  id: string;
  title: string;
  subtitle?: string;
  published?: boolean;
  featured?: boolean;
}

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{
  show: (message: string, type?: ToastType) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500
    );
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const Icon =
            t.type === "success"
              ? CheckCircle2
              : t.type === "error"
                ? AlertCircle
                : Info;
          const color =
            t.type === "success"
              ? "text-emerald-600 dark:text-emerald-400"
              : t.type === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-sky-600 dark:text-sky-400";
          return (
            <div
              key={t.id}
              className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg"
              role="status"
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${color}`} />
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {t.message}
              </p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Modal & confirm dialogs                                             */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-slate-950/50 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full ${width} bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl my-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title = "Delete record?",
  message,
  confirmLabel = "Delete",
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={busy}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon: Icon = Inbox,
  title,
  text,
  actionLabel,
  onAction,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-10 text-center">
      <Icon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
      <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 mb-5 max-w-sm mx-auto">
        {text}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} leftIcon={<Plus className="w-4 h-4" />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-400 dark:text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="inline-flex items-center gap-2.5 cursor-pointer select-none"
    >
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
    </label>
  );
}

export function PublishToggle({
  published,
  onToggle,
  disabled = false,
  label = "Published",
}: {
  published: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      title={`${published ? "Unpublish" : "Publish"}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors disabled:opacity-50 ${
        published
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          published ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {published ? label : "Draft"}
    </button>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}

export function FormActions({
  error,
  submitting,
  onCancel,
}: {
  error: string;
  submitting: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-3 justify-end pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
      {error && (
        <p className="flex-1 text-xs font-medium text-red-600 dark:text-red-400 text-left">
          {error}
        </p>
      )}
      <Button variant="outline" type="button" onClick={onCancel} disabled={submitting}>
        Cancel
      </Button>
      <Button type="submit" variant="primary" isLoading={submitting}>
        Save Changes
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Record list with row actions                                        */
/* ------------------------------------------------------------------ */

export function RecordList({
  items,
  onEdit,
  onDelete,
  onToggle,
  onMove,
  onToggleFeatured,
  emptyTitle = "No records yet",
  emptyText = "Click “Add New” to create the first record.",
  publishLabel = "Published",
  showReorder = true,
  confirmMessage,
}: {
  items: RecordItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<ActionResult>;
  onToggle?: (id: string, published: boolean) => Promise<ActionResult>;
  onMove?: (id: string, direction: "up" | "down") => Promise<ActionResult>;
  onToggleFeatured?: (id: string, featured: boolean) => Promise<ActionResult>;
  emptyTitle?: string;
  emptyText?: string;
  publishLabel?: string;
  showReorder?: boolean;
  confirmMessage?: (item: RecordItem) => string;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const run = async (
    id: string,
    action: () => Promise<ActionResult>,
    successMessage: string
  ) => {
    setBusyId(id);
    const result = await action();
    setBusyId(null);
    if (result.ok) {
      show(successMessage);
      router.refresh();
    } else {
      show(result.error || "Operation failed.", "error");
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        text={emptyText}
        actionLabel="Add New"
        onAction={() => onEdit("")}
      />
    );
  }

  const confirmItem = items.find((i) => i.id === confirmId) ?? null;

  return (
    <>
      <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {items.map((item, index) => {
          const isBusy = busyId === item.id;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {showReorder && onMove && (
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => run(item.id, () => onMove(item.id, "up"), "Moved up.")}
                    disabled={isBusy || index === 0}
                    className="p-0.5 text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 transition-colors"
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => run(item.id, () => onMove(item.id, "down"), "Moved down.")}
                    disabled={isBusy || index === items.length - 1}
                    className="p-0.5 text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 transition-colors"
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {item.title}
                  </p>
                  {item.featured && (
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  )}
                </div>
                {item.subtitle && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {item.subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onToggleFeatured && (
                  <button
                    type="button"
                    onClick={() =>
                      run(item.id, () => onToggleFeatured(item.id, !item.featured), item.featured ? "Removed from featured." : "Marked as featured.")
                    }
                    disabled={isBusy}
                    title="Toggle featured"
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.featured
                        ? "text-amber-500"
                        : "text-slate-300 dark:text-slate-600 hover:text-amber-500"
                    }`}
                    aria-label="Toggle featured"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}

                {onToggle && (
                  <PublishToggle
                    published={Boolean(item.published)}
                    onToggle={() =>
                      run(item.id, () => onToggle(item.id, !item.published), item.published ? "Unpublished." : "Published.")
                    }
                    disabled={isBusy}
                    label={publishLabel}
                  />
                )}

                <button
                  type="button"
                  onClick={() => onEdit(item.id)}
                  disabled={isBusy}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(item.id)}
                  disabled={isBusy}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        message={
          confirmItem
            ? confirmMessage?.(confirmItem) ??
              `This will permanently delete “${confirmItem.title}”. This action cannot be undone.`
            : ""
        }
        busy={busyId !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={async () => {
          if (!confirmId) return;
          await run(confirmId, () => onDelete(confirmId), "Deleted.");
          setConfirmId(null);
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Record manager: header + add + list + modal editor                  */
/* ------------------------------------------------------------------ */

export function RecordManager({
  title,
  description,
  addLabel = "Add New",
  items,
  emptyTitle,
  emptyText,
  publishLabel,
  showReorder = true,
  renderForm,
  emptyForm,
  onSave,
  onDelete,
  onToggle,
  onMove,
  onToggleFeatured,
  confirmMessage,
  editForm,
}: {
  title: string;
  description?: string;
  addLabel?: string;
  items: RecordItem[];
  emptyTitle?: string;
  emptyText?: string;
  publishLabel?: string;
  showReorder?: boolean;
  renderForm: (p: {
    form: AdminForm;
    setForm: React.Dispatch<React.SetStateAction<AdminForm>>;
    error: string;
    submitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
  }) => React.ReactNode;
  emptyForm: () => AdminForm;
  onSave: (form: AdminForm) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
  onToggle?: (id: string, published: boolean) => Promise<ActionResult>;
  onMove?: (id: string, direction: "up" | "down") => Promise<ActionResult>;
  onToggleFeatured?: (id: string, featured: boolean) => Promise<ActionResult>;
  confirmMessage?: (item: RecordItem) => string;
  editForm?: (merged: AdminForm, item: any) => AdminForm;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminForm>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setEditorOpen(true);
  };

  const openEdit = (id: string) => {
    if (!id) {
      openNew();
      return;
    }
    const item = items.find((i) => i.id === id);
    if (item) {
      const merged = { ...emptyForm(), ...item };
      setForm(editForm ? editForm(merged, item) : merged);
    } else {
      setForm(emptyForm());
    }
    setEditingId(id);
    setError("");
    setEditorOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await onSave({ ...form, id: editingId ?? undefined });
    if (result.ok) {
      show("Saved successfully.");
      setEditorOpen(false);
      router.refresh();
    } else {
      setError(result.error || "Failed to save. Please check the form.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={openNew}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          {addLabel}
        </Button>
      </div>

      <RecordList
        items={items}
        onEdit={openEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        onMove={onMove}
        onToggleFeatured={onToggleFeatured}
        emptyTitle={emptyTitle ?? `No ${title.toLowerCase()} yet`}
        emptyText={
          emptyText ??
          `Click “${addLabel}” to create the first ${title.toLowerCase()}.`
        }
        publishLabel={publishLabel}
        showReorder={showReorder}
        confirmMessage={confirmMessage}
      />

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={
          editingId
            ? `Edit ${title}`
            : `Add ${title}`
        }
      >
        {renderForm({
          form,
          setForm,
          error,
          submitting,
          onSubmit: submit,
          onCancel: () => setEditorOpen(false),
        })}
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

export function Tabs({
  tabs,
}: {
  tabs: { key: string; label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.key ?? "");
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 transition-colors ${
              tab.key === active
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab?.content}
    </div>
  );
}
