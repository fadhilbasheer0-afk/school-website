import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle,
  ClipboardList,
  PenTool,
  Calendar,
  ShieldCheck,
  Mail,
  Phone,
  Clock,
  Download,
  FileText,
  BadgeCheck,
  Users,
  BookOpen,
  ArrowRight,
  Landmark,
  CircleCheckBig,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { AdmissionsInquiryForm } from "@/components/admissions/AdmissionsInquiryForm";
import { siteConfig } from "@/lib/site";
import { getAdmissions } from "@/lib/content";

export const metadata: Metadata = {
  title: "Admissions & Enrollment",
  description:
    "Learn about eligibility, classes available, required documents, the admission procedure, important dates, application instructions, and tuition fees at Irshad Academy.",
  alternates: {
    canonical: `${siteConfig.url}/admissions`,
  },
  openGraph: {
    title: "Admissions & Enrollment | Irshad Academy",
    description:
      "Start your child's journey at Irshad Academy. Review eligibility, required documents, admission steps, important dates, and tuition fees.",
    url: `${siteConfig.url}/admissions`,
    type: "website",
  },
};

const eligibilityItems = [
  {
    icon: <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    title: "Age Requirements",
    desc: "Applicants must meet the age cut-off for their target grade level as of September 1 of the enrolling academic year.",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    title: "Academic Standing",
    desc: "Satisfactory completion of the previous academic year with transcripts or report cards from the past two years.",
  },
  {
    icon: <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    title: "Entrance Assessment",
    desc: "All applicants sit an age-appropriate cognitive and literacy assessment during the interview visit.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
    title: "Health & Immunization",
    desc: "Up-to-date immunization records and a completed health & medical form are required before enrollment.",
  },
  {
    icon: <CircleCheckBig className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
    title: "English Proficiency",
    desc: "Non-native English speakers may be required to provide proof of proficiency; ESL support is available.",
  },
  {
    icon: <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
    title: "International Students",
    desc: "International applicants need a valid passport and, where applicable, proof of visa eligibility.",
  },
];

const classesAvailable = [
  {
    level: "Early Years",
    grades: "Kindergarten 1 – Kindergarten 2",
    ages: "Ages 4 – 6",
    desc: "Play-based foundation curriculum with early literacy, numeracy, and social development.",
  },
  {
    level: "Primary School",
    grades: "Grades 1 – 5",
    ages: "Ages 6 – 11",
    desc: "Core subjects with a focus on inquiry, reading, mathematics, and creative expression.",
  },
  {
    level: "Middle School",
    grades: "Grades 6 – 8",
    ages: "Ages 11 – 14",
    desc: "Interdisciplinary learning with electives in robotics, languages, and the performing arts.",
  },
  {
    level: "High School",
    grades: "Grades 9 – 12",
    ages: "Ages 14 – 18",
    desc: "Rigorous college-preparatory curriculum including Advanced Placement and STEM pathways.",
  },
];

const requiredDocuments = [
  "Completed Application for Admission form",
  "Copy of the student's birth certificate",
  "Valid passport copy and two passport-sized photographs",
  "Transcripts / report cards from the previous two academic years",
  "Two teacher recommendation letters",
  "Medical history and immunization records",
  "Standardized test scores (if available)",
  "English proficiency evidence (for non-native speakers)",
];

const importantDates = [
  { milestone: "Applications Open", date: "October 1, 2026" },
  { milestone: "International Application Deadline", date: "December 15, 2026" },
  { milestone: "Domestic Application Deadline", date: "January 15, 2027" },
  { milestone: "Entrance Assessment Day", date: "February 21, 2027" },
  { milestone: "Admission Decisions Released", date: "March 15, 2027" },
  { milestone: "Enrollment & Tuition Deadline", date: "May 1, 2027" },
  { milestone: "New Student Orientation", date: "August 20, 2027" },
];

const applicationInstructions = [
  "Submit the online application or download and complete the Application for Admission form.",
  "Compile all required documents listed above and upload them to your application portal.",
  "Book an entrance assessment and campus interview through the admissions office.",
  "Receive your admission decision and, if accepted, complete the enrollment agreement.",
  "Settle the registration fee and first-term tuition, then collect uniforms and schedules.",
];

const feeSchedule = [
  { item: "Application Fee (non-refundable)", amount: "$75" },
  { item: "Registration Fee (one-time)", amount: "$250" },
  { item: "Tuition – Early Years (per term)", amount: "$3,200" },
  { item: "Tuition – Primary (per term)", amount: "$3,400" },
  { item: "Tuition – Middle School (per term)", amount: "$3,800" },
  { item: "Tuition – High School (per term)", amount: "$4,250" },
  { item: "Boarding (annual, optional)", amount: "from $8,500" },
];

const downloadableForms = [
  { title: "Application for Admission", desc: "Primary enrollment form for new students." },
  { title: "Student Health & Medical Form", desc: "Required health history for all enrolled students." },
  { title: "Immunization Record Template", desc: "Official vaccination history worksheet." },
  { title: "Teacher Recommendation Form", desc: "Template for the two required references." },
  { title: "School Records Release", desc: "Authorization to request prior transcripts." },
];

