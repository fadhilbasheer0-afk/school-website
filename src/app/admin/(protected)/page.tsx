import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  Megaphone,
  CalendarDays,
  Users,
  Images,
  FileText,
  Newspaper,
  Home,
  Info,
  BookOpen,
  Building2,
  Trophy,
  ClipboardList,
  Phone,
  Settings,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface StatCard {
  label: string;
  value: number | null;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

async function fetchSchoolStats(schoolId: string | null) {
  const supabase = await createClient();

  const count = async (
    table: string,
    publishedOnly = false,
    activeOnly = false
  ): Promise<number | null> => {
    try {
      let query = supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (schoolId) {
        query = query.eq("school_id", schoolId);
      }
      if (publishedOnly) {
        query = query.eq("is_published", true);
      }
      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { count: total, error } = await query;
      if (error) {
        return null;
      }
      return total;
    } catch {
      return null;
    }
  };

  const [announcements, events, teachers, photos, admissions, profiles] =
    await Promise.all([
      count("announcements", true),
      count("events", true),
      count("teachers", false, true),
      count("gallery_photos", false, true),
      count("admissions", false, true),
      count("profiles"),
    ]);

  return { announcements, events, teachers, photos, admissions, profiles };
}

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const stats = await fetchSchoolStats(session.schoolId);

  const cards: StatCard[] = [
    {
      label: "Published Announcements",
      value: stats.announcements,
      icon: Newspaper,
      accent: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/40",
    },
    {
      label: "Published Events",
      value: stats.events,
      icon: CalendarDays,
      accent: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40",
    },
    {
      label: "Active Teachers",
      value: stats.teachers,
      icon: Users,
      accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40",
    },
    {
      label: "Gallery Photos",
      value: stats.photos,
      icon: Images,
      accent: "text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/40",
    },
    {
      label: "Admission Sections",
      value: stats.admissions,
      icon: FileText,
      accent: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/40",
    },
    {
      label: "User Profiles",
      value: stats.profiles,
      icon: Megaphone,
      accent: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/40",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Welcome back
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Content overview for this school. Content editing will be added here
          as CMS sections are built out.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}
            >
              <card.icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                {card.value === null ? "—" : card.value.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">
          Next steps
        </h3>
        <ul className="text-sm text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1.5">
          <li>
            Use the sidebar to manage content for each page section (Home, About,
            Academics, Faculty, Facilities, Activities, Gallery, News, Events,
            Admissions, Contact).
          </li>
          <li>
            Wire the public pages to read from Supabase using the same tables
            this dashboard summarizes.
          </li>
          <li>
            Upload media through the <code className="font-mono text-xs">school-media</code> storage bucket.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-4">
          Manage content
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sectionLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${link.accent}`}
              >
                <link.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {link.label}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const sectionLinks = [
  { label: "Home", path: "/admin/home", icon: Home, description: "Hero slides, content, stats", accent: "text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/40" },
  { label: "About", path: "/admin/about", icon: Info, description: "History, vision, mission", accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40" },
  { label: "Academics", path: "/admin/academics", icon: BookOpen, description: "Classes, departments, calendar", accent: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/40" },
  { label: "Faculty", path: "/admin/faculty", icon: Users, description: "Teacher profiles", accent: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40" },
  { label: "Facilities", path: "/admin/facilities", icon: Building2, description: "Campus facilities", accent: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/40" },
  { label: "Activities", path: "/admin/activities", icon: Trophy, description: "Clubs, sports, achievements", accent: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/40" },
  { label: "Gallery", path: "/admin/gallery", icon: Images, description: "Albums and photos", accent: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60" },
  { label: "News", path: "/admin/news", icon: Newspaper, description: "Announcements and posts", accent: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/40" },
  { label: "Events", path: "/admin/events", icon: CalendarDays, description: "School events", accent: "text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/40" },
  { label: "Admissions", path: "/admin/admissions", icon: ClipboardList, description: "Admission sections", accent: "text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-100 dark:bg-fuchsia-950/40" },
  { label: "Contact", path: "/admin/contact", icon: Phone, description: "Contact details", accent: "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/40" },
  { label: "Settings", path: "/admin/settings", icon: Settings, description: "Branding and site settings", accent: "text-lime-600 dark:text-lime-400 bg-lime-100 dark:bg-lime-950/40" },
];
