import React from "react";
import Link from "next/link";
import {
  School,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Users,
  Plus,
  ArrowRight,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { MOCK_TENANTS } from "@/lib/tenant";

interface SchoolRow {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  subscription_tier: string;
  custom_domain: string | null;
  created_at: string;
}

interface AuditRow {
  id: string;
  action: string;
  actor_email: string | null;
  target_type: string;
  created_at: string;
}

export default async function PlatformAdminOverview() {
  let schools: SchoolRow[] = [];
  let userCount = 3;
  let auditLogs: AuditRow[] = [];

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data: schoolsData } = await supabase
        .from("schools")
        .select("id, name, slug, is_active, subscription_tier, custom_domain, created_at")
        .order("created_at", { ascending: false });

      if (schoolsData) schools = schoolsData;

      const { count: uCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });
      if (uCount !== null) userCount = uCount;

      const { data: logs } = await supabase
        .from("audit_logs")
        .select("id, action, actor_email, target_type, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (logs) auditLogs = logs;
    } catch {
      // Fallback to mock
    }
  }

  if (schools.length === 0) {
    schools = Object.values(MOCK_TENANTS).map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      is_active: t.isActive,
      subscription_tier: t.subscriptionTier,
      custom_domain: null,
      created_at: new Date().toISOString(),
    }));
  }

  const totalSchools = schools.length;
  const activeSchools = schools.filter((s) => s.is_active).length;
  const proOrEnterprise = schools.filter(
    (s) => s.subscription_tier === "pro" || s.subscription_tier === "enterprise"
  ).length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Platform Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Global multi-institution monitoring, tenant provisioning, and subscription management.
          </p>
        </div>
        <Link
          href="/platform-admin/schools?action=create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New School</span>
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Institutions</span>
            <School className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">{totalSchools}</span>
            <p className="text-xs text-slate-400 mt-1">Multi-tenant school websites</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Websites</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-emerald-400">{activeSchools}</span>
            <p className="text-xs text-slate-400 mt-1">Live & accessible to public</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Paid Tiers</span>
            <CreditCard className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-indigo-400">{proOrEnterprise}</span>
            <p className="text-xs text-slate-400 mt-1">Pro & Enterprise subscriptions</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">{userCount}</span>
            <p className="text-xs text-slate-400 mt-1">Admins, editors & viewers</p>
          </div>
        </div>
      </div>

      {/* Institutions Directory Quick View */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-base text-white">Active Institutions</h2>
          </div>
          <Link
            href="/platform-admin/schools"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>Manage All Institutions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Institution</th>
                <th className="px-6 py-3.5">Slug / URL</th>
                <th className="px-6 py-3.5">Plan</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {schools.map((school) => (
                <tr key={school.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">
                    <div className="flex flex-col">
                      <span>{school.name}</span>
                      {school.custom_domain && (
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3 text-slate-400" />
                          {school.custom_domain}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    <Link
                      href={`/s/${school.slug}`}
                      target="_blank"
                      className="font-mono text-xs text-amber-400/90 hover:underline"
                    >
                      /s/{school.slug}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {school.subscription_tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {school.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/platform-admin/schools?edit=${school.id}`}
                      className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors inline-block"
                    >
                      Configure
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Audit Events */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-white">Recent Security & Audit Logs</h3>
          </div>
          <Link
            href="/platform-admin/audit"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            View Full Trail
          </Link>
        </div>

        {auditLogs.length > 0 ? (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-xs py-2 border-b border-slate-800/50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {log.action}
                  </span>
                  <span className="text-slate-300">{log.actor_email || "System"}</span>
                </div>
                <span className="text-slate-500 font-mono">
                  {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">
            No audit events recorded yet. Platform actions will appear here in real time.
          </p>
        )}
      </div>
    </div>
  );
}
