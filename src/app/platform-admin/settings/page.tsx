import React from "react";
import { Sliders, Save, AlertTriangle } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { updatePlatformSettings } from "@/lib/admin/actions/platform";

export default async function PlatformGlobalSettingsPage() {
  let settings = {
    platform_name: "EduSaaS Multi-School Platform",
    support_email: "support@edusaas.com",
    allow_school_registration: true,
    maintenance_mode: false,
    announcement: "",
  };

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("platform_settings")
        .select("*")
        .maybeSingle();
      if (data) settings = data;
    } catch {
      // Fallback
    }
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    await updatePlatformSettings(formData);
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-black tracking-tight text-white">Global Platform Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure multi-institution platform defaults, support channels, and maintenance mode.
        </p>
      </div>

      <form action={handleSubmit} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Platform Brand Name *</label>
          <input
            name="platformName"
            required
            defaultValue={settings.platform_name}
            className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Global Support Email *</label>
          <input
            type="email"
            name="supportEmail"
            required
            defaultValue={settings.support_email}
            className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">System-wide Broadcast Banner</label>
          <textarea
            name="announcement"
            rows={2}
            defaultValue={settings.announcement || ""}
            placeholder="e.g. Scheduled platform maintenance on Sunday 02:00 UTC."
            className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-800/80 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="allowSchoolRegistration"
              value="true"
              defaultChecked={settings.allow_school_registration}
              className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-800 focus:ring-0"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Allow Public School Registration</span>
              <span className="text-[11px] text-slate-400">
                When enabled, new school operators can submit self-service signup requests.
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="maintenanceMode"
              value="true"
              defaultChecked={settings.maintenance_mode}
              className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-800 focus:ring-0"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-rose-400">Enable Maintenance Mode</span>
              <span className="text-[11px] text-slate-400">
                Puts all public websites into maintenance view while keeping super admin accessible.
              </span>
            </div>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Platform Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
