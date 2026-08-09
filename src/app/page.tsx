import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Award,
  Users,
  ArrowRight,
  Clock,
  MapPin,
  Flame,
  Trophy,
  Star,
  Image as ImageIcon,
  Building,
  Globe,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import {
  getHomeStats,
  getHeroSlides,
  getAnnouncements,
  getEvents,
  getAchievements,
  getFacilities,
  getGalleryImages,
} from "@/lib/content";

/* ─── static fallbacks ──────────────────────────────────── */

const staticStats = [
  { number: "25+", label: "Years of Excellence" },
  { number: "1,200+", label: "Students Enrolled" },
  { number: "100%", label: "University Placement" },
  { number: "15:1", label: "Student–Teacher Ratio" },
  { number: "35+", label: "Nationalities" },
  { number: "40+", label: "Clubs & Activities" },
];

const staticAnnouncements = [
  {
    tag: "Academic",
    tagColor: "text-indigo-600 dark:text-indigo-400",
    title: "Pinecrest Seniors Achieve Top Ranks in National Merit Scholarship",
    excerpt:
      "Fifteen of our graduating seniors have been named semi-finalists in the 2026 National Merit Scholarship program, placing them in the top 1% nationwide.",
    date: "Aug 05, 2026",
    image: null as string | null,
  },
  {
    tag: "Science & Technology",
    tagColor: "text-emerald-600 dark:text-emerald-400",
    title: "Annual Campus Science & Tech Fair — Registration Opens Aug 15",
    excerpt:
      "Individual and team projects in environmental engineering, robotics, and software development are welcome. Grand prizes include college-level lab sponsorships.",
    date: "Aug 02, 2026",
    image: null as string | null,
  },
  {
    tag: "Community",
    tagColor: "text-amber-600 dark:text-amber-400",
    title: "Eco-Ambassadors Launch Biodiversity Audit of Campus Grounds",
    excerpt:
      "Our student-led environmental club begins a semester-long survey of native flora and fauna to inform sustainable landscaping policies.",
    date: "Jul 28, 2026",
    image: null as string | null,
  },
];

const staticEvents = [
  {
    day: "12",
    month: "Aug",
    title: "Parent–Teacher Orientation",
    time: "09:00 AM – 12:00 PM",
    location: "Main Auditorium",
  },
  {
    day: "25",
    month: "Aug",
    title: "Inter-School Sports Gala",
    time: "08:00 AM – 04:00 PM",
    location: "Sports Complex",
  },
  {
    day: "07",
    month: "Sep",
    title: "Autumn Music & Drama Festival",
    time: "06:30 PM – 09:30 PM",
    location: "Fine Arts Center",
  },
];

const staticAchievements = [
  {
    icon: <Trophy className="w-6 h-6 text-amber-500" />,
    title: "National Science Olympiad — Gold Medal",
    description:
      "Grade 11 students secured first place in the chemistry and physics divisions at the 2026 National Science Olympiad.",
  },
  {
    icon: <Award className="w-6 h-6 text-indigo-500" />,
    title: "IB Diploma — 98% Pass Rate",
    description:
      "Our 2025 graduating class achieved a 98% pass rate in the International Baccalaureate Diploma Programme, well above the global average of 80%.",
  },
  {
    icon: <Star className="w-6 h-6 text-emerald-500" />,
    title: "State Swimming Championship — 5 Gold Medals",
    description:
      "The Pinecrest Lizards swim team won five individual gold medals and a team relay silver at the 2026 State Interschool Championships.",
  },
];

