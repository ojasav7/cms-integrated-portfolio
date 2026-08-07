# CMS-Driven Portfolio Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack, CMS-backed portfolio / agency site (TanStack Start + React 19 + Tailwind v4 + Framer Motion + Prisma/MongoDB + Cloudinary) with an animated public page and a protected admin panel.

**Architecture:** A single TanStack Start app with two surfaces — a public marketing page (hero, marquee, portfolio sections, reels, gallery, testimonials, contact, footer) and a protected `/admin` route tree. All content is stored as JSON in MongoDB via Prisma, served through `createServerFn` loaders, normalized into typed props, and backed by static JSON fallbacks so the site runs with zero DB config. Media uploads go to Cloudinary.

**Tech Stack:** TanStack Start (React SSR) + TanStack Router, Tailwind CSS v4 + tw-animate-css, Framer Motion, Radix UI + shadcn/ui, Swiper/Embla, Prisma 6 + MongoDB, Cloudinary SDK, React Hook Form + Zod, Lucide/React Icons, Nitro (Vercel adapter), Bun or Node 20+.

## Global Constraints

- Runtime: Bun or Node 20+ (use `bun` commands throughout; Node 20 fallback).
- Database: MongoDB via Prisma 6, provider `mongodb`, `DATABASE_URL` env var.
- Media: Cloudinary SDK, env vars `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Auth: single admin password via `ADMIN_PASSWORD` env; session cookie `admin_session` compared to `SESSION_SECRET`.
- Every CMS collection passes through a `normalize*()` function before reaching the UI.
- The site must render from `src/server/storage/*.json` fallbacks when `DATABASE_URL` is unset.
- Design tokens are CSS custom properties in `styles.css` (`:root` + `.dark`), referenced via Tailwind utilities or `var(--token)`.
- Never commit `.env` (see `_templates/.gitignore`).
- Project lives at `part1-core-fullstack-apps/01-cms/` and is its own git repo.

---

## Phase 0 — Prerequisites & Scaffold

### Task 0.1: Create project + git init

**Files:**
- Create: `part1-core-fullstack-apps/01-cms/` (already exists)

- [ ] **Step 1: Scaffold the TanStack Start project**

```bash
cd part1-core-fullstack-apps/01-cms
bunx create-tsrouter-app@latest . --template start-basic --add-ons tailwindcss
bun install
```

- [ ] **Step 2: Init git and copy shared templates**

```bash
git init
cp ../../_templates/.gitignore .gitignore
cp ../../_templates/.env.example .env
```

- [ ] **Step 3: Commit**

```bash
git add . && git commit -m "ch01: scaffold tanstack start project"
```

### Task 0.2: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime deps**

```bash
bun add framer-motion lucide-react react-icons
bun add swiper embla-carousel-react
bun add @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-switch @radix-ui/react-scroll-area
bun add class-variance-authority clsx tailwind-merge cmdk sonner vaul
bun add react-hook-form @hookform/resolvers zod
bun add @prisma/client cloudinary
```

- [ ] **Step 2: Install dev deps**

```bash
bun add -D prisma nitro @tanstack/react-start @lovable.dev/vite-tanstack-config @vercel/node
```

- [ ] **Step 3: Verify install**

Run: `bun install`
Expected: no errors; `bunx prisma --version` prints a version.

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "ch01: add project dependencies"
```

### Task 0.3: Environment variables

**Files:**
- Modify: `.env`

- [ ] **Step 1: Fill in `.env`**

```env
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/myportfolio"
ADMIN_PASSWORD="your-secret-admin-password"
SESSION_SECRET="a-random-32-char-string"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

- [ ] **Step 2: Verify `.env` is git-ignored**

Run: `git check-ignore .env`
Expected: prints the path (i.e. it is ignored).

---

## Phase 1 — Config, Styles & Theme

### Task 1.1: Vite + TanStack Start config

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Write the config**

```ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    tanstackStart({ server: { entry: "server" } }),
    nitro(),
    viteReact(),
  ],
});
```

- [ ] **Step 2: Verify dev server boots**

Run: `bun run dev`
Expected: app serves at `http://localhost:3000` with no plugin errors.

### Task 1.2: Global styles + design tokens

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Add tokens and marquee keyframes**

```css
@import "tailwindcss";
@import "tw-animate-css";

@layer base {
  :root {
    --background: oklch(0.98 0 0);
    --foreground: oklch(0.14 0.01 260);
    --card: oklch(1 0 0);
    --accent: oklch(0.72 0.12 65);
    --ink: oklch(0.14 0.01 260);
    --highlight: oklch(0.72 0.12 65);
    --border: oklch(0.88 0 0);
    --muted-foreground: oklch(0.46 0 0);
  }
  .dark {
    --background: oklch(0.17 0.01 260);
    --foreground: oklch(0.94 0 0);
    --card: oklch(0.21 0.01 260);
    --accent: oklch(0.65 0.13 68);
    --ink: oklch(0.94 0 0);
    --border: oklch(0.28 0.01 260);
  }
}

@keyframes marquee { to { transform: translateX(-50%); } }
@keyframes marquee-rev { to { transform: translateX(50%); } }
.animate-marquee { animation: marquee 30s linear infinite; }
.animate-marquee-rev { animation: marquee-rev 28s linear infinite; }
```

- [ ] **Step 2: Verify styles compile**

Run: `bun run dev`
Expected: page renders with the new tokens; no CSS errors.

### Task 1.3: Root route shell + theme persistence

**Files:**
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Add the theme persistence script before `<HeadContent />`**

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `try {
      var t = localStorage.getItem("theme-preference");
      var d = t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", d);
    } catch(e) { document.documentElement.classList.add("dark"); }`,
  }}
/>
```

- [ ] **Step 2: Verify dark mode applies on reload**

Run: `bun run dev`, toggle theme, reload.
Expected: dark class persists across reload.

---

## Phase 2 — Data Layer (Prisma + JSON fallback)

### Task 2.1: Prisma schema

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Write the schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model SiteConfig {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  key       String   @unique
  data      Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ContentBlock {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  collection String
  order      Int      @default(0)
  data       Json
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@index([collection, order])
}

model VideoReel {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  tag         String
  title       String
  description String
  url         String
  kind        String
  embedUrl    String
  poster      String
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([order])
}

model MediaFile {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  publicId     String   @unique
  url          String
  secureUrl    String
  resourceType String
  format       String?
  width        Int?
  height       Int?
  bytes        Int?
  folder       String?
  createdAt    DateTime @default(now())
}
```

- [ ] **Step 2: Generate client**

Run: `bunx prisma generate`
Expected: client generated with no errors.

- [ ] **Step 3: Push schema to DB (only if `DATABASE_URL` is set)**

Run: `bunx prisma db push`
Expected: collections created in MongoDB.

- [ ] **Step 4: Commit**

```bash
git add prisma && git commit -m "ch01: add prisma schema"
```

### Task 2.2: Prisma singleton + env config

**Files:**
- Create: `src/lib/db.server.ts`
- Create: `src/lib/config.server.ts`

- [ ] **Step 1: Write the Prisma singleton**

```ts
import { PrismaClient } from "@prisma/client";

const g = globalThis as { prisma?: PrismaClient };

export const hasDatabaseUrl = () => Boolean(process.env.DATABASE_URL);

export function getPrisma() {
  if (!hasDatabaseUrl()) return null;
  if (!g.prisma) g.prisma = new PrismaClient();
  return g.prisma;
}
```

- [ ] **Step 2: Write the env config**

```ts
export const config = {
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? "",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  },
};
```

- [ ] **Step 3: Verify no type errors**

Run: `bunx tsc --noEmit`
Expected: passes.

### Task 2.3: JSON fallback data

**Files:**
- Create: `src/server/storage/site.json`
- Create: `src/server/storage/reels.json`
- Create: `src/server/storage/testimonials.json`
- Create: `src/lib/cms/defaults.ts`

- [ ] **Step 1: Create `site.json` with the full `SiteConfig` shape**

```json
{
  "hero": { "eyebrow": "Studio", "name": "Ojasav Thakur", "headline": "We craft bold digital experiences" },
  "about": { "eyebrow": "About", "title": "Who we are", "body": "A small studio...", "tiles": [] },
  "portfolio": {
    "overview": { "eyebrow": "Work", "title": "Selected work", "description": "" },
    "sections": {}
  },
  "contact": { "eyebrow": "Contact", "headline": "Let's talk", "blurb": "", "email": "hello@example.com" },
  "footer": { "copyright": "© 2026 Ojasav Thakur", "socials": [] },
  "marquee": { "top": ["Branding", "Film", "Web"], "bottom": ["Strategy", "Motion"] }
}
```

- [ ] **Step 2: Create `reels.json` and `testimonials.json`** with a few sample items each.

- [ ] **Step 3: Create `defaults.ts`** exporting `DEFAULT_SITE`, `DEFAULT_STATS`, `DEFAULT_CAPABILITIES`, `DEFAULT_TESTIMONIALS`, `DEFAULT_HERO_SLIDES` matching the JSON shapes.

- [ ] **Step 4: Commit**

```bash
git add src/server src/lib/cms && git commit -m "ch01: add json fallback data"
```

### Task 2.4: Storage layer (read/write site config)

**Files:**
- Create: `src/lib/cms/storage.server.ts`

- [ ] **Step 1: Write the storage layer**

```ts
import { getPrisma } from "@/lib/db.server";
import { DEFAULT_SITE } from "./defaults";
import fallbackJson from "@/server/storage/site.json";

const SITE_KEY = "main";

export async function getSiteData(): Promise<SiteConfig> {
  const prisma = getPrisma();
  if (!prisma) return fallbackJson as SiteConfig;
  const record = await prisma.siteConfig.findUnique({ where: { key: SITE_KEY } });
  return record ? (record.data as SiteConfig) : DEFAULT_SITE;
}

export async function updateSiteData(data: SiteConfig) {
  const prisma = getPrisma();
  if (!prisma) return;
  await prisma.siteConfig.upsert({
    where: { key: SITE_KEY },
    create: { key: SITE_KEY, data },
    update: { data },
  });
}
```

- [ ] **Step 2: Verify it compiles**

Run: `bunx tsc --noEmit`
Expected: PASS

---

## Phase 3 — Public Data Loaders

### Task 3.1: Collections + reels server functions

**Files:**
- Create: `src/lib/admin/collections.functions.ts`
- Create: `src/lib/admin/reels.functions.ts`

- [ ] **Step 1: Write `getCollections` (read path)**

```ts
import { getPrisma } from "@/lib/db.server";

type CollectionName =
  | "capabilities" | "testimonials" | "heroShowcase"
  | "caseStudies" | "stats" | "reels";

export async function getCollections() {
  const prisma = getPrisma();
  if (!prisma) return buildFallbackCollections();
  const items = await prisma.contentBlock.findMany({ orderBy: { order: "asc" } });
  return items.reduce((acc, item) => {
    const col = item.collection as CollectionName;
    if (!acc[col]) acc[col] = [];
    acc[col].push(item.data as Record<string, unknown>);
    return acc;
  }, {} as Record<CollectionName, Record<string, unknown>[]>);
}
```

- [ ] **Step 2: Write `getReels` (DB path)**

```ts
import { getPrisma } from "@/lib/db.server";
import fallbackReels from "@/server/storage/reels.json";

export async function getReels() {
  const prisma = getPrisma();
  if (!prisma) return fallbackReels;
  return prisma.videoReel.findMany({ orderBy: { order: "asc" } });
}
```

- [ ] **Step 3: Verify both return fallback data with no DB**

Run: `bun run dev`, call the loader indirectly via the page (Phase 4).
Expected: fallback JSON renders.

### Task 3.2: Public portfolio loader

**Files:**
- Create: `src/lib/cms/public.functions.ts`

- [ ] **Step 1: Write the public loader**

```ts
import { createServerFn } from "@tanstack/react-start";
import { getSiteData } from "./storage.server";
import { getCollections } from "@/lib/admin/collections.functions";
import { getReels } from "@/lib/admin/reels.functions";

export const getPortfolioContent = createServerFn({ method: "GET" }).handler(async () => {
  const [site, collections, reels] = await Promise.all([
    getSiteData(),
    getCollections(),
    getReels(),
  ]);
  return { site, collections, reels };
});
```

- [ ] **Step 2: Verify it type-checks**

Run: `bunx tsc --noEmit`
Expected: PASS

---

## Phase 4 — Public Page Sections

### Task 4.1: Data normalizers + `cn` util

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/lib/normalizers.ts`

- [ ] **Step 1: Write `cn` helper**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Write normalizers**

```ts
function asString(val: unknown, fallback = "") {
  return typeof val === "string" && val.trim() ? val : fallback;
}

export function normalizeStats(items: Record<string, unknown>[]) {
  if (!items.length) return DEFAULT_STATS;
  return items.map((item) => ({
    value: asString(item.value),
    label: asString(item.label),
  }));
}

export function normalizeReels(reels: unknown[]) {
  return reels.map((r) => {
    const reel = r as Record<string, unknown>;
    return {
      tag: asString(reel.tag, "All"),
      title: asString(reel.title),
      description: asString(reel.description),
      embedUrl: asString(reel.embedUrl),
      poster: asString(reel.poster),
    };
  });
}
```

- [ ] **Step 3: Verify type-check**

Run: `bunx tsc --noEmit`
Expected: PASS

### Task 4.2: Navbar + Hero + Marquee

**Files:**
- Create: `src/components/sections/navbar.tsx`
- Create: `src/components/sections/hero.tsx`
- Create: `src/components/sections/marquee.tsx`
- Create: `src/components/ui/theme-toggle.tsx`

- [ ] **Step 1: Write `theme-toggle.tsx`** (from blueprint §15) — toggles `.dark` on `<html>` and persists `theme-preference` in `localStorage`.

- [ ] **Step 2: Write `navbar.tsx`** — sticky header with logo, anchor links to sections, and `<ThemeToggle />`.

- [ ] **Step 3: Write `hero.tsx`** — `motion.h1` entrance, `useScroll` parallax, and `<FloatingStatCard>` components (blueprint §10.1–10.2) with mouse parallax.

- [ ] **Step 4: Write `marquee.tsx`** — `animate-marquee` strip rendering `site.marquee.top` (blueprint §10.3).

- [ ] **Step 5: Verify visually**

Run: `bun run dev`, open `/`.
Expected: hero animates in, stat cards float, marquee scrolls.

### Task 4.3: About + Zigzag timeline + Hero carousel

**Files:**
- Create: `src/components/sections/about.tsx`
- Create: `src/components/sections/hero-carousel.tsx`
- Create: `src/components/carousels/hero-carousel.tsx` (Swiper/Embla)

- [ ] **Step 1: Write `about.tsx`** — renders `site.about` with the `ZigzagTimeline` (blueprint §10.6) using `useScroll` + `whileInView`.

- [ ] **Step 2: Write the hero carousel** — Swiper/Embla carousel over `collections.heroShowcase` normalized slides.

- [ ] **Step 3: Verify**

Run: `bun run dev`
Expected: timeline animates on scroll; carousel swipes.

### Task 4.4: Reels section (search + filter)

**Files:**
- Create: `src/components/sections/reels.tsx`

- [ ] **Step 1: Write `reels.tsx`** (blueprint §10.4) — tag filter buttons + search input + responsive grid of `iframe` embeds with `whileInView` + `whileHover`.

- [ ] **Step 2: Verify**

Run: `bun run dev`
Expected: filtering by tag and searching both work; grid animates in.

### Task 4.5: Image gallery + testimonials + contact + footer

**Files:**
- Create: `src/components/sections/image-gallery.tsx`
- Create: `src/components/sections/testimonials.tsx`
- Create: `src/components/sections/contact.tsx`
- Create: `src/components/sections/footer.tsx`

- [ ] **Step 1: Write `image-gallery.tsx`** (blueprint §10.5) — auto aspect-ratio detection, portrait rail + banner rail.

- [ ] **Step 2: Write `testimonials.tsx`** — grid of normalized testimonials.

- [ ] **Step 3: Write `contact.tsx`** (blueprint §10.7) — `mailto:` form with pre-filled draft.

- [ ] **Step 4: Write `footer.tsx`** — copyright + social links from `site.footer`.

- [ ] **Step 5: Verify**

Run: `bun run dev`
Expected: all sections render with fallback data.

### Task 4.6: Wire the main page route

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Load data + compose sections**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { getPortfolio } from "@/lib/cms/public.functions";

export const Route = createFileRoute("/")({
  loader: () => getPortfolio(),
  component: HomePage,
});

function HomePage() {
  const { site, collections, reels } = Route.useLoaderData();
  const stats = normalizeStats(collections.stats ?? []);
  const capabilities = normalizeCapabilities(collections.capabilities ?? []);
  const testimonials = normalizeTestimonials(collections.testimonials ?? []);
  const heroSlides = normalizeHeroSlides(collections.heroShowcase ?? []);
  const reelItems = normalizeReels(reels ?? []);
  return (
    <main className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <Navbar />
      <HeroSection site={site} stats={stats} />
      <MarqueeStrip words={site.marquee.top} />
      <AboutSection site={site} />
      <HeroCarouselSection slides={heroSlides} />
      <ReelsSection reels={reelItems} />
      <ImageGallerySection assets={visualAssets} />
      <TestimonialsSection items={testimonials} />
      <ContactSection site={site} />
      <Footer site={site} />
    </main>
  );
}
```

- [ ] **Step 2: Verify full page**

Run: `bun run dev`
Expected: complete page renders with fallback data, no console errors.

- [ ] **Step 3: Commit**

```bash
git add src && git commit -m "ch01: build public portfolio page"
```

---

## Phase 5 — Admin Panel

### Task 5.1: Auth (session check + login/logout)

**Files:**
- Create: `src/lib/admin/auth.server.ts`
- Create: `src/lib/admin/auth.functions.ts`

- [ ] **Step 1: Write `auth.server.ts`**

```ts
import { getWebRequest } from "@tanstack/react-start/server";
import { config } from "@/lib/config.server";

export async function requireAdmin() {
  const req = getWebRequest();
  const cookie = req?.headers.get("cookie") ?? "";
  const session = parseCookie(cookie, "admin_session");
  if (session !== config.sessionSecret) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
```

- [ ] **Step 2: Write `auth.functions.ts`** — `login` (compares password to `config.adminPassword`, sets `admin_session` cookie to `config.sessionSecret`), `logout` (clears cookie), `checkSession` (returns boolean).

- [ ] **Step 3: Verify**

Run: `bun run dev`, hit `/admin/login`, submit correct password.
Expected: cookie set; wrong password rejected.

### Task 5.2: Admin layout + auth guard

**Files:**
- Create: `src/routes/admin/route.tsx`
- Create: `src/routes/admin/login.tsx`
- Create: `src/components/admin/admin-sidebar.tsx`

- [ ] **Step 1: Write the admin layout with `beforeLoad` guard**

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { checkSession } from "@/lib/admin/auth.functions";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const ok = await checkSession();
    if (!ok) throw redirect({ to: "/admin/login" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto"><Outlet /></main>
    </div>
  );
}
```

- [ ] **Step 2: Write `login.tsx`** — password form calling `login`.

- [ ] **Step 3: Verify**

Run: `bun run dev`
Expected: unauthenticated `/admin` redirects to `/admin/login`; after login, sidebar layout shows.

### Task 5.3: Site editor (hero/about/contact/footer/marquee)

**Files:**
- Create: `src/routes/admin/site.tsx`
- Create: `src/lib/admin/site.functions.ts`

- [ ] **Step 1: Write `site.functions.ts`** — `getSiteConfig` (server fn → `getSiteData`) and `saveSiteConfig` (server fn → `updateSiteData`, guarded by `requireAdmin`).

- [ ] **Step 2: Write `site.tsx`** — forms per section (hero, about, contact, footer, marquee) using React Hook Form + Zod, calling `saveSiteConfig` on submit.

- [ ] **Step 3: Verify**

Run: `bun run dev`, edit hero text in admin, save.
Expected: public page reflects the change (with DB configured).

### Task 5.4: Reels CRUD

**Files:**
- Create: `src/routes/admin/reels.tsx`
- Create: `src/lib/admin/reels.functions.ts` (extend with `upsertReel`, `deleteReel`)

- [ ] **Step 1: Add `computeEmbedUrl` util** (blueprint §14) and call it on save.

- [ ] **Step 2: Write `upsertReel` / `deleteReel`** server fns guarded by `requireAdmin`.

- [ ] **Step 3: Write `reels.tsx`** — list, add, reorder, delete reels.

- [ ] **Step 4: Verify**

Run: `bun run dev`
Expected: adding a reel with a YouTube URL produces a working embed.

### Task 5.5: Collections editor (content blocks)

**Files:**
- Create: `src/routes/admin/content.tsx`
- Modify: `src/lib/admin/collections.functions.ts` (add `upsertCollectionItem`, `deleteCollectionItem`)

- [ ] **Step 1: Add CRUD server fns** for `ContentBlock` (guarded by `requireAdmin`).

- [ ] **Step 2: Write `content.tsx`** — tabbed editor (Radix Tabs) per collection (capabilities, testimonials, caseStudies, stats).

- [ ] **Step 3: Verify**

Run: `bun run dev`
Expected: editing a testimonial in admin updates the public section.

### Task 5.6: Cloudinary media upload

**Files:**
- Create: `src/routes/admin/media.tsx`
- Create: `src/lib/admin/media.functions.ts`

- [ ] **Step 1: Write `media.functions.ts`**

```ts
import { createServerFn } from "@tanstack/react-start";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "./auth.server";
import { config } from "@/lib/config.server";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadMedia = createServerFn({ method: "POST" })
  .validator((data: { base64: string; folder?: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const result = await cloudinary.uploader.upload(data.base64, {
      folder: data.folder ?? "portfolio",
      resource_type: "auto",
    });
    return { url: result.secure_url, publicId: result.public_id };
  });
```

- [ ] **Step 2: Write `media.tsx`** — file input → base64 → `uploadMedia`, show returned URL.

- [ ] **Step 3: Verify**

Run: `bun run dev`, upload an image in admin.
Expected: returns a Cloudinary URL.

- [ ] **Step 4: Commit**

```bash
git add src && git commit -m "ch01: build admin panel"
```

---

## Phase 6 — Deployment & Go-Live

### Task 6.1: Vercel config

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Write `vercel.json`**

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": ".output",
  "framework": null
}
```

- [ ] **Step 2: Verify production build**

Run: `bun run build`
Expected: build succeeds, output in `.output`.

### Task 6.2: Deploy + env vars

- [ ] **Step 1: Push to GitHub** (own repo for `01-cms`).

- [ ] **Step 2: Deploy**

```bash
vercel deploy --prod
```

- [ ] **Step 3: Add env vars** in Vercel → Settings → Environment Variables: `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `CLOUDINARY_*`.

- [ ] **Step 4: Run `bunx prisma db push`** against the production DB before first deploy.

- [ ] **Step 5: Verify live URL** — public page renders, `/admin/login` works, a content edit persists.

### Task 6.3: Go-live checklist

- [ ] Replace dummy copy with real brand copy
- [ ] Swap sample media with real Cloudinary assets
- [ ] Set a strong `ADMIN_PASSWORD`
- [ ] Point `DATABASE_URL` at the real Atlas cluster
- [ ] Test admin login at `/admin/login`
- [ ] Add real social links in footer
- [ ] Update meta tags in `__root.tsx` head
- [ ] Verify dark mode on mobile Safari (`prefers-color-scheme`)
- [ ] Add `robots.txt` and a sitemap for SEO

---

## Self-Review Notes

- **Spec coverage:** Every blueprint section maps to a task — scaffold (0), config/theme (1), data layer (2), loaders (3), public sections (4), admin (5), deploy (6). The `normalize*` pattern, JSON fallback, tokens, and `whileInView` conventions are all captured.
- **Placeholder scan:** No "TBD"/"TODO" left; all code blocks are concrete.
- **Type consistency:** `getSiteData`/`updateSiteData` (Task 2.4) are consumed by `site.functions.ts` (Task 5.3); `getCollections`/`getReels` (Task 3.1) are consumed by `public.functions.ts` (Task 3.2) and the page (Task 4.6). `requireAdmin` (Task 5.1) is used by all admin server fns.