const admissionSteps = [
  {
    step: "01",
    icon: <ClipboardList className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    title: "Inquire Online",
    desc: "Complete the online inquiry form below to register your interest and share academic histories.",
  },
  {
    step: "02",
    icon: <PenTool className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    title: "Document Audit",
    desc: "Provide student transcripts, immunization files, birth certificates, and passport copies for verification.",
  },
  {
    step: "03",
    icon: <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    title: "Assessment Interview",
    desc: "Schedule a campus visit for basic cognitive assessment tests and a discussion with our principal.",
  },
  {
    step: "04",
    icon: <CheckCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    title: "Enrollment & Fees",
    desc: "Upon qualification approval, complete admission forms, settle term fees, and pick up uniforms.",
  },
];

export default async function Admissions() {
  const sections = await getAdmissions();
  const byKey: Record<string, string | undefined> = {};
  for (const s of sections) byKey[s.sectionKey] = s.body;

  return (
    <div className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Section Heading */}
        <SectionHeading
          as="h1"
          badge="Enrollment"
          title="Admissions & Enrollment"
          subtitle="Discover how your child can join Irshad Academy — from eligibility and required documents to application steps, important dates, and tuition."
          align="center"
          className="mx-auto"
        />

        {/* Introduction */}
        <section aria-labelledby="introduction-heading" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-24">
          <div className="overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-lg shadow-slate-100/50 dark:shadow-none">
            <ImagePlaceholder
              label="Students walking through the Irshad Academy main campus courtyard"
              aspectRatio="aspect-[4/3]"
              className="rounded-none border-0"
            />
          </div>
          <div>
            <h2 id="introduction-heading" className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome to the Irshad Community
            </h2>
            <div className="h-1.5 w-20 bg-gradient-to-r from-amber-500 to-indigo-600 rounded-full mt-4 mb-6" />
            {(byKey.introduction
              ? byKey.introduction.split("\n").filter(Boolean)
              : [
                  "Since 1995, Irshad Academy has welcomed students from more than 35 nationalities into a vibrant, globally-minded learning community. Our admissions process is designed to be transparent and supportive, helping families find the right placement for their child.",
                  "We review each application holistically — academic records, personal character, and potential — rather than through test scores alone. Scholarships and financial aid are available for qualifying families.",
                ]
            ).map((paragraph, i) => (
              <p
                key={i}
                className={`text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed${
                  i === 0 ? " mb-4" : " mb-8"
                }`}
              >
                {paragraph}
              </p>
            ))}
            <div className="flex flex-wrap gap-4">
              <Link href="#inquiry-form">
                <Button variant="secondary" leftIcon={<ArrowRight className="w-4 h-4" />}>
                  Start Your Application
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" leftIcon={<Phone className="w-4 h-4" />}>
                  Talk to Admissions
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Eligibility */}
        <section aria-labelledby="eligibility-heading" className="mb-24">
          <SectionHeading
            as="h2"
            badge="Who Can Apply"
            title="Eligibility Requirements"
            subtitle={byKey.eligibility || "Families considering enrollment should review the following criteria before beginning an application."}
            align="center"
            className="mx-auto"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibilityItems.map((item) => (
              <Card key={item.title} className="p-6">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 font-light">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Classes Available */}
        <section aria-labelledby="classes-heading" className="mb-24">
          <SectionHeading
            as="h2"
            badge="Class Levels"
            title="Classes Available"
            subtitle={byKey.classes || "Admissions are open across all grade levels for the upcoming academic year."}
            align="center"
            className="mx-auto"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {classesAvailable.map((level, idx) => (
              <Card key={level.level} className="flex flex-col h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                      Level {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                      {level.ages}
                    </span>
                  </div>
                  <CardTitle className="text-base">{level.level}</CardTitle>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                    {level.grades}
                  </p>
                </CardHeader>
                <CardContent className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 flex-grow">
                  {level.desc}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Required Documents */}
        <section aria-labelledby="documents-heading" className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <SectionHeading
                as="h2"
                badge="Checklist"
                title="Required Documents"
                subtitle={byKey.documents || "Please prepare the following documents. Incomplete applications may not be considered."}
                align="left"
              />
              <ul className="flex flex-col gap-3.5">
                {requiredDocuments.map((doc) => (
                  <li
                    key={doc}
                    className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-lg shadow-slate-100/50 dark:shadow-none sticky top-8">
                <ImagePlaceholder
                  label="Admissions office desk with application folders and documents"
                  aspectRatio="aspect-[4/3]"
                  className="rounded-none border-0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Admission Procedure */}
        <section aria-labelledby="procedure-heading" className="mb-24">
          <SectionHeading
            as="h2"
            badge="Application Flow"
            title="Admission Procedure"
            subtitle={byKey.procedure || "Four clear steps take you from inquiry to enrollment."}
            align="center"
            className="mx-auto"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {admissionSteps.map((st, idx) => (
              <Card key={idx} hoverEffect={false} className="border-t-4 border-t-amber-500/85">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                      {st.icon}
                    </div>
                    <span className="text-lg font-black text-slate-300 dark:text-slate-700 tracking-tight">#{st.step}</span>
                  </div>
                  <CardTitle className="text-base mt-4">{st.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-1">
                  {st.desc}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Important Dates */}
        <section aria-labelledby="dates-heading" className="mb-24">
          <SectionHeading
            as="h2"
            badge="Key Deadlines"
            title="Important Dates"
            subtitle={byKey["important-dates"] || "Mark your calendar — these deadlines apply to the upcoming academic year."}
            align="center"
            className="mx-auto"
          />
          <ol className="flex flex-col max-w-3xl mx-auto gap-0">
            {importantDates.map((d, idx) => (
              <li key={d.milestone} className="relative flex gap-5 pb-8 last:pb-0">
                {idx < importantDates.length - 1 && (
                  <span aria-hidden="true" className="absolute left-[15px] top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
                )}
                <span
                  aria-hidden="true"
                  className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/40 border-2 border-amber-500 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                >
                  {idx + 1}
                </span>
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-1">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{d.milestone}</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 sm:text-right">{d.date}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Application Instructions + CTA */}
        <section aria-labelledby="instructions-heading" className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7">
              <SectionHeading
                as="h2"
                badge="How to Apply"
                title="Application Instructions"
                subtitle="Follow these steps to submit a complete application."
                align="left"
              />
              <ol className="flex flex-col gap-4">
                {applicationInstructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">{instruction}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Application CTA */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white rounded-3xl p-8 md:p-10 sticky top-8 flex flex-col gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Ready to Apply?</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mt-2 font-light">
                    Applications for the {new Date().getFullYear() + 1}–{new Date().getFullYear() + 2} academic year
                    are open. Start your application online or download the admission pack to get started.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <a href="#inquiry-form">
                    <Button variant="secondary" className="w-full" leftIcon={<ArrowRight className="w-4 h-4" />}>
                      Start Online Application
                    </Button>
                  </a>
                  <a href="#downloadable-forms">
                    <Button variant="outline" className="w-full text-white border-slate-700 hover:bg-slate-800" leftIcon={<Download className="w-4 h-4" />}>
                      Download Application Forms
                    </Button>
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Prefer paper? Print the downloadable forms below and mail them to the admissions office.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Fees */}
        <section aria-labelledby="fees-heading" className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <SectionHeading
                as="h2"
                badge="Tuition"
                title="Fees & Tuition"
                subtitle={byKey.fees || "A transparent fee schedule for the upcoming academic year."}
                align="left"
              />
              <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10 p-5">
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Scholarships & Financial Aid
                </h3>
                <p className="text-xs text-amber-700/90 dark:text-amber-200/70 leading-relaxed mt-2 font-light">
                  Irshad offers merit-based academic scholarships (up to 50% tuition) and athletic &amp; creative
                  grants (up to 30%). All figures below are indicative and subject to the annual fee review.
                </p>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Fee Item
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Amount
                  </span>
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {feeSchedule.map((fee) => (
                    <li key={fee.item} className="flex items-center justify-between gap-4 px-6 py-3.5">
                      <span className="text-sm text-slate-600 dark:text-slate-300">{fee.item}</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">{fee.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Downloadable Forms */}
        <section aria-labelledby="downloadable-forms-heading" id="downloadable-forms" className="mb-24">
          <SectionHeading
            as="h2"
            badge="Downloads"
            title="Downloadable Forms & Documents"
            subtitle={byKey.forms || "Download and print the required admission forms. Digital uploads are also accepted through the application portal."}
            align="center"
            className="mx-auto"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloadableForms.map((form) => (
              <Card key={form.title} className="p-6 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <a
                    href="#downloadable-forms"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    aria-label={`Download ${form.title}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4">{form.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5 flex-grow font-light">
                  {form.desc}
                </p>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                  PDF · Available via CMS
                </span>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact + Inquiry Form */}
        <section aria-labelledby="contact-form-heading" className="my-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Contact information */}
            <aside className="lg:col-span-5 flex flex-col gap-6 text-left order-2 lg:order-1">
              <div>
                <h2 id="contact-form-heading" className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                  Admissions Office
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light mb-6">
                  Our registrar team is happy to answer questions about placements, tours, and tuition.
                </p>
                <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Email</h3>
                      <a href={`mailto:${siteConfig.admissionsEmail}`} className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                        {siteConfig.admissionsEmail}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Phone</h3>
                      <a href={`tel:${siteConfig.phoneAdmissions.replace(/[^+\d]/g, "")}`} className="text-xs text-slate-500 dark:text-slate-400 hover:text-amber-600 font-medium">
                        {siteConfig.phoneAdmissions}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Office Hours</h3>
                      {siteConfig.officeHours.map((hours) => (
                        <p key={hours.label} className="text-xs text-slate-500 dark:text-slate-400 font-light">
                          {hours.label}: <span className="font-medium">{hours.value}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Inquiry form */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <AdmissionsInquiryForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
