import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, ExternalLink, Navigation } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { SocialLinks } from "@/components/contact/SocialLinks";
import { siteConfig } from "@/lib/site";
import { getSchoolSettings, getContactInfo } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Pinecrest Academy. Find our school address, phone numbers, emails, office hours, campus map, and social media — or send us a message.",
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
  openGraph: {
    title: "Contact Us | Pinecrest Academy",
    description:
      "Reach Pinecrest Academy by phone, email, or visit our campus. Explore our contact details, office hours, and location map.",
    url: `${siteConfig.url}/contact`,
    type: "website",
  },
};

export default async function Contact() {
  const [settings, contactInfo] = await Promise.all([
    getSchoolSettings(),
    getContactInfo(),
  ]);

  const addressEntry = contactInfo.find((e) => e.type === "address");
  const phoneEntries = contactInfo.filter((e) => e.type === "phone");
  const emailEntries = contactInfo.filter((e) => e.type === "email");

  const addressValue =
    settings.contactAddress ||
    addressEntry?.value ||
    `${siteConfig.address.street}, ${siteConfig.address.city}`;
  const phoneMain =
    settings.contactPhone || phoneEntries[0]?.value || siteConfig.phoneMain;
  const phoneAdmissions =
    phoneEntries[1]?.value || siteConfig.phoneAdmissions;
  const emailGeneral =
    settings.contactEmail || emailEntries[0]?.value || siteConfig.email;
  const emailPrincipal =
    emailEntries[1]?.value || siteConfig.principalEmail;
  const officeHours =
    settings.officeHours.length > 0
      ? settings.officeHours
      : siteConfig.officeHours;

  const contactCards = [
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "School Address",
      accent:
        "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400",
      body: (
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          {addressValue}
        </p>
      ),
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Phone Numbers",
      accent:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400",
      body: (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
            Main Office:{" "}
            <a
              href={`tel:${phoneMain.replace(/[^+\d]/g, "")}`}
              className="text-sm text-slate-600 dark:text-slate-300 font-medium hover:text-amber-600 dark:hover:text-amber-400"
            >
              {phoneMain}
            </a>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
            Admissions:{" "}
            <a
              href={`tel:${phoneAdmissions.replace(/[^+\d]/g, "")}`}
              className="text-sm text-slate-600 dark:text-slate-300 font-medium hover:text-amber-600 dark:hover:text-amber-400"
            >
              {phoneAdmissions}
            </a>
          </p>
        </>
      ),
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Emails",
      accent:
        "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
      body: (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
            General:{" "}
            <a
              href={`mailto:${emailGeneral}`}
              className="text-sm text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              {emailGeneral}
            </a>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
            Principal:{" "}
            <a
              href={`mailto:${emailPrincipal}`}
              className="text-sm text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              {emailPrincipal}
            </a>
          </p>
        </>
      ),
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Office Hours",
      accent:
        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
      body: (
        <>
          {officeHours.map((hours) => (
            <p
              key={hours.label}
              className="text-xs text-slate-500 dark:text-slate-400 font-light"
            >
              {hours.label}:{" "}
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                {hours.value}
              </span>
            </p>
          ))}
        </>
      ),
    },
  ];

  return (
    <div className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Section Heading */}
        <SectionHeading
          as="h1"
          badge="Get in Touch"
          title="Contact Us"
          subtitle="If you have questions about admissions, scheduling tours, or seeking media details, let us know."
          align="center"
          className="mx-auto"
        />

        {/* Contact information cards */}
        <section aria-labelledby="contact-cards-heading" className="mb-16">
          <h2 id="contact-cards-heading" className="sr-only">
            Contact information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((card) => (
              <div
                key={card.title}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.accent}`}>
                  {card.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                <div className="flex flex-col gap-1">{card.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Form and Direct Contact grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start my-16">
          {/* Left Column: Quick info + social */}
          <aside className="lg:col-span-5 flex flex-col gap-8 text-left order-2 lg:order-1">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                Campus Directory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light mb-6">
                Pinecrest Academy welcomes visitors, parents, and community members. Reach the department you need directly — or follow us on social media for daily campus life.
              </p>
            </div>

            {/* Social media */}
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Follow Us Online
              </h2>
              <SocialLinks iconClassName="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:text-amber-500 text-slate-500 dark:text-slate-400 transition-all duration-300 flex items-center justify-center" />
            </div>

            {/* Campus map quick link */}
            <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Plan Your Visit</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-light">
                    {siteConfig.address.street}, {siteConfig.address.city}
                  </span>
                </div>
              </div>
              <a
                href={siteConfig.address.mapLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Open in Google Maps
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </aside>

          {/* Right Column: Contact form */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <ContactForm />
          </div>
        </div>

        {/* Google Maps section */}
        <section aria-labelledby="map-heading" className="my-16">
          <div className="text-center mb-8">
            <h2 id="map-heading" className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Find Us on Campus
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto font-light">
              {siteConfig.address.street}, {siteConfig.address.city} · GPS {siteConfig.address.gps}
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80 shadow-xl shadow-slate-100/50 dark:shadow-none">
            <iframe
              title="Google Map showing the Pinecrest Academy campus at 125 Academy Road, Pinecrest Hills, NY 10024"
              src={siteConfig.address.mapEmbedUrl}
              width="100%"
              height="480"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full aspect-[16/9] md:aspect-auto md:h-[480px]"
            />
          </div>
          <p className="text-center mt-4">
            <Link
              href={siteConfig.address.mapLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Get Directions
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
