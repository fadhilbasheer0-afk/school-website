import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSchoolSettings } from "@/lib/content";
import { siteConfig } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Legacy of Academic Excellence`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: "school, academy, international school, education, high school, pinecrest",
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    siteName: siteConfig.name,
    type: "website",
    locale: siteConfig.locale,
    title: `${siteConfig.name} | Legacy of Academic Excellence`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Legacy of Academic Excellence`,
    description: siteConfig.description,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSchoolSettings();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
        <Header settings={settings} />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
