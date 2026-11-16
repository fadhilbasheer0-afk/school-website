import {
  School,
  BookOpen,
  Monitor,
  FlaskConical,
  Trees,
  Bus,
  Trophy,
  Waves,
  Music,
  Palette,
  type LucideIcon,
} from "lucide-react";

export type FacilityCategory =
  | "Academic"
  | "Sports"
  | "Arts"
  | "Common"
  | "Outdoor";

export interface Facility {
  id: string;
  title: string;
  category: FacilityCategory;
  description: string;
  icon: LucideIcon;
  /** Key features rendered as a checklist */
  features: string[];
  /** Main image placeholder label */
  mainImage: string;
  /** Additional image placeholder labels */
  galleryImages: string[];
}

/**
 * Campus facilities seed data.
 * Swap this module with a Supabase-backed fetcher when the CMS is connected.
 */
export const facilities: Facility[] = [
  {
    id: "smart-classrooms",
    title: "Smart Classrooms",
    category: "Academic",
    description:
      "Modern, air-conditioned classrooms equipped with interactive smart boards, flexible seating layouts, and acoustic panels that support focused, collaborative learning at every grade level.",
    icon: School,
    features: [
      "Interactive smart boards in every room",
      "Ergonomic, reconfigurable furniture",
      "Integrated audio-visual & Wi-Fi",
      "Air conditioning & air filtration",
    ],
    mainImage: "Grade 4 classroom in a lively inquiry lesson — front view",
    galleryImages: [
      "Classroom group work stations",
      "Digital learning corner",
      "Science display wall",
    ],
  },
  {
    id: "library",
    title: "Centennial Library & Digital Commons",
    category: "Academic",
    description:
      "Housing 32,000 reference volumes along with high-speed research terminals, quiet study cabins, and media collaboration lounges — the intellectual heart of the campus.",
    icon: BookOpen,
    features: [
      "32,000+ print & digital resources",
      "Private study cabins",
      "Makerspace & media lounge",
      "Catalogued e-library access",
    ],
    mainImage: "Centennial Library main reading hall",
    galleryImages: [
      "Digital research terminals",
      "Makerspace workbenches",
      "Quiet study cabins",
    ],
  },
  {
    id: "computer-lab",
    title: "Computer & Innovation Lab",
    category: "Academic",
    description:
      "A dedicated coding and design facility with 40 modern workstations, 3D printers, and circuit-bench kits for robotics, programming, and digital design classes.",
    icon: Monitor,
    features: [
      "40 high-performance workstations",
      "3D printers & CNC tools",
      "Robotics & Arduino kits",
      "Secure, supervised network",
    ],
    mainImage: "Computer lab during an AP Computer Science class",
    galleryImages: [
      "3D printing corner",
      "Robotics assembly benches",
      "Coding workshop session",
    ],
  },
  {
    id: "science-lab",
    title: "Science Laboratories",
    category: "Academic",
    description:
      "Three fully equipped laboratories for physics, chemistry, and biology with fume hoods, microscopes, and safety-first protocols for practical, hands-on investigation.",
    icon: FlaskConical,
    features: [
      "Dedicated physics, chemistry & biology labs",
      "Fume hoods & safety showers",
      "Digital microscopes & sensors",
      "100% lab-safety compliance",
    ],
    mainImage: "Students conducting a chemistry titration experiment",
    galleryImages: [
      "Biology microscopy stations",
      "Physics optics benches",
      "Safety equipment station",
    ],
  },
  {
    id: "playground",
    title: "Playground & Outdoor Learning",
    category: "Outdoor",
    description:
      "Shaded play areas, climbing structures, and garden learning beds where younger students develop gross motor skills, teamwork, and a love of the outdoors.",
    icon: Trees,
    features: [
      "Shaded, age-appropriate play zones",
      "Climbing frames & swings",
      "Community garden beds",
      "All-weather safety surfacing",
    ],
    mainImage: "Primary playground with climbing structures",
    galleryImages: [
      "Community garden beds",
      "Outdoor classroom pavilion",
      "Recess play session",
    ],
  },
  {
    id: "transportation",
    title: "School Transportation Fleet",
    category: "Common",
    description:
      "A GPS-tracked fleet of modern school buses serving 40+ routes with trained drivers, seat-belt enforcement, and a live parent-tracking app for peace of mind.",
    icon: Bus,
    features: [
      "GPS-tracked, camera-equipped buses",
      "40+ safe route coverage",
      "Trained & vetted drivers",
      "Live parent tracking app",
    ],
    mainImage: "School buses lined up at the main gate",
    galleryImages: [
      "Bus boarding supervision",
      "Fleet dispatch & maintenance bay",
      "Route map display",
    ],
  },
  {
    id: "multisport-arena",
    title: "Multisport Arena & Athletic Track",
    category: "Sports",
    description:
      "An all-weather athletic complex featuring an artificial-grass soccer pitch, maple-court basketball and volleyball floors, and a regulation running track.",
    icon: Trophy,
    features: [
      "Regulation 400 m running track",
      "Artificial-grass soccer pitch",
      "Maple hardwood courts",
      "Floodlit evening training",
    ],
    mainImage: "Multisport arena during a varsity soccer match",
    galleryImages: [
      "Athletics track sprint event",
      "Basketball court warm-up",
      "Floodlit evening practice",
    ],
  },
  {
    id: "aquatic-center",
    title: "Olympic-Standard Aquatic Center",
    category: "Sports",
    description:
      "A heated, 10-lane covered swimming pool with diving boards, changing suites, and round-the-clock safety surveillance for lessons, squads, and competitions.",
    icon: Waves,
    features: [
      "10-lane heated competition pool",
      "Diving boards & starting blocks",
      "Changing & coaching suites",
      "24/7 lifeguard surveillance",
    ],
    mainImage: "Aquatic center competition pool",
    galleryImages: [
      "Swim team training lane",
      "Diving practice session",
      "Spectator gallery",
    ],
  },
  {
    id: "auditorium",
    title: "Performing Arts Auditorium",
    category: "Arts",
    description:
      "A 600-seat theatre with engineered acoustics, digital sound mixing, professional stage lighting, and backstage dressing suites for assemblies, concerts, and productions.",
    icon: Music,
    features: [
      "600-seat tiered auditorium",
      "Professional stage lighting",
      "Digital sound mixing console",
      "Backstage dressing suites",
    ],
    mainImage: "Performing Arts Auditorium during a school production",
    galleryImages: [
      "Stage lighting rig",
      "Orchestra rehearsal on stage",
      "Backstage dressing suites",
    ],
  },
  {
    id: "art-studio",
    title: "Visual Fine Arts Studio",
    category: "Arts",
    description:
      "Bright, naturally lit workspaces for painting, sculpture, ceramics, and graphic design — including potter's wheels, firing kilns, and a rotating student gallery.",
    icon: Palette,
    features: [
      "Natural-light painting bays",
      "Potter's wheels & firing kilns",
      "Graphic design workstations",
      "Rotating student exhibition wall",
    ],
    mainImage: "Visual Fine Arts Studio painting session",
    galleryImages: [
      "Sculpture & ceramics corner",
      "Graphic design workstations",
      "Student exhibition wall",
    ],
  },
];
