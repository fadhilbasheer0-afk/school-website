"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Info,
  BookOpen,
  Users,
  Building2,
  Trophy,
  Images,
  Newspaper,
  CalendarDays,
  ClipboardList,
  Phone,
  Settings,
  ExternalLink,
  Layers,
  LayoutGrid,
  FileText,
  Palette,
  Shield,
} from "lucide-react";

const structureLinks = [
  { label: "Pages & Navigation", path: "/admin/pages", icon: Layers },
  { label: "Homepage Sections", path: "/admin/sections", icon: LayoutGrid },
  { label: "Custom Pages", path: "/admin/custom-pages", icon: FileText },
  { label: "Branding & Colors", path: "/admin/branding", icon: Palette },
];

const contentLinks = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Home Banner", path: "/admin/home", icon: Home },
  { label: "About Page", path: "/admin/about", icon: Info },
  { label: "Academics", path: "/admin/academics", icon: BookOpen },
  { label: "Faculty & Staff", path: "/admin/faculty", icon: Users },
  { label: "Facilities", path: "/admin/facilities", icon: Building2 },
  { label: "Activities & Awards", path: "/admin/activities", icon: Trophy },
  { label: "Photo Gallery", path: "/admin/gallery", icon: Images },
  { label: "News & Bulletins", path: "/admin/news", icon: Newspaper },
  { label: "Events Calendar", path: "/admin/events", icon: CalendarDays },
  { label: "Admissions Inquiries", path: "/admin/admissions", icon: ClipboardList },
  { label: "Contact Info", path: "/admin/contact", icon: Phone },
  { label: "General Settings", path: "/admin/settings", icon: Settings },
];

/**
 * Sidebar navigation for the protected school admin area.
 */
export const AdminNav: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) =>
    path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);

  return (
    <nav className="flex flex-col gap-6 w-full lg:w-64 shrink-0">
      {/* Structure & Branding */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-widest font-bold text-amber-600 dark:text-amber-500 px-3 mb-1">
          Website Structure
        </p>
        {structureLinks.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isActive(link.path)
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <link.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Content Management */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 px-3 mb-1">
          Content & Media
        </p>
        {contentLinks.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isActive(link.path)
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <link.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Public Site</span>
        </Link>
        <Link
          href="/platform-admin"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
        >
          <Shield className="w-4 h-4" />
          <span>Platform Super Admin</span>
        </Link>
      </div>
    </nav>
  );
};
