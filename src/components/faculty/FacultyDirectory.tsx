"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  X,
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { EmptyState } from "@/components/ui/FeedbackStates";
import {
  facultyDepartments,
  type FacultyMember,
  type FacultyDepartment,
} from "@/data/faculty";

type Filter = "All" | FacultyDepartment;

const filterOptions: Filter[] = ["All", ...facultyDepartments];

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

export const FacultyDirectory: React.FC<{ members: FacultyMember[] }> = ({ members }) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(() => {
    const q = normalize(query);
    return members.filter((member) => {
      const matchesDepartment = filter === "All" || member.department === filter;
      if (!matchesDepartment) return false;
      if (!q) return true;
      return [member.name, member.role, member.department, member.education, member.bio]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, filter, members]);

  const leadership = filtered.filter((m) => m.type === "leadership");
  const academic = filtered.filter((m) => m.type === "faculty");
  const hasResults = filtered.length > 0;

  return (
    <div>
      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-4 mb-12">
        <div className="relative w-full lg:w-[420px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, role, subject or department…"
            aria-label="Search faculty"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-11 pr-10 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter by department"
        >
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={filter === option}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                filter === option
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:text-amber-700 dark:hover:text-amber-400"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {!hasResults ? (
        <EmptyState
          title="No staff members found"
          description="Try adjusting your search term or selecting a different department."
          icon={<User className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />}
        />
      ) : (
        <div className="flex flex-col gap-16">
          {leadership.length > 0 && (
            <section aria-labelledby="leadership-heading">
              <h3
                id="leadership-heading"
                className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 pb-3 border-b border-slate-100 dark:border-slate-800"
              >
                Administrative Leadership
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {leadership.map((member) => (
                  <FacultyCard key={member.id} member={member} variant="horizontal" />
                ))}
              </div>
            </section>
          )}

          {academic.length > 0 && (
            <section aria-labelledby="instructors-heading">
              <h3
                id="instructors-heading"
                className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 pb-3 border-b border-slate-100 dark:border-slate-800"
              >
                Academic Instructors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {academic.map((member) => (
                  <FacultyCard key={member.id} member={member} variant="vertical" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

const FacultyCard: React.FC<{
  member: FacultyMember;
  variant: "horizontal" | "vertical";
}> = ({ member, variant }) => {
  if (variant === "horizontal") {
    return (
      <Card className="flex flex-col sm:flex-row h-full overflow-hidden items-center sm:items-stretch">
        <div className="w-full sm:w-[190px] shrink-0">
          <ImagePlaceholder
            label={`${member.name} Portrait`}
            aspectRatio="aspect-square"
            className="h-full rounded-r-none"
            icon={<User className="w-8 h-8 text-slate-400" />}
          />
        </div>
        <CardContentPadded>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            {member.department} Department
          </span>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mt-1">
            {member.name}
          </h4>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {member.role}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2.5">
            {member.bio}
          </p>
          <FacultyDetails member={member} />
          <FacultyContact member={member} />
        </CardContentPadded>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <ImagePlaceholder
        label={`${member.name} Portrait`}
        aspectRatio="aspect-[4/3]"
        className="rounded-b-none"
        icon={<User className="w-8 h-8 text-slate-400" />}
      />
      <CardHeader className="pb-2">
        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
          {member.department} Department
        </span>
        <CardTitle className="text-lg mt-1">{member.name}</CardTitle>
        <CardDescription className="text-xs font-medium text-slate-500">
          {member.role}
        </CardDescription>
      </CardHeader>
      <CardContentPadded>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {member.bio}
        </p>
        <FacultyDetails member={member} />
        <FacultyContact member={member} />
      </CardContentPadded>
    </Card>
  );
};

const CardContentPadded: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="p-6 flex flex-col justify-center gap-2 text-left flex-grow">{children}</div>;
};

const FacultyDetails: React.FC<{ member: FacultyMember }> = ({ member }) => (
  <div className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
    <div className="flex items-start gap-2">
      <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
      <span className="font-medium">{member.education}</span>
    </div>
    <div className="flex items-start gap-2">
      <Briefcase className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
      <span className="font-medium">{member.experience}</span>
    </div>
  </div>
);

const FacultyContact: React.FC<{ member: FacultyMember }> = ({ member }) => {
  if (!member.email && !member.phone) return null;
  return (
    <div className="flex flex-col gap-1.5 mt-3">
      {member.email && (
        <a
          href={`mailto:${member.email}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
        >
          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
          {member.email}
        </a>
      )}
      {member.phone && (
        <a
          href={`tel:${member.phone.replace(/[^+\d]/g, "")}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
        >
          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
          {member.phone}
        </a>
      )}
    </div>
  );
};
