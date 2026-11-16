"use client";

import React, { useState, useTransition } from "react";
import {
  LayoutGrid,
  CheckCircle,
  XCircle,
  MoveUp,
  MoveDown,
  Edit2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  toggleSectionEnabled,
  updateSectionDetails,
  reorderSections,
} from "@/lib/admin/actions/sections";
import { useToast } from "@/components/admin/ui";
import type { HomepageSectionConfig } from "@/lib/tenant";

export const SectionsManager: React.FC<{
  initialSections: HomepageSectionConfig[];
}> = ({ initialSections }) => {
  const [sections, setSections] = useState<HomepageSectionConfig[]>(initialSections);
  const [editingSection, setEditingSection] = useState<HomepageSectionConfig | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleToggleEnabled = (section: HomepageSectionConfig) => {
    const nextState = !section.isEnabled;
    startTransition(async () => {
      const res = await toggleSectionEnabled(
        section.id || section.sectionKey,
        nextState
      );
      if (res.ok) {
        toast(`Section '${section.title}' ${nextState ? "shown" : "hidden"}.`, "success");
        setSections((prev) =>
          prev.map((s) =>
            s.sectionKey === section.sectionKey ? { ...s, isEnabled: nextState } : s
          )
        );
      } else {
        toast(res.error || "Failed to update section visibility.", "error");
      }
    });
  };

  const handleStartEdit = (section: HomepageSectionConfig) => {
    setEditingSection(section);
    setEditTitle(section.title);
    setEditSubtitle(section.subtitle || "");
  };

  const handleSaveEdit = () => {
    if (!editingSection) return;
    startTransition(async () => {
      const res = await updateSectionDetails(
        editingSection.id || editingSection.sectionKey,
        editTitle,
        editSubtitle
      );
      if (res.ok) {
        toast("Section details updated!", "success");
        setSections((prev) =>
          prev.map((s) =>
            s.sectionKey === editingSection.sectionKey
              ? { ...s, title: editTitle, subtitle: editSubtitle }
              : s
          )
        );
        setEditingSection(null);
      } else {
        toast(res.error || "Failed to update section details.", "error");
      }
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const updated = newSections.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    setSections(updated);

    startTransition(async () => {
      const ids = updated.map((s) => s.id || s.sectionKey);
      const res = await reorderSections(ids);
      if (res.ok) {
        toast("Homepage sections reordered!", "success");
      } else {
        toast(res.error || "Failed to reorder sections.", "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Homepage Sections Manager
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Customize which sections appear on your school&rsquo;s homepage and reorder them
          according to your institution&rsquo;s priorities.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
          <span>Homepage Modules ({sections.length})</span>
          <span className="text-[11px] font-normal text-slate-500">
            Use the arrows to reorder how sections display from top to bottom.
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {sections.map((section, index) => (
            <div
              key={section.sectionKey}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                !section.isEnabled ? "bg-slate-50/50 dark:bg-slate-950/40 opacity-70" : ""
              }`}
            >
              {/* Left Order & Titles */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0 || isPending}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-400"
                    title="Move section up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, "down")}
                    disabled={index === sections.length - 1 || isPending}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-400"
                    title="Move section down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {editingSection?.sectionKey === section.sectionKey ? (
                  <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-lg">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Section Title"
                      className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={editSubtitle}
                      onChange={(e) => setEditSubtitle(e.target.value)}
                      placeholder="Subtitle / Description"
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
                        onClick={() => setEditingSection(null)}
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
                        {section.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        #{section.sortOrder}
                      </span>
                    </div>
                    {section.subtitle && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {section.subtitle}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => handleStartEdit(section)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Section Details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleToggleEnabled(section)}
                  disabled={isPending}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    section.isEnabled
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                  }`}
                  title={section.isEnabled ? "Section is visible on homepage" : "Section is hidden from homepage"}
                >
                  {section.isEnabled ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hidden</span>
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
