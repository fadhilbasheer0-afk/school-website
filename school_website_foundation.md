# Irshad Academy Website Foundation

We have successfully initialized a modern school website using **Next.js App Router**, **React**, **TypeScript**, and **Tailwind CSS**. Below is the architectural outline and design systems.

---

## 🎨 Color and Typography System

To present an elite corporate school feel, we implemented:
- **Primary Base**: Navy/Slate Blue (Tailwind `slate-950` / `slate-900`) representing authority and academic heritage.
- **Accent Highlight**: Warm Gold/Amber (`amber-500` / `amber-600`) representing achievement and high value.
- **Support Colors**: Clean Emerald (`emerald-600`) for community aspects, and Indigo (`indigo-600`) for technical focus areas.
- **Dark Mode Support**: Seamless toggle transitions between dark mode interfaces and clean card shadows.

---

## 🏗️ Reusable Architecture Components

Each component has been coded in TypeScript and optimized for component reuse:

1. **Button (`Button.tsx`)**
   - Direct support for `primary`, `secondary`, `outline`, `ghost`, and `danger` modes.
   - Sizing parameters (`sm`, `md`, `lg`).
   - Integrated state animations such as `isLoading` spins.

2. **Card (`Card.tsx`)**
   - Clean division modules: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`.
   - Card elevations feature subtle borders and micro-hover translation shifts (`translate-y-1`).

3. **SectionHeading (`SectionHeading.tsx`)**
   - Consists of a custom alignment tag, a highlight badge, a main title, a customizable description, and a double-color accent line.

4. **Forms (`Form.tsx`)**
   - Modular elements exporting `Input`, `Textarea`, `Select`, and a layout `FormField` wrapper displaying labels, helpers, and error flags.

5. **Feedback States (`FeedbackStates.tsx`)**
   - Custom templates representing `LoadingState` spinners, `EmptyState` inbox blocks, and `ErrorState` retry widgets.

6. **Image placeholders (`ImagePlaceholder.tsx`)**
   - **Complies strictly with the Image Rule**: Renders clean vector boxes showing descriptive metadata captions (e.g. "Main library halls") so no fake or stock photographs are loaded before CMS integration.

---

## 📂 Web App Folders & Pages Structure

All pages have been compiled and verified dynamically:

```text
src/
├── app/
│   ├── about/            # History, Mission, timeline milestones
│   ├── academics/        # Primary, Middle, High school curricula
│   ├── activities/       # Student assemblies, athletic squads
│   ├── admissions/       # Inquiry processing, scholarship cards
│   ├── contact/          # Department numbers, location map
│   ├── events/           # Chronological assembly calendar
│   ├── facilities/       # Robotics Hub, library Commons, pool
│   ├── faculty/          # Teacher lists, degrees, departments
│   ├── gallery/          # Media albums grid
│   ├── news/             # Academic notice board
│   ├── error.tsx         # Global error boundary handler
│   ├── globals.css       # Tailwind 4.0 themes imports
│   ├── layout.tsx        # Common headers and footers loader
│   ├── loading.tsx       # Loading transition spinner
│   ├── not-found.tsx     # Custom 404 Lost-on-Campus page
│   └── page.tsx          # Campus Hero, stats, news columns
└── components/
    ├── layout/
    │   ├── Header.tsx    # sticky navbar with mobile drawer
    │   └── Footer.tsx    # Site directory and contact details
    └── ui/
        ├── Button.tsx
        ├── Card.tsx
        ├── SectionHeading.tsx
        ├── Form.tsx
        ├── FeedbackStates.tsx
        └── ImagePlaceholder.tsx
```

---

## ⚡ CMS & Supabase Readiness

The forms on `/admissions` and `/contact` are built with local React hook states and simulated delays (`await new Promise`). To connect Supabase:
1. Create a Supabase project at [Supabase Console](https://supabase.com).
2. Set up two database tables:
   - `admissions_inquiries`: Columns `id`, `parent_name`, `email`, `phone`, `student_name`, `grade_level`, `message`, `created_at`.
   - `contact_messages`: Columns `id`, `name`, `email`, `subject`, `message`, `created_at`.
3. Install `@supabase/supabase-js`, initialize client, and submit form states directly to the database.
4. Replace hardcoded mock lists with static or server-side fetch requests directly referencing database tables.
