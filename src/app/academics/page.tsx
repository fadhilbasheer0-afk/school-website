import React from "react";
import Link from "next/link";
import {
  BookOpen,
  BrainCircuit,
  Landmark,
  Music,
  FlaskConical,
  FileText,
  GraduationCap,
  Calendar,
  Download,
  Code,
  Palette,
  Trophy,
  Calculator,
  Microscope,
  Users,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { getAcademicData } from "@/lib/content";

/* ─── data ──────────────────────────────────────────────── */

const staticGrades = [
  {
    division: "Primary Years",
    grades: "Grades 1 – 5",
    ageRange: "Ages 6 – 11",
    focus: "Foundation & Inquiry",
    description:
      "The Primary Years Programme builds a strong foundation in literacy, numeracy, and scientific inquiry. Learning is child-centred, cross-disciplinary, and deeply engaging — encouraging students to ask questions, explore ideas, and develop a love of learning that will stay with them for life.",
    subjects: [
      "Foundational Mathematics",
      "English Language Arts",
      "Social Studies & Geography",
      "General Science & Nature Studies",
      "Art, Music & Creative Expression",
      "Physical Education & Health",
      "Digital Literacy Basics",
    ],
    color: "border-t-emerald-500",
    tagColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    division: "Middle School",
    grades: "Grades 6 – 8",
    ageRange: "Ages 11 – 14",
    focus: "Exploration & Critical Thinking",
    description:
      "The Middle School programme bridges foundational learning and specialist study. Students are introduced to laboratory sciences, world languages, coding, and structured research projects. This is where intellectual curiosity begins to sharpen into disciplined inquiry.",
    subjects: [
      "Pre-Algebra & Algebra I",
      "Life Science, Chemistry & Physics Basics",
      "World History & Civilisations",
      "Spanish & French Language",
      "Introduction to Coding & STEM Projects",
      "Visual & Performing Arts",
      "Personal Development & Ethics",
    ],
    color: "border-t-amber-500",
    tagColor: "text-amber-600 dark:text-amber-400",
  },
  {
    division: "High School & Pre-University",
    grades: "Grades 9 – 12",
    ageRange: "Ages 14 – 18",
    focus: "Specialisation & Rigour",
    description:
      "Our High School pathway offers both the International Baccalaureate (IB) Diploma and Advanced Placement (AP) courses. Students personalise their curriculum with electives, engage in independent research, and build the academic profile required for top global universities.",
    subjects: [
      "IB/AP Calculus & Statistics",
      "IB/AP Physics, Chemistry & Biology",
      "Global Politics & Economics",
      "English Literature & Rhetoric",
      "AP Computer Science (Java & Python)",
      "Theory of Knowledge (TOK)",
      "Extended Essay & CAS Programme",
    ],
    color: "border-t-indigo-500",
    tagColor: "text-indigo-600 dark:text-indigo-400",
  },
];

const staticDepartments = [
  {
    icon: <Calculator className="w-6 h-6" />,
    name: "Mathematics",
    description:
      "From foundational arithmetic to AP Calculus and IB Mathematics, our department develops logical reasoning, problem-solving, and quantitative literacy at every level.",
    head: "Mr. Jonathan K. Park — M.Sc. Applied Mathematics",
  },
  {
    icon: <Microscope className="w-6 h-6" />,
    name: "Sciences",
    description:
      "Three dedicated laboratories support hands-on learning in biology, chemistry, and physics. Students participate in national and international science olympiads.",
    head: "Dr. Fatima Al-Hassan — Ph.D. Biochemistry",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    name: "Humanities & Languages",
    description:
      "English literature, world history, geography, Spanish, French, and Arabic are taught with a focus on cultural understanding, critical reading, and persuasive communication.",
    head: "Mrs. Clara V. Montague — M.A. English Literature",
  },
  {
    icon: <Code className="w-6 h-6" />,
    name: "Computer Science & Technology",
    description:
      "Courses span digital literacy, web development, AP Computer Science (Java), data science fundamentals, and competitive robotics programming.",
    head: "Mr. Samuel T. Chen — M.S. Computer Science",
  },
  {
    icon: <Palette className="w-6 h-6" />,
    name: "Visual & Performing Arts",
    description:
      "Studio art, graphic design, concert band, orchestra, choir, and theatre arts — our programme nurtures aesthetic sensibility and creative self-expression.",
    head: "Ms. Isabelle Renard — M.F.A. Fine Arts",
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    name: "Physical Education & Athletics",
    description:
      "A comprehensive sports programme covering soccer, swimming, basketball, track & field, tennis, and martial arts alongside health and wellness education.",
    head: "Coach Michael O. Diaz — B.S. Sports Science",
  },
];

const staticCalendarTerms = [
  {
    term: "Term 1 — Autumn",
    dates: "August 18 – December 12, 2026",
    events: [
      "Aug 18 — First day of classes",
      "Sep 07 — Autumn Music & Drama Festival",
      "Oct 05 — STEM Innovation Challenge",
      "Nov 15 — Mid-term examinations begin",
      "Dec 12 — Term 1 ends / Winter break begins",
    ],
  },
  {
    term: "Term 2 — Spring",
    dates: "January 05 – April 10, 2027",
    events: [
      "Jan 05 — Classes resume",
      "Feb 14 — International Culture Day",
      "Mar 01 — Science & Tech Fair",
      "Mar 25 — Spring break (1 week)",
      "Apr 10 — Term 2 ends",
    ],
  },
  {
    term: "Term 3 — Summer",
    dates: "April 21 – June 30, 2027",
    events: [
      "Apr 21 — Classes resume",
      "May 10 — IB / AP examinations begin",
      "Jun 05 — Annual Sports Day",
      "Jun 20 — Final examinations begin",
      "Jun 30 — Graduation & last day of school",
    ],
  },
];

const staticDocuments = [
  {
    title: "School Prospectus 2026–27",
    description:
      "A comprehensive overview of Pinecrest Academy's programmes, facilities, admissions, and fees.",
    fileType: "PDF",
    fileSize: "4.2 MB",
    url: "",
  },
  {
    title: "IB Diploma Programme Guide",
    description:
      "Detailed information on IB subject groups, core requirements, and university recognition.",
    fileType: "PDF",
    fileSize: "2.8 MB",
    url: "",
  },
  {
    title: "Cambridge IGCSE Subject Options",
    description:
      "A list of available IGCSE subjects for Grades 9–10, including prerequisites and assessment formats.",
    fileType: "PDF",
    fileSize: "1.5 MB",
    url: "",
  },
  {
    title: "Academic Calendar 2026–27",
    description:
      "Full-year calendar with term dates, examination periods, holidays, and key school events.",
    fileType: "PDF",
    fileSize: "0.8 MB",
    url: "",
  },
  {
    title: "Student Handbook & Code of Conduct",
    description:
      "Policies on attendance, behaviour expectations, dress code, technology use, and academic integrity.",
    fileType: "PDF",
    fileSize: "1.1 MB",
    url: "",
  },
  {
    title: "Parent Partnership Guide",
    description:
      "How parents can support learning at home, communicate with teachers, and engage with school events.",
    fileType: "PDF",
    fileSize: "0.9 MB",
    url: "",
  },
];

const specialisedElectives = [
  {
    icon: <BrainCircuit className="w-6 h-6 text-amber-400" />,
    title: "Advanced STEM & Robotics",
    description:
      "Weekly hands-on sessions in robotics construction, Arduino/Java programming, IoT sensor design, 3D modelling, and competitive robotics tournaments.",
  },
  {
    icon: <Landmark className="w-6 h-6 text-indigo-400" />,
    title: "Humanities & Model UN",
    description:
      "Global politics simulations, economics case studies, philosophy seminars, historical mock trials, and preparation for national MUN conferences.",
  },
  {
    icon: <Music className="w-6 h-6 text-emerald-400" />,
    title: "Music, Drama & Fine Arts",
    description:
      "Concert band, symphonic orchestra, vocal ensemble, stagecraft, oil painting, digital illustration, and annual showcase performances.",
  },
];

/* ─── page ──────────────────────────────────────────────── */

function departmentIcon(name: string) {
  const n = name.toLowerCase();
  if (/(math)/.test(n)) return <Calculator className="w-6 h-6" />;
  if (/(scien)/.test(n)) return <Microscope className="w-6 h-6" />;
  if (/(human|language|english|history|geograph)/.test(n))
    return <BookOpen className="w-6 h-6" />;
  if (/(computer|techn|ict|digital)/.test(n))
    return <Code className="w-6 h-6" />;
  if (/(art|music|drama|perform)/.test(n))
    return <Palette className="w-6 h-6" />;
  if (/(physical|athletic|sport)/.test(n)) return <Trophy className="w-6 h-6" />;
  return <GraduationCap className="w-6 h-6" />;
}

export default async function Academics() {
  const academic = await getAcademicData();

  const gradeColors = [
    "border-t-emerald-500",
    "border-t-amber-500",
    "border-t-indigo-500",
  ];
  const gradeTagColors = [
    "text-emerald-600 dark:text-emerald-400",
    "text-amber-600 dark:text-amber-400",
    "text-indigo-600 dark:text-indigo-400",
  ];

  const grades =
    academic.classes.length > 0
      ? academic.classes.map((c, i) => ({
          division: c.level,
          grades: c.gradeLabel,
          ageRange: c.ageRange,
          focus: c.level,
          description: c.description,
          subjects: [] as string[],
          color: gradeColors[i % gradeColors.length],
          tagColor: gradeTagColors[i % gradeTagColors.length],
        }))
      : staticGrades;

  const departments =
    academic.departments.length > 0
      ? academic.departments.map((d) => ({
          icon: departmentIcon(d.name),
          name: d.name,
          description: d.description,
          head: "",
        }))
      : staticDepartments;

  const calendarTerms =
    academic.calendar.length > 0
      ? academic.calendar.map((c) => ({
          term: c.title,
          dates: c.dates,
          events: [] as string[],
        }))
      : staticCalendarTerms;

  const downloadableDocuments =
    academic.documents.length > 0
      ? academic.documents.map((d) => ({
          title: d.title,
          description: d.description,
          fileType: d.category || "PDF",
          fileSize: "",
          url: d.fileUrl,
        }))
      : staticDocuments;

  return (
    <div className="w-full flex flex-col font-sans">
      {/* ════════ 1 · ACADEMIC INTRODUCTION ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Learning Pathways"
            title="Academic Programmes"
            subtitle="Empowering students through tailored curricula, advanced inquiry, and globally recognized certifications."
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            <div className="lg:col-span-7 flex flex-col items-start gap-5">
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                A Curriculum Driven by Rigour and Passion
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                At Pinecrest Academy, we design learning experiences that go far
                beyond textbooks. Our academic programme integrates the
                International Baccalaureate framework, Cambridge IGCSE pathways,
                and Advanced Placement courses — delivered by a faculty of over
                100 specialist educators holding advanced degrees from
                world-leading universities.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We believe in differentiated instruction, project-based learning,
                and individual academic mentoring. Whether a student excels in
                the sciences, the humanities, or the creative arts, our programme
                provides the depth and flexibility needed to nurture every
                talent.
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <Link href="/admissions">
                  <Button variant="secondary">Apply for Admission</Button>
                </Link>
                <Button
                  variant="outline"
                  leftIcon={<FileText className="w-4 h-4" />}
                >
                  Download Prospectus
                </Button>
              </div>
            </div>
            <div className="lg:col-span-5 w-full">
              <ImagePlaceholder
                label="Students conducting physics experiments in the senior science laboratory"
                aspectRatio="aspect-[4/3]"
                icon={<FlaskConical className="w-12 h-12 text-slate-400" />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 2 · CLASSES / GRADES ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Education Levels"
            title="Academic Divisions"
            subtitle="Three interconnected divisions ensure a seamless educational journey from early years through pre-university."
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {grades.map((g, i) => (
              <Card
                key={i}
                className={`flex flex-col h-full border-t-4 ${g.color}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold tracking-wider uppercase ${g.tagColor}`}
                    >
                      {g.grades}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {g.ageRange}
                    </span>
                  </div>
                  <CardTitle className="mt-2">{g.division}</CardTitle>
                  <CardDescription className="font-semibold text-amber-600 dark:text-amber-400 text-xs mt-1">
                    Focus: {g.focus}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {g.description}
                  </p>
                  {g.subjects.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Core Subjects:
                      </span>
                      <ul className="flex flex-col gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {g.subjects.map((s, j) => (
                          <li key={j} className="flex items-start gap-2 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href="/contact" className="w-full">
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      Enquire About {g.division}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 3 · CURRICULUM OVERVIEW ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-5">
            <ImagePlaceholder
              label="IB Diploma students working on Extended Essay research in the library"
              aspectRatio="aspect-[4/3]"
              icon={<GraduationCap className="w-10 h-10 text-slate-400" />}
            />
          </div>
          <div className="lg:col-span-7 flex flex-col gap-5 text-left">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Curriculum Framework
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              Internationally Recognized Pathways
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Pinecrest Academy offers three internationally recognized
              curriculum frameworks, allowing families to choose the pathway
              that best suits their child&rsquo;s goals and learning style:
            </p>
            <div className="flex flex-col gap-4">
              {[
                {
                  label: "International Baccalaureate (IB) Diploma",
                  detail:
                    "A rigorous two-year programme (Grades 11–12) emphasising breadth, depth, and critical thinking across six subject groups, plus the core components of TOK, Extended Essay, and Creativity, Activity, Service.",
                },
                {
                  label: "Cambridge IGCSE",
                  detail:
                    "Offered in Grades 9–10, providing a globally respected qualification with flexible subject choices and externally assessed examinations.",
                },
                {
                  label: "Advanced Placement (AP)",
                  detail:
                    "College-level courses in subjects such as Calculus, Biology, Computer Science, and English Literature — with examinations recognized for university credit worldwide.",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80"
                >
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {c.label}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {c.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 4 · DEPARTMENTS ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Academic Departments"
            title="Our Subject Departments"
            subtitle="Each department is led by a specialist head of department who ensures curriculum quality, faculty mentoring, and student outcomes."
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((d, i) => (
              <Card key={i} hoverEffect className="flex flex-col h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                    {d.icon}
                  </div>
                  <CardTitle>{d.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col gap-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {d.description}
                  </p>
                  {d.head ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                      {d.head}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 5 · SPECIALISED ELECTIVES ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
              Niche Curriculum
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-1 tracking-tight">
              Specialised Electives
            </h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed text-sm">
              High-tier modules that complement core academics and foster
              creativity, technical mastery, and social insight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {specialisedElectives.map((el, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  {el.icon}
                </div>
                <h4 className="text-lg font-bold text-white leading-snug">
                  {el.title}
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {el.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 6 · ACADEMIC CALENDAR ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="School Year"
            title="Academic Calendar 2026–27"
            subtitle="Our academic year is divided into three terms with scheduled examinations, cultural events, and holiday breaks."
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {calendarTerms.map((t, i) => (
              <Card key={i} className="flex flex-col h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <CardTitle className="text-base">{t.term}</CardTitle>
                      <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {t.dates}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  {t.events.length > 0 ? (
                    <ul className="flex flex-col gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                      {t.events.map((ev, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                          <span className="leading-relaxed">{ev}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Dates: {t.dates}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 7 · ACADEMIC INFORMATION ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">
          <div className="lg:col-span-7 flex flex-col gap-5 text-left">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Academic Policies
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              Additional Academic Information
            </h2>

            <div className="flex flex-col gap-4">
              {[
                {
                  heading: "Assessment & Reporting",
                  body: "Students receive detailed progress reports at the end of each term, including subject grades, teacher comments, effort indicators, and next-step recommendations. Parent–teacher conferences are held twice yearly.",
                },
                {
                  heading: "Academic Support & Tutoring",
                  body: "Individual and small-group tutoring is available in all core subjects. Our Student Support Services team provides learning assessments, individualized education plans, and exam accommodations for students who need them.",
                },
                {
                  heading: "Homework & Study Policy",
                  body: "Homework is purposeful and age-appropriate: Primary students receive 20–30 minutes daily; Middle School 45–60 minutes; High School 1–2 hours. All assignments are posted on the school's online learning portal.",
                },
                {
                  heading: "University & Career Guidance",
                  body: "From Grade 9 onward, our dedicated university counsellors guide students through course selection, standardized testing, personal statement writing, and application strategies for universities worldwide.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80"
                >
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                    {item.heading}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <ImagePlaceholder
              label="Teachers discussing student progress during a faculty review meeting"
              aspectRatio="aspect-[4/3]"
              icon={<Users className="w-10 h-10 text-slate-400" />}
            />
          </div>
        </div>
      </section>

      {/* ════════ 8 · DOWNLOADABLE DOCUMENTS ════════ */}
      <section className="py-20 lg:py-28 px-6 md:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Resources"
            title="Downloadable Documents"
            subtitle="Access key school publications, academic guides, and policy documents in PDF format."
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloadableDocuments.map((doc, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>{doc.fileType}</span>
                    {doc.fileSize ? (
                      <>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  {doc.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-grow">
                  {doc.description}
                </p>
                {doc.url ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download {doc.fileType}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="mt-auto inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download {doc.fileType}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
