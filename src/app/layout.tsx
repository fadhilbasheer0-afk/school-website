import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSchoolSettings } from "@/lib/content";
import { resolveTenant, getSchoolPages, getSchoolCustomPages } from "@/lib/tenant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await resolveTenant();
  const siteUrl = tenant.website || "https://example.edu";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${tenant.name} | ${tenant.motto || "Excellence in Education"}`,
      template: `%s | ${tenant.name}`,
    },
    description: tenant.motto || `${tenant.name} provides modern academic pathways and leadership development.`,
    keywords: `${tenant.name}, school, academy, academics, education, curriculum`,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      siteName: tenant.name,
      type: "website",
      locale: "en_US",
      title: `${tenant.name} | Excellence in Education`,
      description: tenant.motto || `${tenant.name} empowers students for tomorrow.`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${tenant.name} | Excellence in Education`,
      description: tenant.motto || `${tenant.name} empowers students for tomorrow.`,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await resolveTenant();
  const settings = await getSchoolSettings(tenant.id);
  const pages = await getSchoolPages(tenant.id);
  const customPages = await getSchoolCustomPages(tenant.id);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
      style={{
        "--tenant-primary": tenant.theme.primaryColor,
        "--tenant-accent": tenant.theme.accentColor,
      } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
        <Header settings={settings} pages={pages} customPages={customPages} tenant={tenant} />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer settings={settings} pages={pages} tenant={tenant} />
      </body>
    </html>
  );
}
