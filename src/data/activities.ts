export type ActivityCategory =
  | "sports"
  | "arts"
  | "cultural"
  | "clubs"
  | "competitions"
  | "awards"
  | "student-achievements"
  | "school-achievements";

export interface ActivityItem {
  id: string;
  title: string;
  category: ActivityCategory;
  description: string;
  /** Date or year, e.g. "2026" or "Weekly · Mon & Wed" */
  date: string;
  /** Image placeholder label */
  image: string;
}

export const activityCategories: ActivityCategory[] = [
  "sports",
  "arts",
  "cultural",
  "clubs",
  "competitions",
  "awards",
  "student-achievements",
  "school-achievements",
];

export const activityCategoryLabels: Record<ActivityCategory, string> = {
  sports: "Sports",
  arts: "Arts",
  cultural: "Cultural Activities",
  clubs: "Clubs",
  competitions: "Competitions",
  awards: "Awards",
  "student-achievements": "Student Achievements",
  "school-achievements": "School Achievements",
};

/**
 * Co-curricular & achievement seed data.
 * Swap this module with a Supabase-backed fetcher when the CMS is connected.
 */
export const activities: ActivityItem[] = [
  /* ── Sports ─────────────────────────────────────────────── */
  {
    id: "varsity-soccer-track",
    title: "Varsity Soccer & Track Squad",
    category: "sports",
    description:
      "High-performance training in tactics, stamina, and team coordination leading into regional high school leagues and state championships.",
    date: "Seasonal · 2026",
    image: "Varsity soccer match on the main pitch",
  },
  {
    id: "lizard-swim-team",
    title: "Pinecrest Lizard Swim Team",
    category: "sports",
    description:
      "Our competitive swim squad trains daily at the aquatic center and competes in relay and individual events across the state circuit.",
    date: "Seasonal · 2026",
    image: "Swim team relay warm-up at the aquatic center",
  },
  {
    id: "basketball-volleyball",
    title: "Basketball & Volleyball Leagues",
    category: "sports",
    description:
      "Junior and varsity teams compete in inter-school leagues, developing sportsmanship, resilience, and fast-decision court skills.",
    date: "Seasonal · 2026",
    image: "Varsity basketball practice on the maple court",
  },

  /* ── Arts ───────────────────────────────────────────────── */
  {
    id: "symphonic-orchestra",
    title: "Pinecrest Symphonic Orchestra",
    category: "arts",
    description:
      "Open to brass, woodwind, string, and percussion musicians. Weekly rehearsals lead to our winter and spring campus galas.",
    date: "Weekly · Mon & Wed",
    image: "Symphonic orchestra rehearsal on stage",
  },
  {
    id: "theatre-drama",
    title: "Theatre, Drama & Set Design",
    category: "arts",
    description:
      "Voice coaching, script work, choreography, and scenic painting combine in two full-scale productions staged each academic year.",
    date: "Term Productions · 2026",
    image: "Drama rehearsal in the performing arts studio",
  },
  {
    id: "visual-arts-exhibition",
    title: "Annual Visual Arts Exhibition",
    category: "arts",
    description:
      "A rotating gallery of student painting, ceramics, and digital design culminates in an end-of-year public exhibition and portfolio showcase.",
    date: "May 2026",
    image: "Student artwork on the gallery exhibition wall",
  },

  /* ── Cultural Activities ────────────────────────────────── */
  {
    id: "international-culture-day",
    title: "International Culture Day",
    category: "cultural",
    description:
      "A vibrant celebration where 35 nationalities share food, music, and tradition through booths, performances, and dress parades.",
    date: "February 2026",
    image: "Cultural booths and flags during International Culture Day",
  },
  {
    id: "heritage-festival",
    title: "Heritage & Language Festival",
    category: "cultural",
    description:
      "Students present heritage projects, poetry, and language showcases in Spanish, French, Mandarin, and Arabic to the whole school community.",
    date: "March 2026",
    image: "Students presenting heritage projects in the auditorium",
  },
  {
    id: "exchange-programme",
    title: "International Exchange Programme",
    category: "cultural",
    description:
      "Annual student exchanges with partner schools in Europe and Asia broaden perspectives and build lasting cross-cultural friendships.",
    date: "Annually · 2026",
    image: "Exchange students welcomed at the school entrance",
  },

  /* ── Clubs ──────────────────────────────────────────────── */
  {
    id: "model-united-nations",
    title: "Model United Nations (MUN)",
    category: "clubs",
    description:
      "Simulating debates on international crises, diplomacy, and global affairs while building public speaking, negotiation, and drafting skills.",
    date: "Weekly · Tue & Thu",
    image: "MUN delegates debating in committee session",
  },
  {
    id: "competitive-robotics",
    title: "Competitive Robotics League",
    category: "clubs",
    description:
      "Drafting VEX/FTC robot designs, programming sensors in Java, and attending state and national robotics tournaments.",
    date: "Weekly · Wed & Fri",
    image: "Robotics club testing a VEX prototype",
  },
  {
    id: "eco-ambassadors",
    title: "Eco-Ambassadors Alliance",
    category: "clubs",
    description:
      "Managing campus recycling, community garden beds, biodiversity reports, and student-led environmental awareness forums.",
    date: "Weekly · Tue",
    image: "Eco-Ambassadors tending the campus garden",
  },
  {
    id: "chess-club",
    title: "Chess & Strategy Club",
    category: "clubs",
    description:
      "Weekly coaching in openings, tactics, and endgames, with students progressing to regional scholastic chess tournaments.",
    date: "Weekly · Thu",
    image: "Chess club tournament round",
  },

  /* ── Competitions ───────────────────────────────────────── */
  {
    id: "science-olympiad",
    title: "National Science Olympiad",
    category: "competitions",
    description:
      "Pinecrest teams represented the region across chemistry, physics, and biology divisions of the 2026 National Science Olympiad.",
    date: "2026",
    image: "Students at the science olympiad competition arena",
  },
  {
    id: "robotics-tournament",
    title: "Regional Robotics Tournament",
    category: "competitions",
    description:
      "Our FTC robotics alliance advanced through league play to the regional finals, ranking among the top ten alliances.",
    date: "2026",
    image: "Robotics alliance on the tournament field",
  },
  {
    id: "math-olympiad",
    title: "International Math Olympiad Selection",
    category: "competitions",
    description:
      "Top mathematics students sat national selection rounds for the International Mathematical Olympiad training squad.",
    date: "2025",
    image: "Students attempting olympiad problems in the exam hall",
  },

  /* ── Awards ─────────────────────────────────────────────── */
  {
    id: "national-merit-award",
    title: "National Merit Scholarship Program",
    category: "awards",
    description:
      "Fifteen graduating seniors were named semifinalists in the National Merit Scholarship Program — the top 1% nationally.",
    date: "2026",
    image: "Award ceremony at the school auditorium",
  },
  {
    id: "founders-award",
    title: "Founders' Award for Service",
    category: "awards",
    description:
      "Annual recognition presented to students who demonstrate exceptional service, leadership, and commitment to the school community.",
    date: "Annual · 2026",
    image: "Founders' Award presentation at assembly",
  },

  /* ── Student Achievements ───────────────────────────────── */
  {
    id: "swim-gold-medals",
    title: "Five Gold Medals — State Swimming",
    category: "student-achievements",
    description:
      "Individual athletes took five gold medals and a team relay silver at the 2026 State Interschool Swimming Championships.",
    date: "2026",
    image: "Student swimmers with medals on the podium",
  },
  {
    id: "art-portfolio-selected",
    title: "Art Portfolio Selected for National Showcase",
    category: "student-achievements",
    description:
      "Two senior portfolios were selected for the national young artists showcase, with one receiving a rising-talent commendation.",
    date: "2026",
    image: "Selected artwork displayed at the national showcase",
  },

  /* ── School Achievements ────────────────────────────────── */
  {
    id: "ib-pass-rate",
    title: "IB Diploma — 98% Pass Rate",
    category: "school-achievements",
    description:
      "The 2025 graduating class achieved a 98% pass rate in the IB Diploma Programme, well above the global average of 80%.",
    date: "2025",
    image: "IB graduates celebrating at the diploma ceremony",
  },
  {
    id: "cognia-accreditation",
    title: "AdvancED / Cognia Re-Accreditation",
    category: "school-achievements",
    description:
      "Pinecrest earned a full-term re-accreditation from Cognia following a rigorous external review of academics, governance, and facilities.",
    date: "2025",
    image: "Accreditation review team on the campus tour",
  },
];
