export type EventCategory =
  | "Academic"
  | "Sports"
  | "Arts & Culture"
  | "Community";

export interface SchoolEvent {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  description: string;
  /** ISO date string, e.g. "2026-08-12" */
  startDate: string;
  /** 24-hour start time, e.g. "09:00" */
  startTime: string;
  /** 24-hour end time, e.g. "12:00" */
  endTime: string;
  venue: string;
  /** Image placeholder label until admin uploads a real photo */
  image: string;
}

export const eventCategories: EventCategory[] = [
  "Academic",
  "Sports",
  "Arts & Culture",
  "Community",
];

/**
 * Events seed data. Swap this module with a Supabase-backed fetcher when the
 * CMS is connected. Upcoming/past grouping is computed at render time.
 */
export const events: SchoolEvent[] = [
  {
    id: "parent-teacher-orientation",
    slug: "parent-teacher-orientation-seminar",
    title: "Parent–Teacher Orientation Seminar",
    category: "Academic",
    description:
      "An introduction to the upcoming academic syllabus, policies, school management structure, and tutoring resources. Attendance is recommended for new parents.",
    startDate: "2026-08-12",
    startTime: "09:00",
    endTime: "12:00",
    venue: "Main Campus Assembly Hall",
    image: "Parents gathered in the assembly hall for orientation",
  },
  {
    id: "inter-school-sports-gala",
    slug: "annual-inter-school-sports-gala",
    title: "Annual Inter-School Sports Gala",
    category: "Sports",
    description:
      "The school hosts eight regional high schools competing in track athletics, 50 m swimming relays, basketball leagues, and tennis brackets. Come support the students!",
    startDate: "2026-08-25",
    startTime: "08:00",
    endTime: "16:00",
    venue: "Sports Track & Complex",
    image: "Athletes competing at the inter-school sports gala",
  },
  {
    id: "autumn-music-drama-festival",
    slug: "autumn-music-and-drama-festival",
    title: "Autumn Music & Drama Festival",
    category: "Arts & Culture",
    description:
      "Features orchestral performances, concert band assemblies, oil painting displays, and a one-act play adaptation by our drama students.",
    startDate: "2026-09-07",
    startTime: "18:30",
    endTime: "21:30",
    venue: "Centennial Fine Arts Center",
    image: "Orchestra performing on stage at the arts festival",
  },
  {
    id: "eco-clean-air-rally",
    slug: "eco-ambassadors-clean-air-community-rally",
    title: "Eco Ambassadors Clean-Air Community Rally",
    category: "Community",
    description:
      "Volunteers gather to distribute air-quality monitoring maps, plant native biodiversity shrubs, and host workshops on organic garden composting.",
    startDate: "2026-09-18",
    startTime: "10:30",
    endTime: "13:30",
    venue: "Grand Green Gardens & Neighborhoods",
    image: "Volunteers planting shrubs at the community rally",
  },
  {
    id: "stem-robotics-challenge",
    slug: "stem-and-robotics-innovation-challenge",
    title: "STEM & Robotics Innovation Challenge",
    category: "Academic",
    description:
      "High school teams compete to solve automated sorting maze challenges using custom-programmed Arduino and Java assemblies.",
    startDate: "2026-10-05",
    startTime: "09:00",
    endTime: "17:00",
    venue: "Technology Sandbox Hall B",
    image: "Robotics teams competing in the innovation challenge",
  },
  {
    id: "spring-fete",
    slug: "annual-spring-fete-and-alumni-reunion",
    title: "Annual Spring Fête & Alumni Reunion",
    category: "Community",
    description:
      "A campus-wide celebration with student performances, stalls, and an alumni reunion that brings the school community together.",
    startDate: "2026-04-18",
    startTime: "11:00",
    endTime: "16:00",
    venue: "Main Campus Quadrangle",
    image: "Families enjoying the spring fête on the quadrangle",
  },
  {
    id: "science-fair",
    slug: "annual-science-and-tech-fair",
    title: "Annual Science & Tech Fair",
    category: "Academic",
    description:
      "Students in Grades 6–12 present research and engineering projects to a panel of judges from industry and academia.",
    startDate: "2026-03-01",
    startTime: "09:00",
    endTime: "14:00",
    venue: "STEM & Innovation Hub",
    image: "Students presenting science projects to judges",
  },
  {
    id: "state-swim-championship",
    slug: "state-interschool-swimming-championships",
    title: "State Interschool Swimming Championships",
    category: "Sports",
    description:
      "The school swim team competed in the state finals, securing five gold medals and a relay silver — a school-best result.",
    startDate: "2026-02-07",
    startTime: "07:30",
    endTime: "15:00",
    venue: "Olympic Aquatic Center",
    image: "Swim team racing in the state championship finals",
  },
];
