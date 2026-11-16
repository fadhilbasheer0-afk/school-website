import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchoolPages, getTenantUrl, resolveTenant } from "@/lib/tenant";

interface PageProps {
  params: Promise<{ schoolSlug: string; pageSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { schoolSlug, pageSlug } = await params;
  const tenant = await resolveTenant({ slug: schoolSlug });
  const pages = await getSchoolPages(tenant.id);
  const page = pages.find((item) => item.slug === pageSlug || item.pageKey === pageSlug);

  if (!page || !page.isEnabled) return { title: "Page Not Found" };

  return {
    title: `${page.title} | ${tenant.name}`,
    description: page.metaDescription || page.heroDescription || tenant.name,
  };
}

export default async function DynamicTenantPage({ params }: PageProps) {
  const { schoolSlug, pageSlug } = await params;
  const tenant = await resolveTenant({ slug: schoolSlug });
  if (!tenant.isActive) notFound();

  const pages = await getSchoolPages(tenant.id);
  const page = pages.find((item) => item.slug === pageSlug || item.pageKey === pageSlug);
  if (!page || !page.isEnabled) notFound();

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-24 md:px-8">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-600">
        {tenant.name}
      </p>
      <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
        {page.heroTitle || page.title}
      </h1>
      {page.heroDescription && (
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          {page.heroDescription}
        </p>
      )}
      <Link
        href={getTenantUrl(tenant, "/")}
        className="mt-8 w-fit font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
      >
        Return to home
      </Link>
    </section>
  );
}
