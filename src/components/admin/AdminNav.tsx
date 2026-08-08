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
} from "lucide-react";

const navLinks = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Home", path: "/admin/home", icon: Home },
  { label: "About", path: "/admin/about", icon: Info },
  { label: "Academics", path: "/admin/academics", icon: BookOpen },
  { label: "Faculty & Staff", path: "/admin/faculty", icon: Users },
  { label: "Facilities", path: "/admin/facilities", icon: Building2 },
  { label: "Activities & Achievements", path: "/admin/activities", icon: Trophy },
  { label: "Gallery", path: "/admin/gallery", icon: Images },
  { label: "News & Announcements", path: "/admin/news", icon: Newspaper },
  { label: "Events", path: "/admin/events", icon: CalendarDays },
  { label: "Admissions", path: "/admin/admissions", icon: ClipboardList },
  { label: "Contact", path: "/admin/contact", icon: Phone },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

/**
 * Sidebar navigation for the protected admin area.
 */
export const AdminNav: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) =>
    path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);

  return (
    <nav className="flex flex-col gap-1 w-full lg:w-64 shrink-0">
      <p className="text-xs uppercase tracking-widest font-semibold text-slate-400 dark:text-slate-500 px-3 mb-2">
        Content
      </p>
      {navLinks.map((link) => (
        <Link
          key={link.path}
          href={link.path}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
            isActive(link.path)
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <link.icon className="w-4 h-4 shrink-0" />
          <span className="truncate">{link.label}</span>
        </Link>
      ))}

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View website
        </Link>
      </div>
    </nav>
  );
};
