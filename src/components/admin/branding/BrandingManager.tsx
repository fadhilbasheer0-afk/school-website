"use client";

import React, { useState, useTransition } from "react";
import {
  Palette,
  Save,
  GraduationCap,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import { updateSchoolBranding } from "@/lib/admin/actions/branding";
import { useToast } from "@/components/admin/ui";
import type { SchoolTheme } from "@/lib/tenant";

const COLOR_PRESETS = [
  { name: "Navy & Gold", primary: "#0f172a", accent: "#d97706" },
  { name: "Forest & Amber", primary: "#064e3b", accent: "#f59e0b" },
  { name: "Royal Indigo", primary: "#312e81", accent: "#6366f1" },
  { name: "Crimson & Rose", primary: "#881337", accent: "#e11d48" },
  { name: "Slate & Teal", primary: "#1e293b", accent: "#0d9488" },
];

export const BrandingManager: React.FC<{ initialTheme: SchoolTheme; schoolName: string }> = ({
  initialTheme,
  schoolName,
}) => {
  const [primaryColor, setPrimaryColor] = useState(initialTheme.primaryColor || "#0f172a");
  const [secondaryColor, setSecondaryColor] = useState(initialTheme.secondaryColor || "#1e293b");
  const [accentColor, setAccentColor] = useState(initialTheme.accentColor || "#d97706");
  const [fontFamily, setFontFamily] = useState(initialTheme.fontFamily || "sans");
  const [logoUrl, setLogoUrl] = useState(initialTheme.logoUrl || "");
  const [faviconUrl, setFaviconUrl] = useState(initialTheme.faviconUrl || "");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handlePreset = (preset: { primary: string; accent: string }) => {
    setPrimaryColor(preset.primary);
    setAccentColor(preset.accent);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateSchoolBranding(fd);
      if (res.ok) {
        toast("Theme branding updated successfully!", "success");
      } else {
        toast(res.error || "Failed to update branding.", "error");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Website Branding & Colors
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Customize your institution&rsquo;s color scheme, official typography, logo, and favicon.
          Branding changes apply across the header, footer, hero banners, and buttons.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Quick Presets */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-3">
              Academic Theme Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => handlePreset(p)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-colors text-left"
                >
                  <div className="flex -space-x-1 shrink-0">
                    <span className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: p.primary }} />
                    <span className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: p.accent }} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Inputs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Custom Palette
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Brand Color (Navy/Base)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Accent Highlight Color (Gold/Action)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  name="accentColor"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Secondary Dark/Container Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  name="secondaryColor"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Typography Font Family
              </label>
              <select
                name="fontFamily"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="sans">Geist / Modern Sans</option>
                <option value="inter">Inter Clean</option>
                <option value="serif">Classic Serif</option>
                <option value="playfair">Playfair Academic</option>
                <option value="mono">Technical Monospace</option>
              </select>
            </div>
          </div>

          {/* Logo & Favicon URLs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Identity Assets
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                School Logo Image URL
              </label>
              <input
                type="url"
                name="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://.../logo.png"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Favicon URL (Optional)
              </label>
              <input
                type="url"
                name="faviconUrl"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                placeholder="https://.../favicon.ico"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Branding Settings</span>
            </button>
          </div>
        </form>

        {/* Live Preview Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm sticky top-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Live Theme Preview</h3>
          </div>

          {/* Sample Header Simulation */}
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
            <div
              className="px-4 py-3 flex items-center justify-between text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white overflow-hidden shadow"
                  style={{ backgroundColor: accentColor }}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="w-4 h-4" />
                  )}
                </div>
                <span className="font-extrabold text-xs tracking-tight">{schoolName}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ color: accentColor }}>
                Apply Online
              </span>
            </div>

            {/* Sample Hero Simulation */}
            <div className="p-6 bg-slate-950 text-white text-center space-y-3">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                Admissions Open 2026
              </span>
              <h4 className="text-base font-black leading-snug">Empowering Leaders of Tomorrow</h4>
              <p className="text-xs text-slate-400">
                Rigorous academic curricula, world-class athletic facilities, and holistic character growth.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 shadow"
                  style={{ backgroundColor: accentColor }}
                >
                  Apply Online
                </button>
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 text-white hover:bg-slate-900"
                >
                  Virtual Tour
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
            <p><strong>Primary Color:</strong> {primaryColor}</p>
            <p><strong>Accent Color:</strong> {accentColor}</p>
            <p><strong>Font Family:</strong> {fontFamily}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