const staticFacilities = [
  {
    title: "STEM & Robotics Lab",
    description:
      "3D printers, Arduino stations, and automated workspace benches for hands-on engineering projects.",
    image: null as string | null,
  },
  {
    title: "Digital Library & Media Center",
    description:
      "Over 32,000 volumes plus high-speed computer terminals, private study cabins, and media collaboration spaces.",
    image: null as string | null,
  },
  {
    title: "Olympic Aquatic Center",
    description:
      "A heated, 10-lane semi-olympic swimming pool with diving boards, coaching offices, and safety surveillance.",
    image: null as string | null,
  },
  {
    title: "Performing Arts Auditorium",
    description:
      "A 600-seat theater with professional lighting rigs, digital sound mixing, and backstage dressing suites.",
    image: null as string | null,
  },
];

const staticHero = {
  title: "Nurturing Minds, Inspiring Futures",
  subtitle:
    "Welcome to Pinecrest Academy — where academic rigour, character development, and global citizenship come together. We empower every student to excel, lead, and make a difference.",
  imageUrl: null as string | null,
  ctaLabel: "Apply Now",
  ctaUrl: "/admissions",
};

/* ─── helpers ────────────────────────────────────────────── */

function formatNewsDate(value: string): string {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

const announcementTagColors: Record<string, string> = {
  Academic: "text-indigo-600 dark:text-indigo-400",
  "Science & STEM": "text-emerald-600 dark:text-emerald-400",
  "Science & Technology": "text-emerald-600 dark:text-emerald-400",
  Sports: "text-amber-600 dark:text-amber-400",
  "Arts & Drama": "text-rose-600 dark:text-rose-400",
  Community: "text-amber-600 dark:text-amber-400",
};

function toAnnouncement(item: {
  title: string;
  category: string;
  date: string;
  summary: string;
  image?: string | null;
}): {
  tag: string;
  tagColor: string;
  title: string;
  excerpt: string;
  date: string;
  image: string | null;
} {
  return {
    tag: item.category,
    tagColor: announcementTagColors[item.category] ?? "text-indigo-600 dark:text-indigo-400",
    title: item.title,
    excerpt: item.summary,
    date: formatNewsDate(item.date),
    image: item.image || null,
  };
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toEventCard(item: {
  title: string;
  startDate: string;
  startTime: string;
  endTime: string;
  venue: string;
}): {
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
} {
  const d = new Date(`${item.startDate}T00:00:00`);
  const day = Number.isNaN(d.getTime()) ? String(item.startDate).slice(8, 10) : String(d.getDate());
  const month = Number.isNaN(d.getTime())
    ? String(item.startDate).slice(5, 7)
    : monthNames[d.getMonth()];
  const time =
    item.startTime === item.endTime
      ? item.startTime
      : `${item.startTime} – ${item.endTime}`;
  return { day, month, title: item.title, time, location: item.venue };
}

function achievementIcon(category: string) {
  const c = category.toLowerCase();
  if (/(sport|swim|athletic|championship|medal|game|track|soccer)/.test(c))
    return <Trophy className="w-6 h-6 text-amber-500" />;
  if (/(academic|olympiad|diploma|ib|exam|scholar|merit)/.test(c))
    return <Award className="w-6 h-6 text-indigo-500" />;
  return <Star className="w-6 h-6 text-emerald-500" />;
}

/* ─── page component ────────────────────────────────────── */

export default async function Home() {
  const [
    stats,
    heroSlides,
    announcements,
    events,
    achievements,
    facilities,
    galleryImages,
  ] = await Promise.all([
    getHomeStats(),
    getHeroSlides(),
    getAnnouncements(),
    getEvents(),
    getAchievements(),
    getFacilities(),
    getGalleryImages(),
  ]);

  const hero = heroSlides?.[0] ?? staticHero;
  const heroSubtitle =
    hero.subtitle || staticHero.subtitle;
  const heroImage = hero.imageUrl ?? staticHero.imageUrl;
  const heroCtaLabel = hero.ctaLabel || staticHero.ctaLabel;
  const heroCtaUrl = hero.ctaUrl || staticHero.ctaUrl;

  const statItems =
    stats && stats.length > 0
      ? stats.map((s) => ({ number: s.value, label: s.label }))
      : staticStats;

  const announcementItems =
    announcements && announcements.length > 0
      ? announcements.slice(0, 3).map(toAnnouncement)
      : staticAnnouncements;

  const eventItems =
    events && events.length > 0
      ? events.slice(0, 3).map(toEventCard)
      : staticEvents;

  const achievementItems =
    achievements && achievements.length > 0
      ? achievements.slice(0, 3).map((a) => ({
          icon: achievementIcon(a.category),
          title: a.title,
          description: a.description,
        }))
      : staticAchievements;

  const facilityItems =
    facilities && facilities.length > 0
      ? facilities.slice(0, 4).map((f) => ({
          title: f.title,
          description: f.description,
          image: f.mainImage,
        }))
      : staticFacilities;

  const galleryCaptions =
    galleryImages && galleryImages.length > 0
      ? galleryImages.slice(0, 8).map((g) => g.alt || g.caption || "Campus photograph")
      : [
          "Students in Science Lab",
          "Football Match on Main Pitch",
          "Autumn Drama Rehearsal",
          "Library Study Session",
          "Robotics Club Workshop",
          "School Assembly Morning",
          "Art Exhibition Display",
          "Graduation Ceremony",
        ];

  return (
    <div className="w-full flex flex-col font-sans">
      {/* ════════ 1 · HERO ════════ */}
      <section
        id="hero"
        className="relative bg-slate-950 text-white overflow-hidden py-24 lg:py-32 px-6 md:px-8 border-b border-slate-900"
      >
        {/* radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950/10 to-slate-950 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* left text */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* school identity */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight leading-none text-white">
                  PINECREST
                </span>
                <span className="text-[10px] uppercase font-semibold text-amber-500 tracking-[0.2em] mt-0.5">
                  International Academy
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-5 uppercase tracking-widest">
              Admissions Open for 2026–27
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
              {hero.title || "Nurturing Minds, Inspiring Futures"}
            </h1>

            <p className="text-slate-400 mt-6 text-base md:text-lg leading-relaxed max-w-xl">
              {heroSubtitle}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
              <Link href={heroCtaUrl || "/admissions"}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto justify-center"
                >
                  {heroCtaLabel}
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto justify-center text-white border-slate-700 hover:bg-slate-900"
                >
                  Explore Our Campus
                </Button>
              </Link>
            </div>
          </div>

          {/* right hero image */}
          <div className="lg:col-span-5 w-full">
            <ImagePlaceholder
              label="Pinecrest Main Campus — Front Entrance and Academic Block"
              src={heroImage}
              aspectRatio="aspect-[4/3]"
              className="shadow-2xl shadow-slate-950/60 border-slate-800"
              icon={<Building className="w-12 h-12 text-slate-600" />}
            />
          </div>
        </div>
      </section>

      {/* ════════ 2 · STATISTICS ════════ */}
      <section
        id="stats"
        className="bg-slate-900 text-white py-12 px-6 md:px-8 border-b border-slate-800"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6">
            {statItems.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <span className="text-3xl md:text-4xl font-black text-amber-500 tracking-tight">
                  {s.number}
                </span>
                <span className="text-[11px] md:text-xs font-semibold text-slate-400 uppercase tracking-widest mt-2">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 3 · SCHOOL INTRODUCTION ════════ */}
      <section
        id="introduction"
        className="py-20 lg:py-28 px-6 md:px-8 bg-white dark:bg-slate-950"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-7 flex flex-col gap-5 text-left">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Welcome to Pinecrest
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              A Legacy of Excellence Since 1995
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              For over twenty-five years, Pinecrest International Academy has
              set the standard for holistic education. Our rigorous academic
              programs, combined with a wide range of co-curricular activities,
              develop confident, caring, and creative young people who are
              prepared to succeed in an ever-changing world.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Set on a beautiful 20-acre campus, our school is home to more than
              1,200 students representing 35 nationalities. We offer the
              International Baccalaureate Diploma, Cambridge IGCSE pathways, and
              Advanced Placement courses — all delivered by a faculty of over 100
              passionate educators.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link href="/about">
                <Button variant="primary">
                  Learn More About Us
                </Button>
              </Link>
              <Link href="/facilities">
                <Button
                  variant="outline"
                  leftIcon={<Building className="w-4 h-4" />}
                >
                  Virtual Campus Tour
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <ImagePlaceholder
              label="Aerial view of Pinecrest campus showing academic blocks, sports fields, and gardens"
              aspectRatio="aspect-[4/3]"
              icon={<Globe className="w-10 h-10 text-slate-400" />}
            />
          </div>
        </div>
      </section>

      {/* ════════ 4 · PRINCIPAL'S MESSAGE ════════ */}
      <section
        id="principal"
        className="py-20 lg:py-28 px-6 md:px-8 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          {/* principal photo */}
          <div className="lg:col-span-4 flex flex-col items-center text-center gap-5">
            <ImagePlaceholder
              label="Principal — Portrait photograph"
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

          {/* message */}
          <div className="lg:col-span-8 flex flex-col gap-5 text-left">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Principal&rsquo;s Desk
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              A Message from Our Principal
            </h2>
            <blockquote className="border-l-4 border-amber-500 pl-5 text-slate-600 dark:text-slate-400 leading-relaxed italic">
              &ldquo;At Pinecrest, we believe that every child is capable of
              extraordinary things. Our role as educators is not merely to
              impart knowledge, but to ignite a passion for lifelong learning.
              We cultivate an environment where curiosity is encouraged,
              creativity is celebrated, and character is paramount.&rdquo;
            </blockquote>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Our dedicated team of educators works closely with families to
              ensure that each student receives the support and challenge
              they need to thrive. Whether your child is just beginning their
              educational journey or preparing for university, Pinecrest
              Academy offers a nurturing yet rigorous path forward.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              I warmly invite you to visit our campus, meet our teachers, and
              see first-hand the vibrant learning community we have built
              together.
            </p>
            <div className="mt-2">
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  Schedule a Campus Visit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 5 · CORE VALUES / PILLARS ════════ */}
      <section
        id="values"
        className="py-20 lg:py-28 px-6 md:px-8 bg-white dark:bg-slate-950"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <SectionHeading
            badge="Our Pillars"
            title="The Pinecrest Approach"
            subtitle="We provide a balanced education focused on intellectual growth, physical development, and ethical leadership."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-4">
            {[
              {
                icon: <Award className="w-6 h-6" />,
                color: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
                title: "Academic Excellence",
                desc: "Advanced Placement, IB Diploma, and Cambridge IGCSE pathways taught by experienced, specialist educators — preparing students for the world's top universities.",
                link: "/academics",
                linkColor: "text-indigo-600 dark:text-indigo-400",
              },
              {
                icon: <Flame className="w-6 h-6" />,
                color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
                title: "Holistic Development",
                desc: "Forty-plus clubs, competitive athletics, and performing arts programs ensure every student discovers their unique strengths beyond the classroom.",
                link: "/activities",
                linkColor: "text-amber-600 dark:text-amber-400",
              },
              {
                icon: <Heart className="w-6 h-6" />,
                color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
                title: "Global Citizenship",
                desc: "Community service, multicultural festivals, and exchange programs build empathy, cultural awareness, and the ethical compass to lead responsibly.",
                link: "/about",
                linkColor: "text-emerald-600 dark:text-emerald-400",
              },
            ].map((pillar, i) => (
              <Card key={i}>
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${pillar.color}`}
                  >
                    {pillar.icon}
                  </div>
                  <CardTitle>{pillar.title}</CardTitle>
                  <CardDescription>{pillar.desc}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link
                    href={pillar.link}
                    className={`text-sm font-bold ${pillar.linkColor} inline-flex items-center gap-1.5 group`}
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 6 · FEATURED ANNOUNCEMENTS ════════ */}
      <section
        id="announcements"
        className="py-20 lg:py-28 px-6 md:px-8 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Notice Board
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
                Featured Announcements
              </h2>
            </div>
            <Link
              href="/news"
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 group shrink-0"
            >
              View All News
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {announcementItems.map((a, i) => (
              <Card key={i} className="flex flex-col h-full">
                <ImagePlaceholder
                  label={`${a.title} — article image`}
                  src={a.image}
                  aspectRatio="aspect-video"
                  className="rounded-b-none border-0 border-b border-slate-200/60 dark:border-slate-800/80"
                />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${a.tagColor}`}
                    >
                      {a.tag}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {a.date}
                    </span>
                  </div>
                  <CardTitle className="text-base mt-2 leading-snug">
                    {a.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-grow">
                  {a.excerpt}
                </CardContent>
                <CardFooter>
                  <Link
                    href="/news"
                    className="text-sm font-bold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 group"
                  >
                    Read More
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 7 · FEATURED EVENTS ════════ */}
      <section
        id="events"
        className="py-20 lg:py-28 px-6 md:px-8 bg-white dark:bg-slate-950"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Campus Calendar
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
                Upcoming Events
              </h2>
            </div>
            <Link
              href="/events"
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 group shrink-0"
            >
              Full Calendar
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {eventItems.map((ev, i) => (
              <div
                key={i}
                className="flex gap-5 items-start p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-xl bg-slate-950 dark:bg-slate-800 flex flex-col items-center justify-center text-white shrink-0">
                  <span className="text-xl font-black leading-none">
                    {ev.day}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-amber-500 mt-1">
                    {ev.month}
                  </span>
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {ev.title}
                  </h4>
                  <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      {ev.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      {ev.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 8 · FEATURED ACHIEVEMENTS ════════ */}
      <section
        id="achievements"
        className="py-20 lg:py-28 px-6 md:px-8 bg-slate-950 text-white border-y border-slate-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
              Proud Moments
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-1 tracking-tight">
              Recent Achievements
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievementItems.map((a, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  {a.icon}
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {a.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {a.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 9 · FEATURED FACILITIES ════════ */}
      <section
        id="facilities"
        className="py-20 lg:py-28 px-6 md:px-8 bg-white dark:bg-slate-950"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Our Campus
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
                World-Class Facilities
              </h2>
            </div>
            <Link
              href="/facilities"
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 group shrink-0"
            >
              View All Facilities
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {facilityItems.map((f, i) => (
              <Card key={i} className="flex flex-col h-full">
                <ImagePlaceholder
                  label={`${f.title} — facility photograph`}
                  src={f.image}
                  aspectRatio="aspect-[4/3]"
                  className="rounded-b-none border-0 border-b border-slate-200/60 dark:border-slate-800/80"
                />
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-grow">
                  {f.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 10 · GALLERY PREVIEW ════════ */}
      <section
        id="gallery-preview"
        className="py-20 lg:py-28 px-6 md:px-8 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Campus Snapshots
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
                Life at Pinecrest
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryCaptions.map((caption, i) => (
              <div
                key={i}
                className="group overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/80"
              >
                <ImagePlaceholder
                  label={caption}
                  aspectRatio="aspect-square"
                  icon={
                    <ImageIcon className="w-6 h-6 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 11 · ADMISSIONS CTA ════════ */}
      <section
        id="admissions-cta"
        className="bg-slate-950 text-white py-20 lg:py-28 px-6 md:px-8"
      >
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2">
            <GraduationCap className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Begin Your Child&rsquo;s Journey at Pinecrest
          </h2>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            Applications for the 2026–27 academic year are now open. Schedule a
            campus visit, speak with our admissions counsellors, or submit an
            inquiry online. We look forward to welcoming your family to the
            Pinecrest community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/admissions">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Start Your Application
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-white border-slate-700 hover:bg-slate-900"
              >
                Contact Admissions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
