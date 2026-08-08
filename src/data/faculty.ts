export type FacultyType = "leadership" | "faculty";

export type FacultyDepartment =
  | "Leadership"
  | "STEM"
  | "Humanities"
  | "Languages"
  | "Arts"
  | "Athletics";

export interface FacultyMember {
  id: string;
  name: string;
  /** Designation / job title */
  role: string;
  department: FacultyDepartment;
  /** Highest qualification */
  education: string;
  experience: string;
  /** Short professional biography */
  bio: string;
  /** Optional contact details (admin-managed later) */
  email?: string;
  phone?: string;
  type: FacultyType;
}

/**
 * Faculty directory seed data.
 * Swap this module with a Supabase-backed fetcher when the CMS is connected.
 */
export const facultyMembers: FacultyMember[] = [
  {
    id: "elizabeth-vance",
    name: "Dr. Elizabeth Vance",
    role: "School Principal",
    department: "Leadership",
    education: "Ph.D. in Educational Leadership (Harvard)",
    experience: "20+ Years in Education",
    bio: "Dr. Vance has spent over two decades shaping learning environments that balance academic rigour with student well-being. She leads Pinecrest's whole-school strategy, safeguarding culture, and the professional growth of every educator on campus.",
    email: "e.vance@pinecrestacademy.edu",
    phone: "+1 (800) 555-0199",
    type: "leadership",
  },
  {
    id: "marcus-aurelius",
    name: "Marcus Aurelius, M.Ed.",
    role: "Director of Admissions",
    department: "Leadership",
    education: "M.Ed. in Secondary School Management (Oxford)",
    experience: "15 Years Admin Experience",
    bio: "Marcus oversees the entire admissions journey — from first enquiry to enrolment day. His team guides families through campus tours, scholarship assessments, and placement interviews with warmth and transparency.",
    email: "m.aurelius@pinecrestacademy.edu",
    phone: "+1 (800) 555-0198",
    type: "leadership",
  },
  {
    id: "alan-chen",
    name: "Prof. Alan Chen",
    role: "Head of Science Department",
    department: "STEM",
    education: "M.S. in Physics (MIT)",
    experience: "12 Years Teaching Experience",
    bio: "Prof. Chen leads the science faculty across three specialist laboratories. He champions hands-on, inquiry-driven lessons and has mentored dozens of students to national science olympiad medals.",
    email: "a.chen@pinecrestacademy.edu",
    type: "faculty",
  },
  {
    id: "sarah-jenkins",
    name: "Sarah Jenkins",
    role: "Advanced Mathematics Instructor",
    department: "STEM",
    education: "B.S. in Applied Math (Stanford)",
    experience: "8 Years Teaching Experience",
    bio: "Sarah makes abstract mathematics tangible for her students. She runs the school's Math Olympiad programme and coaches senior students through AP Calculus and IB Mathematics Analysis.",
    email: "s.jenkins@pinecrestacademy.edu",
    type: "faculty",
  },
  {
    id: "david-oconnor",
    name: "David O'Connor",
    role: "AP European History & Civics Teacher",
    department: "Humanities",
    education: "M.A. in History (Trinity College Dublin)",
    experience: "14 Years Teaching Experience",
    bio: "A passionate historian, David brings primary sources, debate, and civic engagement into every lesson. He also coaches the Model United Nations delegation.",
    email: "d.oconnor@pinecrestacademy.edu",
    type: "faculty",
  },
  {
    id: "aisha-bello",
    name: "Ms. Aisha Bello",
    role: "English Literature & Rhetoric",
    department: "Humanities",
    education: "M.A. in English Literature (University of Lagos)",
    experience: "9 Years Teaching Experience",
    bio: "Aisha inspires a lifelong love of reading through a rich mix of classic and contemporary literature. She advises the school literary magazine and the debating society.",
    email: "a.bello@pinecrestacademy.edu",
    type: "faculty",
  },
  {
    id: "li-wei",
    name: "Li Wei",
    role: "Mandarin & Asian Culture Coordinator",
    department: "Languages",
    education: "B.A. in Linguistics (Beijing Normal)",
    experience: "10 Years Teaching Experience",
    bio: "Li Wei leads the Mandarin programme and cultural exchange partnerships with schools in East Asia, bringing language learning to life through music, festivals, and pen-pal projects.",
    email: "l.wei@pinecrestacademy.edu",
    type: "faculty",
  },
  {
    id: "helena-rostova",
    name: "Helena Rostova",
    role: "Director of Performing Arts",
    department: "Arts",
    education: "Master of Fine Arts in Theatre Direction (Juilliard)",
    experience: "11 Years Teaching Experience",
    bio: "Helena directs the annual theatre productions and the symphonic orchestra season. Under her leadership, Pinecrest students regularly take home awards at regional arts festivals.",
    email: "h.rostova@pinecrestacademy.edu",
    type: "faculty",
  },
  {
    id: "yuki-tanaka",
    name: "Ms. Yuki Tanaka",
    role: "Visual Arts Instructor",
    department: "Arts",
    education: "M.F.A. in Studio Art (Tokyo University of the Arts)",
    experience: "7 Years Teaching Experience",
    bio: "Yuki runs the painting and design studios, mentoring students through portfolio preparation for art college. Her exhibitions programme turns the campus gallery into a living gallery.",
    email: "y.tanaka@pinecrestacademy.edu",
    type: "faculty",
  },
  {
    id: "robert-miller",
    name: "Robert Miller",
    role: "Design Technology & Coding Coach",
    department: "STEM",
    education: "B.Eng. in Computer Systems (Georgia Tech)",
    experience: "6 Years Teaching Experience",
    bio: "Robert coaches the competitive robotics league and teaches design technology from Grade 6 upward. He is a firm believer that making, breaking, and rebuilding is how real learning happens.",
    email: "r.miller@pinecrestacademy.edu",
    type: "faculty",
  },
  {
    id: "ricardo-fernandez",
    name: "Coach Ricardo Fernandez",
    role: "Head of Physical Education & Athletics",
    department: "Athletics",
    education: "B.S. in Sports Science (University of Seville)",
    experience: "13 Years Coaching Experience",
    bio: "Ricardo heads the athletics department and the varsity sports squads. He builds teams that value discipline, sportsmanship, and effort above all else — and results follow.",
    email: "r.fernandez@pinecrestacademy.edu",
    phone: "+1 (800) 555-0197",
    type: "faculty",
  },
];

/** Distinct departments used to build filter controls. */
export const facultyDepartments: FacultyDepartment[] = [
  "Leadership",
  "STEM",
  "Humanities",
  "Languages",
  "Arts",
  "Athletics",
];
