"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Mail, GraduationCap, ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";
import type { SchoolSettings } from "@/lib/content";
import type { SchoolPageConfig, CustomPage, TenantContext } from "@/lib/tenant";
import { getTenantUrl } from "@/lib/tenant";

interface NavLink {
  label: string;
  path: string;
}

interface HeaderProps {
  settings?: SchoolSettings;
  pages?: SchoolPageConfig[];
  customPages?: CustomPage[];
  tenant?: TenantContext;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  pages,
  customPages = [],
  tenant,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  const schoolName = settings?.schoolName || tenant?.name || "IRSHAD";
  const tagline = settings?.tagline || tenant?.motto || "International Academy";
  const logoUrl = settings?.logoUrl || tenant?.theme?.logoUrl || null;
  const phone = settings?.contactPhone || tenant?.phone || "+1 (800) 555-0199";
  const email = settings?.contactEmail || tenant?.email || "info@irshadacademy.edu";
  const year = new Date().getFullYear();

  // Dynamic Navigation Generation
  const tCtx: TenantContext = tenant ?? {
    id: "default",
    slug: "irshad",
    name: schoolName,
    motto: tagline,
    establishedYear: 1995,
    address: null,
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

  let navLinks: NavLink[] = [];
  let quickNavLinks: NavLink[] = [];

  if (pages && pages.length > 0) {
    const enabledPages = [...pages]
      .filter((p) => p.isEnabled !== false && p.isInNav !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    // Custom pages that should be in nav
    const enabledCustom = [...customPages]
      .filter((cp) => cp.isPublished !== false && cp.isInNav !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    // Map standard pages
    const mainKeys = ["about", "academics", "faculty", "facilities", "activities", "gallery", "events"];
    const quickKeys = ["admissions", "news", "contact"];

    navLinks.push({ label: "Home", path: getTenantUrl(tCtx, "/") });

    enabledPages.forEach((p) => {
      const linkItem = {
        label: p.navLabel || p.title,
        path: getTenantUrl(tCtx, `/${p.slug}`),
      };
      if (quickKeys.includes(p.pageKey)) {
        quickNavLinks.push(linkItem);
      } else {
        navLinks.push(linkItem);
      }
    });

    enabledCustom.forEach((cp) => {
      navLinks.push({
        label: cp.navLabel || cp.title,
        path: getTenantUrl(tCtx, `/p/${cp.slug}`),
      });
    });
  } else {
    // Fallback default navigation
    navLinks = [
      { label: "Home", path: getTenantUrl(tCtx, "/") },
      { label: "About Us", path: getTenantUrl(tCtx, "/about") },
      { label: "Academics", path: getTenantUrl(tCtx, "/academics") },
      { label: "Faculty", path: getTenantUrl(tCtx, "/faculty") },
      { label: "Facilities", path: getTenantUrl(tCtx, "/facilities") },
      { label: "Activities", path: getTenantUrl(tCtx, "/activities") },
      { label: "Gallery", path: getTenantUrl(tCtx, "/gallery") },
      { label: "Events", path: getTenantUrl(tCtx, "/events") },
    ];
    quickNavLinks = [
      { label: "Admissions", path: getTenantUrl(tCtx, "/admissions") },
      { label: "News", path: getTenantUrl(tCtx, "/news") },
      { label: "Contact Us", path: getTenantUrl(tCtx, "/contact") },
    ];
  }

  const allLinks = [...navLinks, ...quickNavLinks];
  const admissionsEnabled = pages ? pages.some((p) => p.pageKey === "admissions" && p.isEnabled) : true;

  // Close mobile menu when the route changes
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="w-full fixed top-0 left-0 z-50 transition-all duration-300">
        {/* Top Information Bar (Desktop Only) */}
        {!isScrolled && (
          <div className="hidden lg:flex w-full bg-slate-900 text-slate-300 py-2.5 px-8 justify-between border-b border-slate-800 text-xs">
            <div className="flex items-center gap-6">
              <a
                href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{phone}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{email}</span>
              </a>
            </div>
            <div className="flex items-center gap-6 font-medium">
              {quickNavLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`hover:text-amber-400 transition-colors ${
                    pathname === link.path
                      ? "text-amber-400 font-bold"
                      : "text-slate-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Navbar */}
        <nav
          className={`w-full py-4 px-6 md:px-8 flex items-center justify-between transition-all duration-300 ${
            isScrolled
              ? "bg-white/90 dark:bg-slate-950/90 shadow-md backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 py-3.5"
              : "bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900"
          }`}
        >
          {/* Logo */}
          <Link href={getTenantUrl(tCtx, "/")} className="flex items-center gap-2.5 group">
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
                <GraduationCap className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg md:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
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

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`relative py-1.5 text-sm font-semibold tracking-wide transition-colors hover:text-amber-600 dark:hover:text-amber-400 ${
                  pathname === link.path
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                {link.label}
                {pathname === link.path && (
                  <span
                    className="absolute bottom-0 left-0 w-full h-0.5 rounded-full"
                    style={{
                      backgroundColor: tenant?.theme?.accentColor || "#d97706",
                    }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {admissionsEnabled && (
              <Link href={getTenantUrl(tCtx, "/admissions")}>
                <Button variant="secondary" size="sm">
                  Apply Online
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
            id="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </header>

      {/* Spacer to push content below the fixed header */}
      <div className={`w-full transition-all duration-300 ${isScrolled ? "h-[72px]" : "h-[72px] lg:h-[110px]"}`} />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[300px] bg-white dark:bg-slate-950 shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out border-l border-slate-100 dark:border-slate-800 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${schoolName} logo`}
                  className="w-6 h-6 rounded-lg object-cover"
                />
              ) : (
                <GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              )}
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                {schoolName}
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links List */}
          <div className="flex flex-col gap-1 overflow-y-auto flex-1 pr-1">
            {allLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  }`}
                >
                  <span className="text-sm font-semibold tracking-wide">
                    {link.label}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive
                        ? "text-amber-500"
                        : "text-slate-300 dark:text-slate-600 group-hover:translate-x-1"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Mobile Footer Callout */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
            {admissionsEnabled && (
              <Link href={getTenantUrl(tCtx, "/admissions")} className="block w-full mb-3">
                <Button variant="secondary" className="w-full text-center py-3">
                  Apply Online
                </Button>
              </Link>
            )}
            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
              © {year} {schoolName}.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
