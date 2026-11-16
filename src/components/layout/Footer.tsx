import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Button } from "../ui/Button";
import type { SchoolSettings } from "@/lib/content";
import type { SchoolPageConfig, TenantContext } from "@/lib/tenant";
import { getTenantUrl } from "@/lib/tenant-url";

interface FooterProps {
  settings?: SchoolSettings;
  pages?: SchoolPageConfig[];
  tenant?: TenantContext;
}

export const Footer: React.FC<FooterProps> = ({ settings, pages, tenant }) => {
  const schoolName = settings?.schoolName || tenant?.name || "School name";
  const tagline = settings?.tagline || tenant?.motto || "";
  const logoUrl = settings?.logoUrl || tenant?.theme?.logoUrl || null;
  const footerAbout =
    settings?.footerAbout ||
    tenant?.motto ||
    "A customizable website for schools.";
  const address = settings?.contactAddress || tenant?.address || "";
  const phone = settings?.contactPhone || tenant?.phone || "";
  const email = settings?.contactEmail || tenant?.email || "";
  const copyright =
    settings?.footerCopyright ||
    `© ${new Date().getFullYear()} ${schoolName}. All Rights Reserved.`;
  const socialLinks = settings?.socialLinks || {};
  const year = new Date().getFullYear();

  const tCtx: TenantContext = tenant ?? {
    id: "default",
    slug: "demo-school",
    name: schoolName,
    motto: tagline,
    establishedYear: 1995,
    address,
    phone,
    email,
    website: null,
    isActive: true,
    subscriptionTier: "pro",
    theme: {
      primaryColor: "#0f172a",
      secondaryColor: "#1e293b",
      accentColor: "#d97706",
      fontFamily: "sans",
      logoUrl: null,
      faviconUrl: null,
      bannerUrl: null,
    },
    isPathScoped: false,
  };

  // Build footer links based on enabled pages
  const exploreKeys = ["about", "academics", "faculty", "facilities", "activities", "gallery"];
  const resourceKeys = ["admissions", "news", "events", "contact"];

  const exploreLinks = pages
    ? pages
        .filter((p) => exploreKeys.includes(p.pageKey) && p.isEnabled !== false)
        .map((p) => ({ label: p.title, path: getTenantUrl(tCtx, `/${p.slug}`) }))
    : [
        { label: "About the school", path: getTenantUrl(tCtx, "/about") },
        { label: "Academic Programs", path: getTenantUrl(tCtx, "/academics") },
        { label: "Faculty Directory", path: getTenantUrl(tCtx, "/faculty") },
        { label: "School Facilities", path: getTenantUrl(tCtx, "/facilities") },
        { label: "Student Activities", path: getTenantUrl(tCtx, "/activities") },
        { label: "Photo Gallery", path: getTenantUrl(tCtx, "/gallery") },
      ];

  const resourceLinks = pages
    ? pages
        .filter((p) => resourceKeys.includes(p.pageKey) && p.isEnabled !== false)
        .map((p) => ({ label: p.title, path: getTenantUrl(tCtx, `/${p.slug}`) }))
    : [
        { label: "Admissions Process", path: getTenantUrl(tCtx, "/admissions") },
        { label: "Latest News", path: getTenantUrl(tCtx, "/news") },
        { label: "Upcoming Events", path: getTenantUrl(tCtx, "/events") },
        { label: "Contact Us", path: getTenantUrl(tCtx, "/contact") },
      ];

  const socialItems = [
    { label: "Facebook", href: socialLinks.facebook ?? "#", icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg> },
    { label: "Twitter", href: socialLinks.twitter ?? "#", icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
    { label: "Instagram", href: socialLinks.instagram ?? "#", icon: <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg> },
    { label: "LinkedIn", href: socialLinks.linkedin ?? "#", icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" /></svg> },
    { label: "YouTube", href: socialLinks.youtube ?? "#", icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900">
      {/* Top Banner (Call to Action) */}
      <div className="border-b border-slate-900/90 py-10 px-6 md:px-8 bg-slate-900/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Ready to Shape Your Child&rsquo;s Future?
            </h3>
            <p className="text-slate-400 mt-1.5 text-sm md:text-base max-w-xl leading-relaxed">
              Applications for the upcoming academic year are now open. Get in touch with our admissions office.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href={getTenantUrl(tCtx, "/admissions")}>
              <Button variant="secondary" className="w-full text-center">
                Apply Now
              </Button>
            </Link>
            <Link href={getTenantUrl(tCtx, "/contact")}>
              <Button variant="outline" className="w-full text-center text-white border-slate-700 hover:bg-slate-800">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <Link href={getTenantUrl(tCtx, "/")} className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105 overflow-hidden"
              style={{
                backgroundColor: tenant?.theme?.primaryColor || "#0f172a",
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${schoolName} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <GraduationCap className="w-6 h-6" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white leading-none">
                {schoolName}
              </span>
              <span
                className="text-[10px] uppercase font-semibold tracking-widest mt-1"
                style={{
                  color: tenant?.theme?.accentColor || "#d97706",
                }}
              >
            {tagline}
              </span>
            </div>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            {footerAbout}
          </p>
          <div className="flex items-center gap-3 pt-2">
            {socialItems.filter((item) => item.href && item.href !== "#").map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label={`Visit our ${item.label} page`}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Column 1: Explore */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Explore
          </h4>
          <ul className="space-y-2 text-sm">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.path}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-500 transition-colors" />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: Resources */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Resources
          </h4>
          <ul className="space-y-2 text-sm">
            {resourceLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.path}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-500 transition-colors" />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div className="flex flex-col space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1 border-b border-slate-800 pb-2">
            Contact Us
          </h4>
          {address && <div className="flex items-start gap-2.5 text-xs md:text-sm text-slate-400">
            <MapPin className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <span>{address}</span>
          </div>}
          {phone && <div className="flex items-center gap-2.5 text-xs md:text-sm text-slate-400">
            <Phone className="w-4 h-4 shrink-0 text-amber-500" />
            <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="hover:text-white transition-colors">
              {phone}
            </a>
          </div>}
          {email && <div className="flex items-center gap-2.5 text-xs md:text-sm text-slate-400">
            <Mail className="w-4 h-4 shrink-0 text-amber-500" />
            <a href={`mailto:${email}`} className="hover:text-white transition-colors">
              {email}
            </a>
          </div>}
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="border-t border-slate-900 py-6 px-6 md:px-8 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <p>{copyright}</p>
        <div className="flex items-center gap-6">
          <Link href={getTenantUrl(tCtx, "/contact")} className="hover:text-slate-400 transition-colors">
            Support
          </Link>
          <Link href="/admin" className="hover:text-slate-400 transition-colors">
            Institution Portal
          </Link>
          <Link href="/platform-admin" className="hover:text-slate-400 transition-colors">
            Super Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};
