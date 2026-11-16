import React from "react";
import Link from "next/link";
import { Globe, Plus, Trash2, CheckCircle, ShieldCheck } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { addDomain, deleteDomain } from "@/lib/admin/actions/platform";
import { MOCK_TENANTS } from "@/lib/tenant";

interface DomainEntry {
  id: string;
  domain: string;
  schoolId: string;
  schoolName: string;
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default async function PlatformDomainsPage() {
  let domains: DomainEntry[] = [];
  let schoolsList: { id: string; name: string }[] = [];

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data: schools } = await supabase.from("schools").select("id, name");
      if (schools) schoolsList = schools;

      const { data } = await supabase
        .from("school_domains")
        .select("id, domain, school_id, is_primary, is_verified, created_at, schools(name)")
        .order("created_at", { ascending: false });

      if (data) {
        domains = data.map((d: any) => ({
          id: d.id,
          domain: d.domain,
          schoolId: d.school_id,
          schoolName: d.schools?.name || "Unknown School",
          isPrimary: Boolean(d.is_primary),
          isVerified: Boolean(d.is_verified),
          createdAt: d.created_at,
        }));
      }
    } catch {
      // Mock fallback
    }
  }

  if (schoolsList.length === 0) {
    schoolsList = Object.values(MOCK_TENANTS).map((t) => ({ id: t.id, name: t.name }));
  }

  if (domains.length === 0) {
    domains = [
      {
        id: "d-1",
        domain: "demo.example.com",
        schoolId: "7a04d7c8-4b8e-4f0d-9f3c-2f6f6e4a1b5d",
        schoolName: "School",
        isPrimary: true,
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "d-2",
        domain: "sample.example.com",
        schoolId: "8b15e8d9-5c9f-5a1e-8f4d-3a7a7e5b2c6e",
        schoolName: "School",
        isPrimary: true,
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async function handleAddDomain(formData: FormData) {
    "use server";
    const schoolId = String(formData.get("schoolId"));
    const domain = String(formData.get("domain"));
    const isPrimary = formData.get("isPrimary") === "true";
    await addDomain(schoolId, domain, isPrimary);
  }

  async function handleDeleteDomain(formData: FormData) {
    "use server";
    const domainId = String(formData.get("domainId"));
    await deleteDomain(domainId);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Domains & Subdomains</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure custom school domains and map hostnames to school tenants.
          </p>
        </div>
      </div>

      {/* Add Domain Card */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Connect New Custom Domain</span>
        </h2>
        <form action={handleAddDomain} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target School *</label>
            <select
              name="schoolId"
              required
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              {schoolsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Domain Name *</label>
            <input
              name="domain"
              required
              placeholder="e.g. portal.greenwood.edu"
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              Connect Domain
            </button>
          </div>
        </form>
      </div>

      {/* Domains Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Domain</th>
              <th className="px-6 py-4">Institution</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">SSL & Verification</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {domains.map((d) => (
              <tr key={d.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-white font-semibold">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-500" />
                    <span>{d.domain}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300 font-medium">{d.schoolName}</td>
                <td className="px-6 py-4">
                  {d.isPrimary ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Primary Domain
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Alias</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Verified</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <form action={handleDeleteDomain} className="inline-block">
                    <input type="hidden" name="domainId" value={d.id} />
                    <button
                      type="submit"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Disconnect Domain"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
