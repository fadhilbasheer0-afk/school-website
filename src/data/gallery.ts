export type GalleryCategory = "Academics" | "Athletics" | "Arts" | "Campus Life";

export interface GalleryImage {
  id: string;
  /**
   * Public Supabase Storage URL. `null` until an administrator uploads a
   * photo — the UI renders a neutral placeholder in that case.
   */
  src: string | null;
  /** Alt text + caption shown under the photo */
  alt: string;
  caption?: string;
  category: GalleryCategory;
  /** Slug of the album this photo belongs to (CMS photos only). */
  albumSlug?: string;
  order: number;
}

export const galleryCategories: GalleryCategory[] = [
  "Academics",
  "Athletics",
  "Arts",
  "Campus Life",
];

/**
 * Gallery seed data. Real images will come from Supabase Storage; `src` is
 * kept `null` so the renderer always falls back to placeholders until the
 * CMS is connected.
 */
export const galleryImages: GalleryImage[] = [
  {
    id: "graduation-ceremony",
    src: null,
    alt: "Centennial Graduation Ceremony",
    caption: "Seniors receiving their certifications under main hall sails.",
    category: "Campus Life",
    order: 1,
  },
  {
    id: "stem-league-finals",
    src: null,
    alt: "Annual STEM League Finals",
    caption: "High school robotics coding assembly presenting board results.",
    category: "Academics",
    order: 2,
  },
  {
    id: "eco-garden-planting",
    src: null,
    alt: "Eco Garden Planting Day",
    caption: "Middle school science classes planting autumn flowers.",
    category: "Campus Life",
    order: 3,
  },
  {
    id: "swimming-gala",
    src: null,
    alt: "Inter-School Swimming Gala",
    caption: "Students representing the school in the 100 m freestyle championship.",
    category: "Athletics",
    order: 4,
  },
  {
    id: "autumn-drama-production",
    src: null,
    alt: "Autumn Drama Production",
    caption: "Main cast performing Shakespeare's Hamlet on the main stage.",
    category: "Arts",
    order: 5,
  },
  {
    id: "chemistry-lab-research",
    src: null,
    alt: "Chemistry Laboratory Research",
    caption: "Advanced chemistry students researching organic solvent properties.",
    category: "Academics",
    order: 6,
  },
  {
    id: "vocal-choir-showcase",
    src: null,
    alt: "Vocal Choir Winter Showcase",
    caption: "Choir ensembles performing classical carols on stage.",
    category: "Arts",
    order: 7,
  },
  {
    id: "football-championship",
    src: null,
    alt: "Varsity Football Championship Win",
    caption: "Students holding the championship trophy on the soccer turf.",
    category: "Athletics",
    order: 8,
  },
  {
    id: "library-study-session",
    src: null,
    alt: "Library Study Session",
    caption: "Students collaborating in the Centennial Library study cabins.",
    category: "Campus Life",
    order: 9,
  },
  {
    id: "robotics-workshop",
    src: null,
    alt: "Robotics Club Workshop",
    caption: "Robotics club members testing a VEX prototype in the innovation lab.",
    category: "Academics",
    order: 10,
  },
  {
    id: "art-exhibition",
    src: null,
    alt: "Art Exhibition Display",
    caption: "The end-of-year visual arts exhibition in the campus gallery.",
    category: "Arts",
    order: 11,
  },
  {
    id: "sports-day",
    src: null,
    alt: "Annual Sports Day",
    caption: "The athletics track during the annual inter-house sports day.",
    category: "Athletics",
    order: 12,
  },
];
