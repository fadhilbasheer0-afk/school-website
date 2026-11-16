import React from "react";
import { Users, Mail, UserPlus, Shield, CheckCircle2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { inviteAdmin } from "@/lib/admin/actions/platform";
import { MOCK_TENANTS } from "@/lib/tenant";

interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  schoolName: string;
  isPlatformAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

export default async function PlatformUsersPage() {
  let users: UserProfile[] = [];
  let schoolsList: { id: string; name: string }[] = [];

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data: schools } = await supabase.from("schools").select("id, name");
      if (schools) schoolsList = schools;

      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, is_active, is_platform_admin, created_at, schools(name)")
        .order("created_at", { ascending: false });

      if (data) {
        users = data.map((u: any) => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          role: u.role,
          schoolName: u.schools?.name || "Unassigned / Platform",
          isPlatformAdmin: Boolean(u.is_platform_admin),
          isActive: Boolean(u.is_active),
          createdAt: u.created_at,
        }));
      }
    } catch {
      // Mock fallback
    }
  }

  if (schoolsList.length === 0) {
    schoolsList = Object.values(MOCK_TENANTS).map((t) => ({ id: t.id, name: t.name }));
  }

  if (users.length === 0) {
    users = [
      {
        id: "u-1",
        email: "superadmin@example.com",
        fullName: "Platform Super Admin",
        role: "owner",
        schoolName: "Global Platform",
        isPlatformAdmin: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "u-2",
        email: "school-admin@example.com",
        fullName: "School Administrator",
        role: "admin",
        schoolName: "School",
        isPlatformAdmin: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "u-3",
        email: "sample-admin@example.com",
        fullName: "School Admin",
        role: "admin",
        schoolName: "School",
        isPlatformAdmin: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async function handleInviteUser(formData: FormData) {
    "use server";
    await inviteAdmin(formData);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Users & Admins</h1>
          <p className="text-sm text-slate-400 mt-1">
            Global directory of school administrators, platform super admins, and staff members.
          </p>
        </div>
      </div>

      {/* Invite User Card */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          <span>Invite School or Platform Admin</span>
        </h2>
        <form action={handleInviteUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              placeholder="user@school.edu"
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned School</label>
            <select
              name="schoolId"
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">(None / Platform Admin)</option>
              {schoolsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
            <select
              name="role"
              defaultValue="admin"
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="admin">School Admin</option>
              <option value="owner">School Owner</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Assigned Institution</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Platform Admin</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="px-6 py-4 font-semibold text-white">
                  <div className="flex flex-col">
                    <span>{u.fullName || "Unspecified Name"}</span>
                    <span className="text-xs text-slate-400 font-normal">{u.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300 font-medium">{u.schoolName}</td>
                <td className="px-6 py-4">
                  <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-amber-400 border border-slate-800">
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.isPlatformAdmin ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                      <Shield className="w-3.5 h-3.5" />
                      Super Admin
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600">Standard</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {u.isActive ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Deactivated</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
