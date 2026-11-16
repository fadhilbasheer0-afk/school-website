import React from "react";
import { CreditCard, Check, ShieldCheck, Zap } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { updateSubscription } from "@/lib/admin/actions/platform";
import { MOCK_TENANTS } from "@/lib/tenant";

interface SubItem {
  schoolId: string;
  schoolName: string;
  slug: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  status: "active" | "trialing" | "past_due" | "canceled" | "paused";
  billingCycle: string;
}

export default async function PlatformSubscriptionsPage() {
  let subscriptions: SubItem[] = [];

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("schools")
        .select("id, name, slug, subscription_tier, school_subscriptions(plan, status, billing_cycle)")
        .order("name", { ascending: true });

      if (data) {
        subscriptions = data.map((s: any) => ({
          schoolId: s.id,
          schoolName: s.name,
          slug: s.slug,
          plan: s.school_subscriptions?.[0]?.plan || s.subscription_tier || "free",
          status: s.school_subscriptions?.[0]?.status || "active",
          billingCycle: s.school_subscriptions?.[0]?.billing_cycle || "monthly",
        }));
      }
    } catch {
      // Mock fallback
    }
  }

  if (subscriptions.length === 0) {
    subscriptions = Object.values(MOCK_TENANTS).map((t) => ({
      schoolId: t.id,
      schoolName: t.name,
      slug: t.slug,
      plan: t.subscriptionTier,
      status: "active",
      billingCycle: "annual",
    }));
  }

  async function handlePlanChange(formData: FormData) {
    "use server";
    const schoolId = String(formData.get("schoolId"));
    const plan = String(formData.get("plan")) as any;
    const status = String(formData.get("status")) as any;
    await updateSubscription(schoolId, plan, status);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Subscriptions & Billing</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage tier entitlements, licensing statuses, and pricing plans across all institutions.
          </p>
        </div>
      </div>

      {/* Plan Entitlements Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Free Tier</span>
          <p className="text-2xl font-black text-white mt-1">Free</p>
          <p className="text-xs text-slate-500 mt-2">Up to 3 custom pages, basic branding, path routing.</p>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Starter Tier</span>
          <p className="text-2xl font-black text-white mt-1">$49/mo</p>
          <p className="text-xs text-slate-500 mt-2">Subdomains, unlimited pages, standard CMS controls.</p>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Pro Tier</span>
          <p className="text-2xl font-black text-white mt-1">$149/mo</p>
          <p className="text-xs text-slate-500 mt-2">Custom domains, full branding, page & section reordering.</p>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Enterprise Tier</span>
          <p className="text-2xl font-black text-white mt-1">$399/mo</p>
          <p className="text-xs text-slate-500 mt-2">Multiple domains, high-bandwidth storage, dedicated support.</p>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Institution</th>
              <th className="px-6 py-4">Current Plan</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Billing Cycle</th>
              <th className="px-6 py-4 text-right">Update Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {subscriptions.map((sub) => (
              <tr key={sub.schoolId} className="hover:bg-slate-900/40 transition-colors">
                <td className="px-6 py-4 font-semibold text-white">
                  <div className="flex flex-col">
                    <span>{sub.schoolName}</span>
                    <span className="text-xs text-slate-500 font-mono">/s/{sub.slug}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="capitalize px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-amber-400 border border-slate-800">
                    {sub.plan}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="capitalize">{sub.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 capitalize text-xs text-slate-400 font-medium">
                  {sub.billingCycle}
                </td>
                <td className="px-6 py-4 text-right">
                  <form action={handlePlanChange} className="inline-flex items-center gap-2">
                    <input type="hidden" name="schoolId" value={sub.schoolId} />
                    <select
                      name="plan"
                      defaultValue={sub.plan}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                    >
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                    <select
                      name="status"
                      defaultValue={sub.status}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="past_due">Past Due</option>
                      <option value="canceled">Canceled</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Save
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
