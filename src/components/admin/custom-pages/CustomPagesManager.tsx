"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  CheckCircle,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";
import {
  createCustomPage,
  updateCustomPage,
  deleteCustomPage,
} from "@/lib/admin/actions/pages";
import { useToast } from "@/components/admin/ui";
import type { CustomPage } from "@/lib/tenant";

export const CustomPagesManager: React.FC<{
  initialPages: CustomPage[];
}> = ({ initialPages }) => {
  const [pages, setPages] = useState<CustomPage[]>(initialPages);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [deletingPage, setDeletingPage] = useState<CustomPage | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createCustomPage(fd);
      if (res.ok) {
        toast("Custom page created successfully!", "success");
        setIsCreateOpen(false);
        const newPage: CustomPage = {
          id: res.data?.id || `cp-${Date.now()}`,
          schoolId: "current",
          title: String(fd.get("title")),
          navLabel: String(fd.get("navLabel") || fd.get("title")),
          slug: String(fd.get("slug")).toLowerCase(),
          content: String(fd.get("content")),
          metaDescription: String(fd.get("metaDescription") || "") || null,
          isPublished: fd.get("isPublished") === "true",
          isInNav: fd.get("isInNav") === "true",
          sortOrder: 99,
        };
        setPages([...pages, newPage]);
      } else {
        toast(res.error || "Failed to create page.", "error");
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPage) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateCustomPage(editingPage.id, fd);
      if (res.ok) {
        toast("Custom page updated!", "success");
        setPages((prev) =>
          prev.map((p) =>
            p.id === editingPage.id
              ? {
                  ...p,
                  title: String(fd.get("title")),
                  navLabel: String(fd.get("navLabel") || fd.get("title")),
                  slug: String(fd.get("slug")).toLowerCase(),
                  content: String(fd.get("content")),
                  metaDescription: String(fd.get("metaDescription") || "") || null,
                  isPublished: fd.get("isPublished") === "true",
                  isInNav: fd.get("isInNav") === "true",
                }
              : p
          )
        );
        setEditingPage(null);
      } else {
        toast(res.error || "Failed to update page.", "error");
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingPage) return;
    startTransition(async () => {
      const res = await deleteCustomPage(deletingPage.id);
      if (res.ok) {
        toast("Page deleted.", "success");
        setPages((prev) => prev.filter((p) => p.id !== deletingPage.id));
        setDeletingPage(null);
      } else {
        toast(res.error || "Failed to delete page.", "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Custom Pages
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Create unique, school-specific pages for scholarships, community initiatives, or special
            announcements.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Page</span>
        </button>
      </div>

      {/* Pages List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {pages.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {pages.map((page) => (
              <div
                key={page.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {page.title}
                    </span>
                    <Link
                      href={`/p/${page.slug}`}
                      target="_blank"
                      className="font-mono text-xs text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>/p/{page.slug}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>Menu label: <strong className="text-slate-700 dark:text-slate-200">{page.navLabel}</strong></span>
                    <span>•</span>
                    <span>{page.isInNav ? "Included in navbar" : "Hidden from navbar"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      page.isPublished
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {page.isPublished ? "Published" : "Draft"}
                  </span>
                  <button
                    onClick={() => setEditingPage(page)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit Page"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingPage(page)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                    title="Delete Page"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 px-6 text-center text-slate-400 text-xs">
            No custom pages created yet. Click &ldquo;Create Custom Page&rdquo; above to publish your first
            school page.
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Create Custom Page</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Publish a rich institutional page with custom markdown/text content.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Page Title *
                  </label>
                  <input
                    name="title"
                    required
                    placeholder="e.g. Summer Camp Program"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Slug *
                  </label>
                  <input
                    name="slug"
                    required
                    placeholder="e.g. summer-camp"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Navigation Menu Label
                </label>
                <input
                  name="navLabel"
                  placeholder="e.g. Summer Camp"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Page Content *
                </label>
                <textarea
                  name="content"
                  rows={8}
                  required
                  placeholder="Enter page content or announcement text..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SEO Meta Description
                </label>
                <input
                  name="metaDescription"
                  placeholder="Brief summary for search engines"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    name="isInNav"
                    value="true"
                    defaultChecked={false}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Show link in main navigation bar</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    name="isPublished"
                    value="true"
                    defaultChecked={true}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Publish immediately</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Publish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingPage(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Edit {editingPage.title}</h2>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Page Title *
                  </label>
                  <input
                    name="title"
                    required
                    defaultValue={editingPage.title}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Slug *
                  </label>
                  <input
                    name="slug"
                    required
                    defaultValue={editingPage.slug}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Navigation Menu Label
                </label>
                <input
                  name="navLabel"
                  defaultValue={editingPage.navLabel}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Page Content *
                </label>
                <textarea
                  name="content"
                  rows={8}
                  required
                  defaultValue={editingPage.content}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    name="isInNav"
                    value="true"
                    defaultChecked={editingPage.isInNav}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Show in main navigation bar</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    name="isPublished"
                    value="true"
                    defaultChecked={editingPage.isPublished}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Published</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPage && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-rose-500 mb-2">Delete Page?</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{deletingPage.title}</strong> (/p/{deletingPage.slug})?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingPage(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Page</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
