import React from "react";
import { ShieldCheck, User, Clock, Terminal } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

interface AuditEntry {
  id: string;
  action: string;
  actorEmail: string | null;
  targetType: string;
  targetId: string | null;
  details: Record<string, any>;
  createdAt: string;
}

export default async function PlatformAuditPage() {
  let logs: AuditEntry[] = [];

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        logs = data.map((l: any) => ({
          id: l.id,
          action: l.action,
          actorEmail: l.actor_email,
          targetType: l.target_type,
          targetId: l.target_id,
          details: l.details || {},
          createdAt: l.created_at,
        }));
      }
    } catch {
      // Mock fallback
    }
  }

  if (logs.length === 0) {
    logs = [
      {
        id: "l-1",
        action: "school.provisioned",
        actorEmail: "superadmin@example.com",
        targetType: "school",
        targetId: "demo-school",
        details: { name: "Demo School", tier: "pro" },
        createdAt: new Date().toISOString(),
      },
      {
        id: "l-2",
        action: "domain.verified",
        actorEmail: "superadmin@example.com",
        targetType: "school_domains",
        targetId: "example.edu",
        details: { status: "ssl_active" },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "l-3",
        action: "user.role_promoted",
        actorEmail: "superadmin@example.com",
        targetType: "profiles",
        targetId: "user-1",
        details: { newRole: "owner", school: "sample-school" },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  }

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-black tracking-tight text-white">Security & Audit Logs</h1>
        <p className="text-sm text-slate-400 mt-1">
          Immutable audit trail of administrative modifications, provisioning events, and tenant operations.
        </p>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Actor</th>
              <th className="px-6 py-4">Target</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300 font-sans">{log.actorEmail || "System"}</td>
                <td className="px-6 py-4 text-slate-400">
                  <span className="text-indigo-400 font-bold">{log.targetType}</span>
                  {log.targetId && <span className="text-slate-500 ml-1">({log.targetId})</span>}
                </td>
                <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                  {JSON.stringify(log.details)}
                </td>
                <td className="px-6 py-4 text-right text-slate-500">
                  {new Date(log.createdAt).toLocaleDateString()}{" "}
                  {new Date(log.createdAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
