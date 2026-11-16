import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Shield,
  Sparkles,
  Target,
  Award,
  Building,
  Users,
  Heart,
  Lightbulb,
  Globe,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAboutSections } from "@/lib/content";
import { resolveTenant, isPageEnabled } from "@/lib/tenant";

/* ─── data ──────────────────────────────────────────────── */

const coreValues = [
  {
    icon: <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    title: "Pursuit of Excellence",
    description:
      "We set high standards of academic achievement for every student and provide the resources, mentoring, and encouragement needed to reach them.",
  },
  {
    icon: <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    title: "Integrity & Respect",
    description:
      "Honesty, moral courage, and mutual respect are the bedrock of our school community. We expect every member to act with honour.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    title: "Innovation in Learning",
    description:
      "We embrace modern pedagogies, integrate technology thoughtfully, and foster creative problem-solving across all disciplines.",
  },
  {
    icon: <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
    title: "Compassion & Service",
    description:
      "Our students learn that privilege carries responsibility. Community service, charity partnerships, and environmental stewardship are woven into school life.",
  },
  {
    icon: <Globe className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
    title: "Global Awareness",
    description:
      "With 35 nationalities represented on campus, we celebrate cultural diversity and prepare students to thrive in an interconnected world.",
  },
  {
    icon: <Lightbulb className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
    title: "Lifelong Curiosity",
    description:
      "We nurture a love of learning that extends far beyond exams — encouraging inquiry, reading, debate, and intellectual risk-taking.",
  },
];

const milestones = [
  {
    year: "1995",
    title: "Irshad School Founded",
    description:
      "Opened with 120 primary-grade students and 8 teachers in a single rented building, driven by the vision of founders Dr. James Whitfield and Mrs. Amara Okonkwo.",
  },
  {
    year: "2002",
    title: "New 20-Acre Campus Inaugurated",
    description:
      "Relocated to our current purpose-built campus featuring secondary classrooms, a science block, a library, and the first sports playing fields.",
  },
  {
    year: "2008",
    title: "Cambridge IGCSE Partnership",
    description:
      "Became an authorized Cambridge International Examinations centre, offering IGCSE qualifications alongside the national curriculum.",
  },
  {
    year: "2010",
    title: "International Baccalaureate (IB) Authorization",
    description:
      "Received global authorization as an IB World School, offering the Diploma Programme in Grades 11–12.",
  },
  {
    year: "2018",
    title: "Centennial Library & Digital Commons",
    description:
      "Opened a state-of-the-art library housing 32,000 volumes, high-speed research terminals, a makerspace, and collaborative study rooms.",
  },
  {
    year: "2020",
    title: "STEM & Robotics Innovation Hub",
    description:
      "Partnered with leading technology educators to launch coding, electronics, 3D-printing, and competitive robotics programmes.",
  },
  {
    year: "2024",
    title: "Olympic Aquatic Center Opening",
    description:
      "Completed a heated, 10-lane semi-Olympic swimming facility with diving boards, coaching suites, and spectator seating.",
  },
];

const managementTeam = [
  {
    name: "Dr. James L. Whitfield",
    role: "Chairman, Board of Governors",
    bio: "Co-founder of Irshad Academy with 30 years of experience in educational administration. Holds a Ph.D. in Curriculum Design from Stanford University.",
  },
  {
    name: "Mrs. Amara N. Okonkwo",
    role: "Vice-Chairperson & Co-Founder",
    bio: "A pioneer in early-childhood education policy, Mrs. Okonkwo spearheaded the school's community outreach initiatives and parent engagement programmes.",
  },
  {
    name: "Mr. David R. Harrington",
    role: "Director of Finance & Operations",
    bio: "A certified public accountant with 20 years of experience in non-profit financial management, ensuring sustainable growth and fiscal transparency.",
  },
  {
    name: "Dr. Priya S. Menon",
    role: "Director of Academic Affairs",
    bio: "An IB-trained curriculum specialist, Dr. Menon oversees programme development, faculty recruitment, and quality assurance across all academic divisions.",
  },
];

/* ─── page ──────────────────────────────────────────────── */

