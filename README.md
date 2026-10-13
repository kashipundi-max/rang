# Next.js Landing Page Template

Premium, production-ready SaaS landing page built with Next.js 15, React 19, and Tailwind CSS 4. Designed for agencies, founders, and marketers who need a polished, conversion-focused experience ready to launch or resell.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Scripts](#project-scripts)
- [Project Structure](#project-structure)
- [Content & Customization](#content--customization)
- [UI Toolkit & Utilities](#ui-toolkit--utilities)
- [Styling & Assets](#styling--assets)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Support](#support)
- [License](#license)

## Features

### Experience Highlights

- **Immersive hero** with floating cards, 3D imagery, and adaptive animations driven by `useDevicePerformance` for smooth rendering on any device.
- **Live analytics dashboard preview** featuring draggable KPI cards, charts built with Recharts, calendar, and table inside an animated glass UI.
- **Scrolling social proof** marquee powered by simple-icons and Framer Motion to spotlight trusted brands automatically.
- **Animated statistics** with CountUp counters and layered lighting effects to reinforce key growth metrics.

### Conversion Sections

- **Filterable pricing grid** (`src/components/home/PricesSectiom`) with category chips, plan highlights, testimonial callouts, and “Contact Sales” CTA.
- **Auto-scrolling testimonials** carousel using Embla with optional manual controls for credibility.
- **Smart FAQ hub** with search, category filters, “show more” expansion, and graceful empty states.
- **Global reach CTA** combining a dynamic world map, contact form, and animated text hover effect to drive leads.

## Tech Stack

- Next.js 15 App Router with React 19 and TypeScript.
- Yarn 4 (node-modules linker) for dependency management (`packageManager` pinned in `package.json`).
- Tailwind CSS 4 with the design system defined via `@theme` in `src/app/globals.css`.
- Framer Motion, @dnd-kit, Embla Carousel, Recharts, dom-to-image, and Tabler Icons for motion, interactivity, data viz, and exports.

## Getting Started

### Prerequisites

- Node.js 18.18 or newer.
- Yarn 4.x (Berry) installed globally (`corepack enable` recommended).

### Installation & Local Development

1. Install dependencies:

   ```bash
   yarn install
   ```

   or, if you prefer npm:

   ```bash
   npm install
   ```

2. Start the development server with Turbopack:

   ```bash
   yarn dev
   ```

   or with npm:

   ```bash
   npm run dev
   ```

3. Visit `http://localhost:3000` to view the site. Updates are hot-reloaded as you edit.

Yarn 4 remains the supported workflow for this template, but npm users can follow the equivalents shown above (pnpm users can mirror the same script names).

## Project Scripts

- `yarn dev` / `npm run dev` – Run Next.js locally with Turbopack for fast refresh.
- `yarn build` / `npm run build` – Create a production build of the app.
- `yarn start` / `npm run start` – Serve the production build locally.
- `yarn lint` / `npm run lint` – Lint the codebase with the configured ESLint rules.

## Project Structure

```
├── public/                      # Static assets, 3D imagery, meta images, fonts
│   └── font/clash-display/      # Clash Display font family used across headings
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Global metadata, layout wrapper, SEO defaults
│   │   └── page.tsx             # Landing page composition (imports all sections)
│   ├── components/
│   │   ├── effects/             # Background lighting, spotlights, particles
│   │   ├── home/                # Section-by-section implementations
│   │   └── shared/              # Header, footer, section header component
│   ├── hooks/                   # Custom hooks (e.g. device performance checks)
│   ├── lib/                     # Shared utilities (`cn` helper)
│   ├── styles/                  # Additional stylesheet modules
│   └── ui/                      # Reusable UI primitives and advanced widgets
├── .yarn/                       # Yarn 4 cache/config (do not delete when using Yarn)
├── next.config.ts               # Next.js configuration
├── postcss.config.mjs           # PostCSS/Tailwind pipeline for Tailwind v4
└── tsconfig.json                # TypeScript compiler settings
```

## Content & Customization

- **Hero experience** – Update copy, CTA text, and metrics in `src/components/home/HeroSection/HeroContent.tsx`; tweak animation thresholds in `HeroSection/index.tsx`.
- **Dashboard data** – Adjust KPI cards, charts, and table content within `src/components/home/HeroSection/Dashboard/Main/` (notably `kpiData.ts`, `AreaChart.tsx`, `Table.tsx`).
- **Features grid** – Modify card titles, descriptions, and images via `src/components/home/FeaturesSection/data.ts`.
- **Pricing plans** – Edit plan tiers, feature categories, and testimonial snippets in `src/components/home/PricesSectiom/data.ts`.
- **Testimonials** – Maintain customer quotes and avatars in `src/components/home/TestimonialsSection/data.ts`.
- **FAQ library** – Update categories and answers in `src/components/home/FaqSection/data.ts`; search logic lives in `FaqSection/index.tsx`.
- **Contact section** – Customize the form fields in `src/components/home/CtaSection/ContactForm.tsx` and update map pins in `src/components/home/CtaSection/points.ts`.
- **Navigation & footer** – Edit menus, social links, and CTA logic in `src/components/shared/layout/header/index.tsx` and `src/components/shared/layout/footer/index.tsx`.

## UI Toolkit & Utilities

- `src/ui/` hosts reusable building blocks like `Button`, `Tabs`, `AnimatedTooltip`, `ComingSoonModal`, `Globe`, and the draggable `WorldMap`.
- `src/components/effects/` provides spotlight lighting, particle layers, and gradient overlays used across sections.
- `src/hooks/useDevicePerformance.ts` detects device capabilities to tone down intensive visuals automatically.
- `src/lib/utils.ts` exports the `cn` helper (clsx + tailwind-merge) for ergonomic class composition.

## Styling & Assets

- Tailwind CSS 4 theme tokens, fonts, and animations are defined inside `src/app/globals.css` using the `@theme` directive.
- Clash Display, DM Sans, and Rethink Sans are preloaded; swap fonts by updating the `@font-face` blocks or Google Fonts imports in `globals.css`.
- Update hero and background imagery in `public/images/`, including the 3D sphere stored as `/images/hero_3d.webp` and the Open Graph image at `/public/meta_image.png`.
- Metadata defaults (title, description, canonical URL) are set in `src/app/layout.tsx`; adjust `NEXT_PUBLIC_SITE_URL` to keep canonical URLs accurate.

## Environment Variables

Create a `.env.local` file (values are read at build time):

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com     # Used for SEO metadata
NEXT_PUBLIC_BUY_URL=https://your-checkout-link    # Optional footer CTA button
```

If `NEXT_PUBLIC_BUY_URL` is omitted, the “Buy This Template” ribbon in the footer is hidden automatically.

## Deployment

- **Vercel (recommended)**: Push the repo, import it into Vercel, and use the default Next.js build command (`yarn build`) and output. Set environment variables in the Vercel dashboard before deploying.
- **Other platforms**: Netlify, AWS Amplify, Render, Railway, and DigitalOcean all support Next.js 15. Use `yarn build` for the build step and `yarn start` (or the platform’s Next.js adapter) to serve the app.
- Remember to add any required environment variables in your hosting provider before triggering the production build.

## Support

- [Next.js Documentation](https://nextjs.org/docs) for framework guides.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) for styling utilities.
- [TypeScript Handbook](https://www.typescriptlang.org/docs) for language reference.

## License

This template is distributed as a commercial product. Review your purchase agreement for permitted usage, redistribution, and resale terms.
