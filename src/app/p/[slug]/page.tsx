import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant";
import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/public";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface CustomPageProps {
  params: Promise<{ slug: string }>;
}

async function getCustomPage(schoolId: string, slug: string) {
  if (!isSupabaseConfigured) {
    if (slug === "demo") {
      return {
        title: "Campus Innovation Initiative",
        navLabel: "Innovation",
        content: `
# Campus Innovation Initiative

Welcome to our specialized campus initiative. Here at our institution, we continuously invest in state-of-the-art learning laboratories, interdisciplinary programs, and student-centered growth environments.

## Highlights
- Advanced Maker-Space & Robotics Workshops
- Sustainable Campus Greenhouses
- Global Partnership Exchange Seminars
        `,
        metaDescription: "Learn more about our campus innovation programs and facilities.",
      };
    }
    return null;
  }

  const client = createPublicClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("custom_pages")
      .select("*")
      .eq("school_id", schoolId)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: CustomPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await resolveTenant();
  const page = await getCustomPage(tenant.id, slug);

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: `${page.title} | ${tenant.name}`,
    description: page.meta_description || page.title,
  };
}

export default async function CustomPageView({ params }: CustomPageProps) {
  const { slug } = await params;
  const tenant = await resolveTenant();
  const page = await getCustomPage(tenant.id, slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="flex-1 w-full pb-20">
      {/* Hero Header */}
      <section
        className="w-full py-16 px-6 md:px-8 text-white text-center"
        style={{
          backgroundColor: tenant.theme.primaryColor || "#0f172a",
        }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <p
            className="text-xs uppercase font-extrabold tracking-widest"
            style={{ color: tenant.theme.accentColor || "#d97706" }}
          >
            {tenant.name}
          </p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">{page.title}</h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 pt-12">
        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed text-base md:text-lg">
          {page.content}
        </div>
      </section>
    </div>
  );
}
