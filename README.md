<div align="center">

```
 ██████╗███╗   ███╗███████╗    ██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗ 
██╔════╝████╗ ████║██╔════╝    ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
██║     ██╔████╔██║███████╗    ██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
██║     ██║╚██╔╝██║╚════██║    ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
╚██████╗██║ ╚═╝ ██║███████║    ██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
 ╚═════╝╚═╝     ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ 
```

### *strategy-led · motion-first · built to be remembered*

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TanStack](https://img.shields.io/badge/TanStack_Start-SSR-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/start)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Prisma_6-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-13-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<br/>

> **A full-stack CMS-driven portfolio** built for independent studios & creatives who refuse to be boring.  
> One codebase. Two surfaces. Editable content — no redeploys needed (with a database).

</div>

---

## ◈ WHAT THIS IS

A **production-ready agency portfolio** with a stunning public-facing site and a fully protected admin panel — all content is editable live via the CMS. No code changes. No redeploys. Just ship.

```
public site ──────────────────────────────────────── /admin ───────────────────
  │                                                     │
  ├── Hero (anime.js reveal · magnetic CTAs)             ├── Login (HMAC cookie)
  ├── Marquee (infinite scroll ticker)                  ├── Dashboard
  ├── About (strategy · design · motion)                ├── Site Content editor
  ├── Hero Carousel (Embla)                             ├── Collections manager
  ├── Case Studies (editable cards)                     ├── Media uploads (Cloudinary)
  ├── Reels (video embeds)                              └── Reels manager
  ├── Image Gallery
  ├── Testimonials
  ├── Contact (animated ornament)
  └── Footer
```

---

## ◈ TECH STACK

| Layer | Tech |
|---|---|
| **Framework** | [TanStack Start](https://tanstack.com/start) (React 19, SSR) + TanStack Router |
| **Styling** | Tailwind CSS v4 + `tw-animate-css` |
| **Animation** | Framer Motion 13 + Anime.js 4 |
| **UI Primitives** | Radix UI + shadcn/ui |
| **Carousel** | Swiper 14 + Embla Carousel |
| **Database** | MongoDB via Prisma 6 |
| **Media** | Cloudinary SDK |
| **Forms** | React Hook Form + Zod |
| **Auth** | Single password + HMAC-signed session cookie |
| **Server** | Nitro (Vercel adapter) |
| **Runtime** | Bun (Node 20+ fallback) |

---

## ◈ ARCHITECTURE

```
src/
├── components/
│   ├── ascii-art/          ← custom ASCII art engine (29KB of pure chaos)
│   ├── carousels/          ← hero carousel
│   ├── measured/           ← smooth-cursor, liquid glass, spotlight effects
│   ├── sections/           ← hero, about, reels, gallery, contact, footer…
│   └── ui/                 ← scramble-text, magnetic, count-up, button…
│
├── lib/
│   ├── admin/              ← auth, cloudinary, collections, reels (server)
│   ├── cms/                ← types, defaults, storage, public functions
│   └── normalizers.ts      ← typed transform layer between DB and UI
│
├── routes/
│   ├── index.tsx           ← public portfolio page
│   ├── admin/              ← protected admin panel (login, content, media, reels, site)
│   └── projects/           ← fullscreen “measured” page (measured.tsx)
│
└── server/storage/         ← JSON fallbacks (site runs with ZERO DB config)
    ├── site.json
    ├── reels.json
    └── testimonials.json
```

> **Zero-DB mode:** if `DATABASE_URL` is unset the site serves from static JSON fallbacks and the admin panel is **read-only** — save actions report that nothing was persisted instead of claiming success. Perfect for local dev and demos; set a database to edit content.

---

## ◈ FEATURES

**Public Site**
- 🎨 Custom ASCII art engine with configurable rendering
- ✦ Text scramble on section headings + contact headline (anime.js per-character hero reveal)
- 🎬 Video reels section with embeds + poster images  
- 🖼️ Image gallery — portrait + banner rails, sized by true aspect ratio
- 🗂️ Case-studies section rendered from the `caseStudies` collection
- 💬 Testimonials grid with 3D tilt
- 📡 Infinite marquee ticker (top + bottom)
- 🧲 Magnetic button hover effect
- 🔢 Count-up stat animations
- 🌙 Dark / light theme toggle
- 📱 Fully responsive, mobile-first

**Admin Panel**
- 🔒 Single-password auth; the session cookie carries an HMAC-derived token, never the secret
- ✏️ Visual site content editor (hero, about, contact, footer, marquee)
- 📦 Collections manager (capabilities, testimonials, hero slides, case studies, stats)
- 📸 Cloudinary upload (click or drag-and-drop) with a copyable CDN URL
- 🎥 Reels CRUD (add / edit / reorder video embeds)
- 🛡️ Zero-DB save guard — no false “saved” toasts when nothing was written

---

## ◈ QUICK START

### Prerequisites

- **Bun** ≥ 1.0 (or Node 20+)  
- **MongoDB** connection string (or run without DB — see Zero-DB mode above)
- **Cloudinary** account (optional — only needed for media uploads)

### 1 · Clone & install

```bash
git clone https://github.com/ojasav7/cms-portfolio.git
cd cms-portfolio
bun install
```

### 2 · Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# MongoDB (leave empty to use static JSON fallbacks)
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/myportfolio"

# Admin auth
ADMIN_PASSWORD="your-secret-admin-password"
SESSION_SECRET="a-random-32-char-string"

# Cloudinary (optional — needed for media uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3 · Set up the database

```bash
bun run db:generate   # generate Prisma client
bun run db:push       # push schema to MongoDB
```

### 4 · Dev server

```bash
bun run dev
```

Visit [`http://localhost:3000`](http://localhost:3000) for the public site  
Visit [`http://localhost:3000/admin`](http://localhost:3000/admin) to log into the CMS

---

## ◈ SCRIPTS

| Command | Description |
|---|---|
| `bun run dev` | Start dev server with HMR |
| `bun run build` | Production build (Nitro + Vite) |
| `bun run start` | Start production server |
| `bun run preview` | Preview production build locally |
| `bun run typecheck` | TypeScript type checking |
| `bun run db:generate` | Generate Prisma client from schema |
| `bun run db:push` | Push Prisma schema to MongoDB |

---

## ◈ DEPLOYMENT

### Vercel (recommended)

```bash
bun run build
```

Then push to GitHub and connect to Vercel. Set all env vars in the Vercel dashboard.

> **Not verified in this repo:** there is no `vercel.json` and no deployment was performed from here. `npm run build` passing proves the Nitro build; the steps above are instructions, not a tested pipeline.

### Environment Variables (Vercel Dashboard)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✦ Optional | MongoDB connection string |
| `ADMIN_PASSWORD` | ✅ Yes | CMS admin password |
| `SESSION_SECRET` | ✅ Yes | Cookie signing secret (32+ chars) |
| `CLOUDINARY_CLOUD_NAME` | ✦ Optional | For media uploads |
| `CLOUDINARY_API_KEY` | ✦ Optional | For media uploads |
| `CLOUDINARY_API_SECRET` | ✦ Optional | For media uploads |

---

## ◈ CONTENT MANAGEMENT

With `DATABASE_URL` set, every piece of copy on the site is editable through the admin panel at `/admin` (without a database the panel opens but is read-only and says so):

**Site Settings** (`/admin/site`) — edit hero, about, portfolio overview, contact info, footer links, marquee text, ASCII art showcase

**Collections** (`/admin/content`) — manage:
- `capabilities` — the studio's service tiles
- `testimonials` — client quotes
- `heroShowcase` — hero carousel slides
- `caseStudies` — portfolio case study cards
- `stats` — animated count-up numbers

**Media** (`/admin/media`) — upload images/videos to Cloudinary and copy the returned URL (uploads only; there is no library browser yet)

**Reels** (`/admin/reels`) — add video reels with embed URLs, posters, tags, and descriptions

---

## ◈ FONTS

Custom fonts go in `public/fonts/`. See `public/fonts/README.md` for the expected format and how to reference them in `src/styles/app.css` via CSS custom properties.

---

## ◈ PROJECT STRUCTURE CHEATSHEET

```
.
├── .env.example              ← env var template
├── .github/workflows/        ← SLSA provenance CI
├── prisma/schema.prisma      ← MongoDB schema (SiteConfig, ContentBlock, VideoReel, MediaFile)
├── public/                   ← static assets + fonts
├── scripts/build.mjs         ← custom Nitro build script
├── src/
│   ├── styles/app.css        ← Tailwind v4 + CSS design tokens (:root / .dark)
│   ├── router.tsx            ← TanStack Router setup
│   ├── routeTree.gen.ts      ← auto-generated route tree
│   └── ...                   ← see Architecture above
└── vite.config.ts
```

---

## ◈ CONTRIBUTING

PRs are welcome. Please:

1. Fork the repo and create a feature branch
2. Run `bun run typecheck` before submitting
3. Keep commits scoped — one logical change per commit
4. Never commit `.env`

---

## ◈ LICENSE

MIT — use it, fork it, make it yours.

---

<div align="center">

**Built by [Ojasav Thakur](https://github.com/ojasav7)**

*Bold digital experiences for ambitious teams.*

</div>

---

## ◈ VERIFICATION

```bash
npm run typecheck          # tsc --noEmit
npm run build              # Nitro production build
bun test                   # unit tests (session, normalizers, embed, storage, upload)
```

**Admin session security (2026-11-27).** The `admin_session` cookie no longer
contains `SESSION_SECRET`. It carries a derived token —
`HMAC-SHA256(SESSION_SECRET, "admin-session:v1")` — compared in constant time,
so a leaked cookie reveals nothing usable and cannot be replayed against another
deployment. Login now **fails closed**: if `ADMIN_PASSWORD` or `SESSION_SECRET`
is missing, nobody can sign in (previously an empty secret plus an empty cookie
value compared equal and granted access), and the password comparison is
constant-time. Existing sessions are invalidated by this change — sign in again.

**Tests (`bun test`, 36 passing across 5 files, no network, no extra dependencies):**

| File | Tests | Covers |
|---|---|---|
| `src/lib/admin/session.test.ts` | 10 | token derivation, constant-time compare, fail-closed login, cookie rejection |
| `src/lib/normalizers.test.ts` | 10 | case-study fallback + blank filtering, gallery de-dupe, reel defaults, site merge |
| `src/lib/embed.test.ts` | 5 | YouTube (watch / short / shorts / live) and Vimeo → embed URLs, unsupported input |
| `src/lib/cms/storage.test.ts` | 9 | admin save → public read-back (the exact `updateSiteData` + `siteSaveResult` + `getSiteData` calls); zero-DB save returns `false` and writes nothing; `siteSaveResult` refuses a false success; with a database, exactly one upsert on key `main`; a failing write rejects; read falls back to `site.json` |
| `src/lib/upload.test.ts` | 2 | `pickDroppedFile` picks the first dropped file and returns `null` for an empty/no-file drop |

**Content paths fixed in this pass:** blank `caseStudies` rows are dropped instead of
rendering "Untitled" cards; the `caseStudies` collection now has a public reader
(`src/components/sections/case-studies.tsx`) — before, the admin could edit it and no
section displayed it; `updateSiteData` returns a boolean so a save without a database
reports failure instead of toasting “saved”; the media page accepts drag-and-drop (its
pure `pickDroppedFile` helper is tested; the `onDrop` JSX wiring is read-verified, since
this project has no DOM test environment by design).

**Not verified here:** MongoDB CRUD against a live database, Cloudinary uploads
(need credentials), any deployment, and any browser-level interaction — the dev server
was built, not clicked through. Everything else listed above was executed.
