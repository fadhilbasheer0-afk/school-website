import React from "react";
import { notFound } from "next/navigation";
import { Check, Eye, Camera, Building2, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { facilities as staticFacilities } from "@/data/facilities";
import { getFacilities } from "@/lib/content";
import { resolveTenant, isPageEnabled } from "@/lib/tenant";

const categoryColor: Record<string, string> = {
  Academic: "text-indigo-600 dark:text-indigo-400",
  Sports: "text-amber-600 dark:text-amber-400",
  Arts: "text-emerald-600 dark:text-emerald-400",
  Common: "text-sky-600 dark:text-sky-400",
  Outdoor: "text-emerald-600 dark:text-emerald-400",
};

const iconByTitle = new Map(staticFacilities.map((f) => [f.title, f.icon]));
const DefaultIcon: LucideIcon = Building2;

export default async function Facilities() {
  const tenant = await resolveTenant();
  const enabled = await isPageEnabled(tenant.id, "facilities");
  if (!enabled) notFound();

  const cmsFacilities = await getFacilities(undefined, tenant.id);
  const items =
    cmsFacilities.length > 0
      ? cmsFacilities.map((f) => ({
          ...f,
          icon: iconByTitle.get(f.title) ?? DefaultIcon,
        }))
      : staticFacilities;

  return (
    <div className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Section Heading */}
        <SectionHeading
          badge="Campus Life"
          title="State-of-the-Art Facilities"
          subtitle="Explore our 20-acre campus — designed to inspire academic rigor, creativity, and collaborative play at every turn."
          align="center"
          className="mx-auto"
        />

        {/* Highlight Banner / Concept */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-8 shadow-sm">
          <div className="lg:col-span-6">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Campus Environment
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 mb-4 leading-tight">
              A Safe, Modern Space Built for Growth
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm md:text-base">
              Irshad Academy is committed to secure and sustainable
              environments. Our buildings integrate filtered airflow, central
              air conditioning, backup power, and automated emergency alert
              systems.
            </p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm md:text-base mt-3">
              Continuous security guard surveillance and card-access doors
              ensure peace of mind for parents and students alike.
            </p>
          </div>
          <div className="lg:col-span-6 w-full">
            <ImagePlaceholder
              label="Centennial Library Main Lobby Concept (CMS administrative placeholder)"
              aspectRatio="aspect-video"
              icon={<Eye className="w-10 h-10 text-slate-400" />}
            />
          </div>
        </div>

        {/* Facilities Grid */}
        <div>
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Areas of Exploration
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Interactive Campus Tour
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((facility) => {
              const Icon = facility.icon;
              return (
                <Card key={facility.id} className="flex flex-col h-full">
                  {/* Main image placeholder */}
                  <ImagePlaceholder
                    label={facility.mainImage}
                    src={facility.mainImage}
                    aspectRatio="aspect-video"
                    className="rounded-b-none"
                  />

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${categoryColor[facility.category]}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {facility.category}
                      </span>
                    </div>
                    <CardTitle className="text-lg mt-2.5 leading-snug">
                      {facility.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-4 flex-grow">
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                      {facility.description}
                    </p>

                    {/* Key features */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                        Key Features
                      </span>
                      <ul className="flex flex-col gap-2 mt-2.5">
                        {facility.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400"
                          >
                            <span className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-px">
                              <Check className="w-3 h-3" />
                            </span>
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Additional image placeholders */}
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                        <Camera className="w-3.5 h-3.5" />
                        Photo Gallery
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {facility.galleryImages.map((image) => (
                          <ImagePlaceholder
                            key={image}
                            label={image}
                            src={image}
                            aspectRatio="aspect-square"
                            icon={
                              <Camera className="w-4 h-4 text-slate-400" />
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
