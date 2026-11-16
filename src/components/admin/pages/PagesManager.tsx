"use client";

import React, { useState, useTransition } from "react";
import {
  Layers,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  togglePageEnabled,
  togglePageInNav,
  updatePageDetails,
  reorderPages,
} from "@/lib/admin/actions/pages";
import { useToast } from "@/components/admin/ui";
import type { SchoolPageConfig } from "@/lib/tenant";

export const PagesManager: React.FC<{ initialPages: SchoolPageConfig[] }> = ({
  initialPages,
}) => {
  const [pages, setPages] = useState<SchoolPageConfig[]>(initialPages);
  const [editingPage, setEditingPage] = useState<SchoolPageConfig | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNavLabel, setEditNavLabel] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleToggleEnabled = (page: SchoolPageConfig) => {
    const nextState = !page.isEnabled;
    startTransition(async () => {
      const res = await togglePageEnabled(page.id || page.pageKey, nextState);
      if (res.ok) {
        toast(`Page '${page.navLabel}' ${nextState ? "enabled" : "hidden"}.`, "success");
        setPages((prev) =>
          prev.map((p) => (p.pageKey === page.pageKey ? { ...p, isEnabled: nextState } : p))
        );
      } else {
        toast(res.error || "Failed to update page status.", "error");
      }
    });
  };

  const handleToggleInNav = (page: SchoolPageConfig) => {
    const nextState = !page.isInNav;
    startTransition(async () => {
      const res = await togglePageInNav(page.id || page.pageKey, nextState);
      if (res.ok) {
        toast(
          `'${page.navLabel}' ${nextState ? "shown in" : "hidden from"} navigation menu.`,
          "success"
        );
        setPages((prev) =>
          prev.map((p) => (p.pageKey === page.pageKey ? { ...p, isInNav: nextState } : p))
        );
      } else {
        toast(res.error || "Failed to update navigation visibility.", "error");
      }
    });
  };

  const handleStartEdit = (page: SchoolPageConfig) => {
    setEditingPage(page);
    setEditTitle(page.title);
    setEditNavLabel(page.navLabel);
  };

  const handleSaveEdit = () => {
    if (!editingPage) return;
    startTransition(async () => {
      const res = await updatePageDetails(
        editingPage.id || editingPage.pageKey,
        editTitle,
        editNavLabel
      );
      if (res.ok) {
        toast("Page labels updated successfully!", "success");
        setPages((prev) =>
          prev.map((p) =>
            p.pageKey === editingPage.pageKey
              ? { ...p, title: editTitle, navLabel: editNavLabel }
              : p
          )
        );
        setEditingPage(null);
      } else {
        toast(res.error || "Failed to update page labels.", "error");
      }
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    const newPages = [...pages];
    const temp = newPages[index];
    newPages[index] = newPages[targetIndex];
    newPages[targetIndex] = temp;

    // Update sortOrder
    const updated = newPages.map((p, idx) => ({ ...p, sortOrder: idx + 1 }));
    setPages(updated);

    startTransition(async () => {
      const pageIds = updated.map((p) => p.id || p.pageKey);
      const res = await reorderPages(pageIds);
      if (res.ok) {
        toast("Navigation order reordered successfully!", "success");
      } else {
        toast(res.error || "Failed to update sort order.", "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Pages & Navigation Structure
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Not every institution needs every page. Enable or disable pages for your school,
          hide unused sections without deleting their content, rename navigation labels,
          and reorder the menu items.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
          <span>Configured Pages ({pages.length})</span>
          <span className="text-[11px] font-normal text-slate-500">
            Disabled pages disappear from public navigation and return a 404.
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {pages.map((page, index) => (
            <div
              key={page.pageKey}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                !page.isEnabled ? "bg-slate-50/50 dark:bg-slate-950/40 opacity-75" : ""
              }`}
            >
              {/* Left Info / Edit mode */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0 || isPending}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-400"
                    title="Move up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, "down")}
                    disabled={index === pages.length - 1 || isPending}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-400"
                    title="Move down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {editingPage?.pageKey === page.pageKey ? (
                  <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-lg">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Page Title"
                      className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={editNavLabel}
                      onChange={(e) => setEditNavLabel(e.target.value)}
                      placeholder="Nav Menu Label"
                      className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleSaveEdit}
                        disabled={isPending}
                        className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingPage(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {page.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        /{page.slug}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span>Menu label: <strong className="text-slate-700 dark:text-slate-200">{page.navLabel}</strong></span>
                      <span>•</span>
                      <span>Order: #{page.sortOrder}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => handleStartEdit(page)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Rename page title / nav label"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Show in Nav Toggle */}
                <button
                  onClick={() => handleToggleInNav(page)}
                  disabled={!page.isEnabled || isPending}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    page.isInNav
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                      : "bg-transparent text-slate-400 border-dashed border-slate-300 dark:border-slate-700"
                  }`}
                  title={page.isInNav ? "Shown in navigation menu" : "Hidden from navigation menu"}
                >
                  {page.isInNav ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-amber-500" />
                      <span>In Nav</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hidden from Nav</span>
                    </>
                  )}
                </button>

                {/* Enable / Disable Page Toggle */}
                <button
                  onClick={() => handleToggleEnabled(page)}
                  disabled={isPending}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    page.isEnabled
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                  }`}
                  title={page.isEnabled ? "Page is enabled and accessible" : "Page is disabled (returns 404)"}
                >
                  {page.isEnabled ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Enabled</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Disabled</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