export default async function About() {
  const tenant = await resolveTenant();
  const enabled = await isPageEnabled(tenant.id, "about");
  if (!enabled) notFound();

  const sections = await getAboutSections(tenant.id);
  const intro = sections.intro;
  const vision = sections.vision;
  const mission = sections.mission;
  const values = sections.values;
  const leadership = sections.leadership;

  return (
    <div className="w-full flex flex-col font-sans">
      {/* ════════ 1 · INTRODUCTION ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Who We Are"
            title={`About ${tenant.name}`}
            subtitle={`A community built on academic rigour, personal achievement, and character growth.`}
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            <div className="lg:col-span-5">
              <ImagePlaceholder
                label="Historic campus hall — original school building and archives"
                aspectRatio="aspect-[4/3]"
                icon={<Building className="w-12 h-12 text-slate-400" />}
              />
            </div>
            <div className="lg:col-span-7 flex flex-col gap-5 text-left">
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {intro?.title || "A Proud Legacy of Leadership and Innovation"}
              </h3>
              {(intro?.body
                ? intro.body.split("\n").filter(Boolean)
                : [
                    "Founded in 1995 by Dr. James Whitfield and Mrs. Amara Okonkwo, Irshad Academy began with a bold vision: to deliver a premium international education that fosters critical thinking, empathy, and a deep respect for diverse cultures. Over the past quarter-century, we have grown from a single classroom building to a state-of-the-art 20-acre campus.",
                    "Today, Irshad serves more than 1,200 students representing 35 nationalities. Our alumni network spans six continents, with graduates attending Ivy League universities, leading tech start-ups, practising medicine, and contributing to public policy at the highest levels. We are proud of every student who has walked through our gates — and deeply committed to the students who will walk through them next.",
                  ]
              ).map((paragraph, i) => (
                <p key={i} className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {paragraph}
                </p>
              ))}
              <div className="flex gap-4 mt-2">
                <Link href="/faculty">
                  <Button variant="primary">Meet the Faculty</Button>
                </Link>
                <Link href="/admissions">
                  <Button variant="outline">Admission Details</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 2 · HISTORY TIMELINE ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
              Our Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-1 tracking-tight">
              Milestones of Progress
            </h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed">
              Reflecting on our journey from a small local school to a globally
              accredited international academy.
            </p>
          </div>

          <div className="relative border-l-2 border-slate-800 pl-8 flex flex-col gap-12">
            {milestones.map((m, i) => (
              <div key={i} className="relative">
                {/* dot */}
                <div className="absolute -left-[calc(2rem+5px)] top-1 w-5 h-5 rounded-full bg-amber-500 border-4 border-slate-950" />
                <span className="text-amber-500 font-extrabold text-sm tracking-wider uppercase">
                  {m.year}
                </span>
                <h4 className="text-lg font-bold text-white mt-1 leading-snug">
                  {m.title}
                </h4>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed max-w-xl">
                  {m.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 3 · VISION & MISSION ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Vision */}
          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-900 p-8 md:p-10 rounded-3xl border border-indigo-100 dark:border-indigo-900/40">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">
              {vision?.title || "Our Vision"}
            </h3>
            {(vision?.body
              ? vision.body.split("\n").filter(Boolean)
              : [
                  "To be a globally recognized centre of educational excellence that develops principled, creative, and compassionate leaders who shape the future of their communities and the world.",
                  "We envision a school where every student feels valued, challenged, and inspired to reach their full potential — academically, socially, and emotionally. Irshad graduates will be lifelong learners, critical thinkers, and responsible global citizens.",
                ]
            ).map((paragraph, i) => (
              <p
                key={i}
                className={`text-slate-600 dark:text-slate-400 leading-relaxed${
                  i > 0 ? " mt-3" : ""
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Mission */}
          <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 p-8 md:p-10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">
              {mission?.title || "Our Mission"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {mission?.body ||
                "Irshad International Academy is committed to providing a rigorous, inclusive, and nurturing education that equips students with the knowledge, skills, and character to thrive in an ever-changing world."}
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-slate-600 dark:text-slate-400 text-sm">
              {[
                "Deliver internationally recognized academic programmes of the highest quality.",
                "Foster curiosity, creativity, and critical thinking in every learner.",
                "Build character through ethical leadership, community service, and respect for diversity.",
                "Maintain a safe, supportive, and technology-enhanced learning environment.",
                "Partner with families and the wider community to ensure student success.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ════════ 4 · CORE VALUES ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="What Guides Us"
            title="Our Core Values"
            subtitle={values?.body || "These six principles inform every decision we make — from curriculum design to campus culture."}
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((v, i) => (
              <Card key={i} hoverEffect>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
                    {v.icon}
                  </div>
                  <CardTitle>{v.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {v.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 5 · PRINCIPAL'S MESSAGE ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-4 flex flex-col items-center text-center gap-5">
            <ImagePlaceholder
              label="Dr. Margaret A. Whitfield — Principal portrait photograph"
              aspectRatio="aspect-[3/4]"
              className="max-w-[280px] mx-auto"
              icon={<Users className="w-10 h-10 text-slate-400" />}
            />
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Dr. Margaret A. Whitfield
              </h3>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                Principal & Head of School
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ed.D. Educational Leadership — Columbia University
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-5 text-left">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              From the Principal
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              A Message to Our Community
            </h2>
            <blockquote className="border-l-4 border-amber-500 pl-5 text-slate-600 dark:text-slate-400 leading-relaxed italic">
              &ldquo;At Irshad, we believe that every child is capable of
              extraordinary things. Our role as educators is not merely to
              impart knowledge, but to ignite a passion for lifelong learning.
              We cultivate an environment where curiosity is encouraged,
              creativity is celebrated, and character is paramount.&rdquo;
            </blockquote>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              In my fifteen years as Principal, I have seen first-hand the
              transformative power of a Irshad education. Our students arrive
              curious and leave confident — ready to contribute meaningfully to
              their communities and beyond. I am immensely proud of our
              faculty&rsquo;s dedication, our parents&rsquo; partnership, and,
              above all, the remarkable young people who make this school truly
              exceptional.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              I warmly invite you to visit our campus, attend an open day, and
              discover why so many families choose Irshad Academy. Together,
              we are building a community of scholars, leaders, and global
              citizens.
            </p>
          </div>
        </div>
      </section>

      {/* ════════ 6 · MANAGEMENT / GOVERNANCE ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Leadership"
            title="School Management & Governance"
            subtitle={leadership?.body || "The Board of Governors and senior leadership team ensure strategic direction, financial integrity, and educational quality."}
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {managementTeam.map((m, i) => (
              <Card key={i} hoverEffect className="flex flex-col h-full">
                <ImagePlaceholder
                  label={`${m.name} — ${m.role} portrait`}
                  aspectRatio="aspect-[3/4]"
                  className="rounded-b-none border-0 border-b border-slate-200/60 dark:border-slate-800/80"
                  icon={<Users className="w-8 h-8 text-slate-400" />}
                />
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{m.name}</CardTitle>
                  <CardDescription className="font-semibold text-amber-600 dark:text-amber-400 text-xs">
                    {m.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-grow">
                  {m.bio}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 7 · CAMPUS IMAGE GALLERY ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Campus Gallery
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
                Explore Our Campus
              </h2>
            </div>
            <Link
              href="/gallery"
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 group shrink-0"
            >
              Full Gallery
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:row-span-2">
              <ImagePlaceholder
                label="Main academic block — front entrance and courtyard"
                aspectRatio="aspect-[3/4]"
                className="h-full"
                icon={<Building className="w-10 h-10 text-slate-400" />}
              />
            </div>
            <ImagePlaceholder
              label="School assembly in progress — morning gathering"
              aspectRatio="aspect-video"
              icon={<Users className="w-8 h-8 text-slate-400" />}
            />
            <ImagePlaceholder
              label="Student athletes on athletics track"
              aspectRatio="aspect-video"
            />
            <ImagePlaceholder
              label="Digital library and collaborative study area"
              aspectRatio="aspect-video"
              icon={<BookOpen className="w-8 h-8 text-slate-400" />}
            />
            <ImagePlaceholder
              label="STEM Robotics Lab — students building prototypes"
              aspectRatio="aspect-video"
            />
          </div>
        </div>
      </section>

      {/* ════════ 8 · ACCREDITATIONS ════════ */}
      <section className="py-16 px-6 md:px-8 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            Endorsements
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
            Accreditations & Affiliations
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-10">
            {[
              "International Baccalaureate (IB) Authorized",
              "Cambridge Assessment International Education",
              "Council of International Schools (CIS)",
              "AdvancED / Cognia Accredited",
            ].map((acc, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-xs font-bold tracking-wide uppercase text-slate-600 dark:text-slate-400 shadow-sm"
              >
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                {acc}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
