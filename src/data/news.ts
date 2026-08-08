export type NewsCategory =
  | "Academic"
  | "Science & STEM"
  | "Sports"
  | "Arts & Drama"
  | "Community";

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  category: NewsCategory;
  /** ISO date string, e.g. "2026-08-05" */
  date: string;
  author: string;
  /** Short summary for cards and list views */
  summary: string;
  /** Full article body, one paragraph per entry */
  content: string[];
  /** Image placeholder label until admin uploads a real photo */
  image: string;
  featured: boolean;
}

export const newsCategories: NewsCategory[] = [
  "Academic",
  "Science & STEM",
  "Sports",
  "Arts & Drama",
  "Community",
];

/**
 * News & announcements seed data.
 * Swap this module with a Supabase-backed fetcher when the CMS is connected.
 */
export const newsArticles: NewsArticle[] = [
  {
    id: "national-merit-finalists",
    slug: "pinecrest-seniors-achieve-top-ranks-in-national-merit-scholarship",
    title: "Pinecrest Seniors Achieve Top Ranks in National Merit Scholarship",
    category: "Academic",
    date: "2026-08-05",
    author: "Office of the Principal",
    summary:
      "Fifteen of our senior students have been named finalists in the National Merit Scholarship program, placing them in the top 1% nationally.",
    content: [
      "We are thrilled to announce that 15 of our senior students have been named finalists in the National Merit Scholarship program. Their scores place them in the top 1% of candidates nationally, a milestone that reflects years of dedication from students and faculty alike.",
      "The National Merit Scholarship Corporation recognized our finalists for outstanding performance on the PSAT/NMSQT and their rigorous academic record. Each finalist is now eligible for National Merit Scholarships, corporate-sponsored awards, and university-sponsored scholarships.",
      "Our faculty takes immense pride in this achievement. The finalists will be honoured at a special assembly in September, where they will receive certificates and share their journey with younger students. We extend our heartfelt congratulations to all 15 scholars and their families.",
    ],
    image: "Seniors receiving National Merit certificates in the auditorium",
    featured: true,
  },
  {
    id: "science-tech-fair-registration",
    slug: "annual-campus-science-and-tech-fair-2026-registration-opens",
    title: "Annual Campus Science & Tech Fair 2026 Registration Opens",
    category: "Science & STEM",
    date: "2026-08-02",
    author: "Science Department",
    summary:
      "Registration is now open for Pinecrest's largest STEM exhibition of the year, welcoming projects across environmental technology, coding, and engineering.",
    content: [
      "Registration has formally opened for Pinecrest's largest STEM exhibition of the year. The annual Science & Tech Fair invites students from Grades 6 to 12 to present projects spanning environmental technology, computer coding algorithms, and electronics engineering.",
      "Projects will be judged by a panel of industry engineers, university researchers, and Pinecrest science faculty. Grand prizes include college-level laboratory sponsorships and invitations to regional innovation showcases.",
      "All interested students should register through the school learning portal by September 15. Team projects of up to four members are encouraged, and mentors are available in the innovation lab every Thursday afternoon to help refine project ideas.",
    ],
    image: "Students presenting robotics projects at the science fair",
    featured: false,
  },
  {
    id: "eco-biodiversity-audit",
    slug: "eco-ambassadors-launch-campus-biodiversity-audit",
    title: "Eco Ambassadors Launch Campus Biodiversity Audit",
    category: "Community",
    date: "2026-07-28",
    author: "Environmental Club",
    summary:
      "Our student-led Eco Ambassadors have begun a comprehensive audit of campus flora and fauna to guide future sustainability policies.",
    content: [
      "Our student-led Eco Ambassadors group has kicked off a comprehensive audit of campus flora and fauna. The semester-long survey will map native species, identify invasive plants, and recommend additions to our biodiversity policy and garden expansion plans.",
      "Teams of middle and high school students are working with a visiting botanist to record observations, photograph species, and build a living database that future cohorts will continue to update.",
      "The audit will culminate in a public presentation in December, alongside proposals for new green spaces, pollinator gardens, and water-conservation measures. Parents and community members are warmly invited to attend.",
    ],
    image: "Eco Ambassadors surveying the campus garden beds",
    featured: false,
  },
  {
    id: "swimming-five-gold-medals",
    slug: "varsity-swimming-champions-secure-five-gold-medals-in-state-finals",
    title: "Varsity Swimming Champions Secure Five Gold Medals in State Finals",
    category: "Sports",
    date: "2026-07-20",
    author: "Athletics Department",
    summary:
      "The Pinecrest Lizards swim team returned from the state championship with five individual gold medals and a silver relay finish — a school-best record.",
    content: [
      "The Pinecrest Lizards swim team has returned from the secondary schools championship carrying five individual gold medals and a silver team relay finish, marking a school-best record.",
      "The gold-medal performances came in the 100 m freestyle, 200 m freestyle, 100 m breaststroke, 200 m individual medley, and the 50 m butterfly. The team's relay silver was decided in the final leg of the championship race.",
      "Head coach Ricardo Fernandez praised the team's season-long dedication: 'These swimmers trained through winter and spring with remarkable discipline. This record belongs to every member of the squad, not just those on the podium.'",
    ],
    image: "Pinecrest Lizards on the podium with medals",
    featured: false,
  },
  {
    id: "hamlet-set-design",
    slug: "shakespeare-hamlet-production-set-designs-completed-by-arts-class",
    title: "Shakespeare's Hamlet Production Set Designs Completed by Arts Class",
    category: "Arts & Drama",
    date: "2026-07-15",
    author: "Fine Arts Department",
    summary:
      "Final set mockups are complete for this autumn's major stage production, featuring student-designed canvases, automated pulleys, and custom lighting.",
    content: [
      "Final mockups have been assembled for this autumn's major stage performance of Hamlet. The set designs feature student-painted canvases, automated pulley sails, and custom lighting profiles created entirely by the Fine Arts programme.",
      "Over the summer, more than forty students contributed to the production across set construction, costume design, sound engineering, and stage management under the direction of Ms. Helena Rostova.",
      "Tickets for the two-week run will go on sale in October. The production will open with a preview night for families of cast and crew before its public performances.",
    ],
    image: "Hamlet set model and lighting mockup in the fine arts studio",
    featured: false,
  },
  {
    id: "culture-day-announcement",
    slug: "international-culture-day-2026-announced",
    title: "International Culture Day 2026 Announced",
    category: "Community",
    date: "2026-08-08",
    author: "Student Council",
    summary:
      "This year's International Culture Day will celebrate our 35 nationalities with food, music, and performances — registration for booths is open.",
    content: [
      "The Student Council is pleased to announce that International Culture Day 2026 will take place in February, celebrating the 35 nationalities represented across our campus.",
      "Families are invited to register cultural booths featuring food, traditional dress, music, and art from their countries. Performances on the main stage will run throughout the day, alongside a heritage parade in the morning.",
      "Booth registration closes in December. All proceeds from food stalls will support the school's community service partners. We look forward to another vibrant celebration of our global community.",
    ],
    image: "International Culture Day booths and flags on the main lawn",
    featured: false,
  },
];
