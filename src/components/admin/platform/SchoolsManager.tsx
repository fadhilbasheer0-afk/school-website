"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  School,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Globe,
  Loader2,
  X,
} from "lucide-react";
import {
  createSchool,
  updateSchool,
  toggleSchoolActive,
  deleteSchool,
} from "@/lib/admin/actions/platform";
import { useToast } from "@/components/admin/ui";

export interface SchoolItem {
  id: string;
  name: string;
  slug: string;
  motto: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  isDefault: boolean;
  subscriptionTier: string;
  customDomain: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  createdAt: string;
}

export const SchoolsManager: React.FC<{ initialSchools: SchoolItem[] }> = ({
  initialSchools,
}) => {
  const [schools, setSchools] = useState<SchoolItem[]>(initialSchools);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolItem | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<SchoolItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const filtered = schools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      (s.customDomain && s.customDomain.toLowerCase().includes(search.toLowerCase()));
    if (filterActive === "active") return matchesSearch && s.isActive;
    if (filterActive === "inactive") return matchesSearch && !s.isActive;
    return matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createSchool(fd);
      if (res.ok) {
        toast("School created successfully!", "success");
        setIsCreateOpen(false);
        // Add to local state
        const newSlug = String(fd.get("slug")).toLowerCase();
        const newSchool: SchoolItem = {
          id: res.data?.id || `school-${Date.now()}`,
          name: String(fd.get("name")),
          slug: newSlug,
          motto: String(fd.get("motto") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          address: String(fd.get("address") || ""),
          isActive: true,
          isDefault: false,
          subscriptionTier: String(fd.get("subscriptionTier") || "free"),
          customDomain: null,
          primaryColor: "#0f172a",
          accentColor: "#d97706",
          createdAt: new Date().toISOString(),
        };
        setSchools([newSchool, ...schools]);
      } else {
        toast(res.error || "Failed to create institution.", "error");
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSchool) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateSchool(editingSchool.id, fd);
      if (res.ok) {
        toast("Institution updated successfully!", "success");
        setSchools((prev) =>
          prev.map((s) =>
            s.id === editingSchool.id
              ? {
                  ...s,
                  name: String(fd.get("name")),
                  slug: String(fd.get("slug")).toLowerCase(),
                  motto: String(fd.get("motto")),
                  email: String(fd.get("email")),
                  phone: String(fd.get("phone")),
                  address: String(fd.get("address")),
                  customDomain: String(fd.get("customDomain") || "") || null,
                  primaryColor: String(fd.get("primaryColor") || "") || null,
                  accentColor: String(fd.get("accentColor") || "") || null,
                  isActive: fd.get("isActive") === "true",
                }
              : s
          )
        );
        setEditingSchool(null);
      } else {
        toast(res.error || "Failed to update institution.", "error");
      }
    });
  };

  const handleToggleActive = (school: SchoolItem) => {
    const nextState = !school.isActive;
    startTransition(async () => {
      const res = await toggleSchoolActive(school.id, nextState);
      if (res.ok) {
        toast(
          `School ${nextState ? "activated" : "deactivated"} successfully!`,
          "success"
        );
        setSchools((prev) =>
          prev.map((s) => (s.id === school.id ? { ...s, isActive: nextState } : s))
        );
      } else {
        toast(res.error || "Failed to change status.", "error");
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingSchool) return;
    startTransition(async () => {
      const res = await deleteSchool(deletingSchool.id);
      if (res.ok) {
        toast("School deleted permanently.", "success");
        setSchools((prev) => prev.filter((s) => s.id !== deletingSchool.id));
        setDeletingSchool(null);
      } else {
        toast(res.error || "Failed to delete school.", "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Institutions Directory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Provision, configure, activate, deactivate, and manage all school tenants.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New School</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, slug or domain..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-slate-400 mr-1 font-semibold">Filter:</span>
          <button
            onClick={() => setFilterActive("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterActive === "all"
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            All ({schools.length})
          </button>
          <button
            onClick={() => setFilterActive("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterActive === "active"
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            Active ({schools.filter((s) => s.isActive).length})
          </button>
          <button
            onClick={() => setFilterActive("inactive")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterActive === "inactive"
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            Inactive ({schools.filter((s) => !s.isActive).length})
          </button>
        </div>
      </div>

      {/* Institutions Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Institution Name</th>
                <th className="px-6 py-4">URL Slug</th>
                <th className="px-6 py-4">Custom Domain</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((school) => (
                <tr key={school.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{school.name}</span>
                        {school.isDefault && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-normal">
                        {school.email || school.phone || "No contact info"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/s/${school.slug}`}
                      target="_blank"
                      className="font-mono text-xs text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>/s/{school.slug}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    {school.customDomain ? (
                      <span className="inline-flex items-center gap-1.5 text-indigo-400">
                        <Globe className="w-3.5 h-3.5" />
                        {school.customDomain}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {school.subscriptionTier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(school)}
                      disabled={isPending || school.isDefault}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
                        school.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                      }`}
                      title={school.isDefault ? "Default school cannot be deactivated" : "Click to toggle status"}
                    >
                      {school.isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingSchool(school)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit Institution"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!school.isDefault && (
                        <button
                          onClick={() => setDeletingSchool(school)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Institution"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-sm">
                    No institutions match the current search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision New School Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-1">Provision New Institution</h2>
            <p className="text-xs text-slate-400 mb-6">
              Creates a dedicated tenant website with independent branding, content, settings, and RLS isolation.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">School Name *</label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Greenwood Academy"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Slug *</label>
                  <input
                    name="slug"
                    required
                    placeholder="e.g. greenwood"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Motto / Tagline</label>
                <input
                  name="motto"
                  placeholder="e.g. Empowering Leaders of Tomorrow"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="info@greenwood.edu"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                  <input
                    name="phone"
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subscription Plan</label>
                  <select
                    name="subscriptionTier"
                    defaultValue="pro"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Admin Email</label>
                  <input
                    type="email"
                    name="initialAdminEmail"
                    placeholder="admin@greenwood.edu"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Provision School</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit School Modal */}
      {editingSchool && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setEditingSchool(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-1">Configure {editingSchool.name}</h2>
            <p className="text-xs text-slate-400 mb-6">
              Modify institution URL, custom domain, status, and branding colors.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">School Name *</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingSchool.name}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Slug *</label>
                  <input
                    name="slug"
                    required
                    defaultValue={editingSchool.slug}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Domain</label>
                <input
                  name="customDomain"
                  defaultValue={editingSchool.customDomain || ""}
                  placeholder="e.g. www.greenwood.edu"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Color (Hex)</label>
                  <input
                    name="primaryColor"
                    defaultValue={editingSchool.primaryColor || "#0f172a"}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Accent Color (Hex)</label>
                  <input
                    name="accentColor"
                    defaultValue={editingSchool.accentColor || "#d97706"}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingSchool.email || ""}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    name="isActive"
                    defaultValue={editingSchool.isActive ? "true" : "false"}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="true">Active (Publicly Accessible)</option>
                    <option value="false">Inactive (Suspended)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSchool(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
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
      {deletingSchool && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-rose-400 mb-2">Delete Institution?</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-white">{deletingSchool.name}</span> (/s/{deletingSchool.slug})?
              All associated pages, content, and settings will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingSchool(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
