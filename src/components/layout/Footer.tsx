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

interface FooterLink {
  label: string;
  path: string;
}

const exploreLinks: FooterLink[] = [
  { label: "About Our School", path: "/about" },
  { label: "Academic Programs", path: "/academics" },
  { label: "Faculty Directory", path: "/faculty" },
  { label: "School Facilities", path: "/facilities" },
  { label: "Student Activities", path: "/activities" },
  { label: "Photo Gallery", path: "/gallery" },
];

const resourceLinks: FooterLink[] = [
  { label: "Admissions Process", path: "/admissions" },
  { label: "Latest News", path: "/news" },
  { label: "Upcoming Events", path: "/events" },
  { label: "Contact Us", path: "/contact" },
  { label: "Privacy Policy", path: "#" },
  { label: "Terms of Service", path: "#" },
];

export const Footer: React.FC<{ settings?: SchoolSettings }> = ({ settings }) => {
  const schoolName = settings?.schoolName || "PINECREST";
  const tagline = settings?.tagline || "International Academy";
  const logoUrl = settings?.logoUrl || null;
  const footerAbout =
    settings?.footerAbout ||
    "Providing a legacy of academic excellence, personal growth, and global citizenship. Empowering students since 1995.";
  const address = settings?.contactAddress || "125 Academy Road, Pinecrest Hills, NY 10024";
  const phone = settings?.contactPhone || "+1 (800) 555-0199";
  const email = settings?.contactEmail || "info@pinecrestacademy.edu";
  const copyright =
    settings?.footerCopyright ||
    `© ${new Date().getFullYear()} Pinecrest International Academy. All Rights Reserved.`;
  const socialLinks = settings?.socialLinks || {};
  const year = new Date().getFullYear();

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
            <Link href="/admissions">
              <Button variant="secondary" className="w-full text-center">
                Apply Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full text-center text-white border-slate-700 hover:bg-slate-800">
                Contact Admissions
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-16 px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 font-sans">
        {/* About, Contact & Social Info */}
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md overflow-hidden">
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
              <span className="font-extrabold text-lg tracking-tight text-white leading-none">
                {schoolName}
              </span>
              <span className="text-[10px] uppercase font-semibold text-amber-500 tracking-widest mt-1">
                {tagline}
              </span>
            </div>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed font-light">
            {footerAbout}
          </p>
          <div className="flex items-center gap-3">
            {socialItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 hover:text-amber-500 text-slate-400 transition-all duration-300 flex items-center justify-center"
                aria-label={`${schoolName} on ${item.label}`}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
            Explore
          </h4>
          <ul className="flex flex-col gap-3.5 text-sm font-medium">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.path}
                  className="hover:text-amber-400 hover:translate-x-1.5 transition-all duration-300 flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-slate-700" />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources & Policy Links */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
            Resources
          </h4>
          <ul className="flex flex-col gap-3.5 text-sm font-medium">
            {resourceLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.path}
                  className="hover:text-amber-400 hover:translate-x-1.5 transition-all duration-300 flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-slate-700" />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-6 text-sm">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Contact
          </h4>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3.5">
              <MapPin className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-slate-400 leading-relaxed font-light">
                {address}
              </p>
            </div>
            <div className="flex items-center gap-3.5">
              <Phone className="w-5 h-5 text-amber-500 shrink-0" />
              <a
                href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                className="text-slate-400 hover:text-amber-400 transition-colors font-light"
              >
                {phone}
              </a>
            </div>
            <div className="flex items-center gap-3.5">
              <Mail className="w-5 h-5 text-amber-500 shrink-0" />
              <a
                href={`mailto:${email}`}
                className="text-slate-400 hover:text-amber-400 transition-colors font-light"
              >
                {email}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Subscriptions */}
      <div className="border-t border-slate-900 py-6 px-6 md:px-8 text-center text-xs text-slate-500">
        <p className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>{copyright}</span>
          <span className="text-slate-600 font-light flex items-center gap-1.5">
            © {year} {schoolName}
          </span>
        </p>
      </div>
    </footer>
  );
};
