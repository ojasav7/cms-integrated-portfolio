# CMS-Driven Portfolio Site — Implementation Plan & Build Record

> **Status: built, classified and verified on 2026-11-27.**
> This file used to be a forward-looking plan with 0 of 91 boxes ticked, which made it
> useless for telling "built" apart from "described". It is now a build record:
> **every `- [x]` names files that exist and a command that was run and passed.**
> Every `- [ ]` is an explicit blocker naming the exact missing credential, service or
> environment (Phase 6 only). The original plan's code listings were
> deleted where the shipped code deliberately differs — they were already misleading
> (for example, they specified a cookie that stored `SESSION_SECRET`).

**Goal:** a CMS-backed portfolio (TanStack Start + React 19 + Tailwind v4 + Framer
Motion + Prisma/MongoDB + Cloudinary) with an animated public page and a protected
`/admin` panel.

## Verification — run this and you reproduce every tick below

```bash
npx tsc --noEmit           # typecheck              → exit 0
npm run build              # Nitro production build → exit 0
bun test                   # unit tests             → 36 pass, 0 fail
git check-ignore -q .env   # .env never committed   → exit 0
```

Last run 2026-11-27: **typecheck exit 0, build exit 0, `bun test` 36 pass / 0 fail
(80 expect() calls, 5 files: session 10, normalizers 10, embed 5, storage 9, upload 2)**.
Individual evidence commands are quoted per task and assume this directory.

## Global constraints (unchanged, all still true)

- Runtime: Bun or Node 20+ (`bun run dev`, `npm run build` both work).
- Database: MongoDB via Prisma 6, `DATABASE_URL`; **with no `DATABASE_URL` the site
  runs from `src/server/storage/*.json`** (zero-DB mode, read-only).
- Media: Cloudinary, `CLOUDINARY_*` env vars; the app runs without them (uploads
  disabled with a banner).
- Auth: single admin password (`ADMIN_PASSWORD`) + `SESSION_SECRET`; the session
  cookie carries an HMAC token, never the secret (§Deviations).
- Every CMS collection passes through `normalize*()` before reaching the UI.
- Never commit `.env`.

---

## Build status at a glance

| Phase | Task | Status |
|---|---|---|
| 0 | 0.1 scaffold + git repo | ✅ implemented |
| 0 | 0.2 dependencies | ✅ implemented |
| 0 | 0.3 `.env` + gitignore | ✅ implemented |
| 1 | 1.1 Vite + TanStack Start config | ✅ implemented |
| 1 | 1.2 design tokens + marquee keyframes | ✅ implemented (file path differs) |
| 1 | 1.3 root shell + theme persistence | ✅ implemented |
| 2 | 2.1 Prisma schema | ✅ implemented (4 models) |
| 2 | 2.2 Prisma singleton + env config | ✅ implemented |
| 2 | 2.3 JSON fallback data + defaults | ✅ implemented |
| 2 | 2.4 storage layer | 🟡 fixed (write path reported false success) |
| 3 | 3.1 collections + reels server fns | ✅ implemented |
| 3 | 3.2 public portfolio loader | ✅ implemented |
| 4 | 4.1 `cn` + normalizers | 🟡 fixed (blank case studies rendered as "Untitled") |
| 4 | 4.2 navbar + hero + marquee + theme toggle | ✅ implemented |
| 4 | 4.3 about + zigzag + hero carousel | ✅ implemented |
| 4 | 4.4 reels section (tag filter + search) | ✅ implemented |
| 4 | 4.5 gallery + testimonials + contact + footer | ✅ implemented |
| 4 | 4.6 wire the home route | 🟡 fixed (added the missing case-studies reader) |
| 5 | 5.1 admin auth (login/logout/session) | 🟡 fixed (3 security defects) |
| 5 | 5.2 admin layout + route guard | ✅ implemented |
| 5 | 5.3 site content editor | 🟡 fixed (honest failure in zero-DB mode) |
| 5 | 5.4 reels CRUD + reorder | ✅ implemented |
| 5 | 5.5 collections editor | ✅ implemented |
| 5 | 5.6 Cloudinary media upload | 🟡 fixed (drag-and-drop added — it was claimed but missing) |
| 6 | 6.1 Vercel config | ⛔ blocked (no deploy target / Vercel account) |
| 6 | 6.2 deploy + dashboard env vars | ⛔ blocked (no Vercel account, Mongo URI, Cloudinary credentials) |
| 6 | 6.3 go-live checklist | ⛔ blocked (depends on 6.1/6.2) |

---

## Phase 0 — Prerequisites & Scaffold

### Task 0.1 — project + git repo ✅
- [x] TanStack Start project scaffolded and committed: `package.json`,
  `vite.config.ts`, `src/`, real git history.
  Verify: `git log --oneline | tail -3` · `ls package.json vite.config.ts`

### Task 0.2 — dependencies ✅
- [x] Runtime + dev dependencies installed: framer-motion, lucide-react, react-icons,
  swiper, embla, the Radix set, cva/clsx/tailwind-merge/cmdk/sonner/vaul,
  react-hook-form, zod, @prisma/client, cloudinary, prisma, nitro, vite, typescript.
  Verify: `npm run build` (a missing dependency fails the build) · `ls node_modules | head`

### Task 0.3 — environment variables ✅
- [x] `.env.example` documents every variable; `.env` is git-ignored.
  Verify: `git check-ignore -q .env` · `cat .env.example`

---

## Phase 1 — Config, Styles & Theme

### Task 1.1 — Vite + TanStack Start config ✅
- [x] `vite.config.ts` wires TanStack Start + React + Tailwind v4 + the Nitro build.
  Verify: `npm run build` produces `.output/nitro.json`.

### Task 1.2 — design tokens + marquee ✅
- [x] CSS custom-property tokens (`:root` + `.dark`), marquee keyframes and utilities.
  **Deviation:** the file is `src/styles/app.css` (the plan said `styles.css`); that is
  the path `__root.tsx` and the Vite build actually use.
  Verify: `ls src/styles/app.css` · `grep -c "animate-marquee" src/styles/app.css`

### Task 1.3 — root shell + theme persistence ✅
- [x] The `<html>` class is restored from `localStorage["theme-preference"]` before
  paint; the toggle writes the same key.
  Verify: `grep -c theme-preference src/routes/__root.tsx src/components/ui/theme-toggle.tsx`

---

## Phase 2 — Data Layer (Prisma + JSON fallback)

### Task 2.1 — Prisma schema ✅
- [x] Four models: `SiteConfig`, `ContentBlock`, `VideoReel`, `MediaFile`.
  Verify: `grep -c "^model " prisma/schema.prisma` → 4 · `npx prisma generate`

### Task 2.2 — Prisma singleton + env config ✅
- [x] Lazy singleton (`getPrisma()`, `hasDatabaseUrl()`), centralised env config
  (`ADMIN_PASSWORD`, `SESSION_SECRET`, Cloudinary) and `hasCloudinary()`.
  Verify: `ls src/lib/db.server.ts src/lib/config.server.ts` · `bun test`

### Task 2.3 — JSON fallback data + defaults ✅
- [x] `src/server/storage/{site,reels,testimonials}.json` plus `src/lib/cms/defaults.ts`
  (`DEFAULT_SITE`, `DEFAULT_STATS`, `DEFAULT_CAPABILITIES`, `DEFAULT_TESTIMONIALS`,
  `DEFAULT_HERO_SLIDES`, `DEFAULT_ASCII_SHOWCASE`).
  Verify: `ls src/server/storage/` · `bun test src/lib/normalizers.test.ts`

### Task 2.4 — storage layer 🟡 fixed
- [x] `getSiteData()` reads Mongo and falls back to `site.json` when the DB is missing
  **or unreachable** (a bad URL never blanks the site).
- [x] `updateSiteData()` now returns `boolean`. It used to resolve silently having
  written nothing, so the admin editor toasted "saved" in zero-DB mode while the page
  never changed.
  Verify: `bun test src/lib/cms/storage.test.ts` — passes
  `zero-DB save path > updateSiteData returns false and writes nothing when no database is configured`,
  `zero-DB save path > a zero-DB save resolves to ok:false with a reason, never a success toast`,
  `admin save → public read-back > a saved site edit is ok:true and is what the public reader returns`
  and `admin save → public read-back > with no database the same edit is refused and the public page keeps the JSON fallback`;
  also `grep -n "Promise<boolean>" src/lib/cms/storage.server.ts`

---

## Phase 3 — Public Data Loaders

### Task 3.1 — collections + reels server functions ✅
- [x] `getCollections()` groups `ContentBlock` rows by collection and attaches each row
  id for the editor; falls back to defaults with no DB; unknown names are ignored.
- [x] `getReels()` orders by `order`, falls back to `reels.json`.
  Verify: `bun test` · `grep -rn "getCollections" src/lib`

### Task 3.2 — public portfolio loader ✅
- [x] `getPortfolioContent()` loads site + collections + reels in one round trip.
  Verify: `grep -n "getPortfolioContent" src/lib/cms/public.functions.ts src/routes/index.tsx`

---

## Phase 4 — Public Page Sections

### Task 4.1 — `cn` + normalizers 🟡 fixed
- [x] `cn()` (clsx + tailwind-merge) and the normalizer layer for every collection.
- [x] `normalizeCaseStudies` falls back to the default work items (like the other
  collections) and **filters blank entries on the raw values** — before the fix a blank
  admin row survived as a card titled "Untitled" with no image.
  Verify: `bun test src/lib/normalizers.test.ts` (10 tests)

### Task 4.2 — navbar + hero + marquee + theme toggle ✅
- [x] Sticky navbar (hides while the fullscreen Measured section is in view), hero with
  an anime.js per-character headline reveal + magnetic buttons + count-up stats,
  marquee strips, theme toggle.
  Verify: `ls src/components/sections/navbar.tsx src/components/sections/hero.tsx src/components/sections/marquee.tsx`
  · `grep -c "Magnetic\|CountUp" src/components/sections/hero.tsx`

### Task 4.3 — about + zigzag + hero carousel ✅
- [x] About section with capability tiles and the scroll-driven zigzag timeline; Embla
  hero carousel over the `heroShowcase` collection.
  Verify: `ls src/components/sections/about.tsx src/components/sections/hero-carousel.tsx src/components/carousels/hero-carousel.tsx`

### Task 4.4 — reels section (filter + search) ✅
- [x] Tag filter buttons + text search + responsive embed grid.
  Verify: `grep -c "filter\|search" src/components/sections/reels.tsx` · `bun test src/lib/embed.test.ts`

### Task 4.5 — gallery + testimonials + contact + footer ✅
- [x] Gallery rails sized by true aspect ratio; testimonials grid with 3D tilt; contact
  form that opens a prefilled `mailto:`; footer from `site.footer`.
  Verify: `ls src/components/sections/image-gallery.tsx src/components/sections/testimonials.tsx src/components/sections/contact.tsx src/components/sections/footer.tsx`

### Task 4.6 — wire the home route 🟡 fixed
- [x] `src/routes/index.tsx` loads the portfolio payload and composes every section.
- [x] **Added the missing case-studies reader** (`src/components/sections/case-studies.tsx`).
  The admin could edit `caseStudies`, but nothing rendered them — the only reader was
  the gallery, which used their images and dropped title, description and link. A CMS
  you can edit but never see is not a CMS.
  Verify: `bun test src/lib/normalizers.test.ts` · `grep -n CaseStudiesSection src/routes/index.tsx`

---

## Phase 5 — Admin Panel

### Task 5.1 — admin auth 🟡 fixed (three defects)
- [x] Login / logout / session check, cookie `admin_session` (`httpOnly`,
  `sameSite=lax`, `secure` in production, 7-day max-age).
- [x] **The cookie no longer stores `SESSION_SECRET`** — it carries
  `HMAC-SHA256(secret, "admin-session:v1")`, compared in constant time.
- [x] **Fails closed**: with `ADMIN_PASSWORD` or `SESSION_SECRET` unset nobody can sign
  in (previously an empty secret plus an empty cookie value compared equal).
- [x] Password comparison is constant-time.
  Verify: `bun test src/lib/admin/session.test.ts` (10 tests)
  · `grep -n "sessionToken" src/lib/admin/auth.functions.ts`

### Task 5.2 — admin layout + route guard ✅
- [x] `/admin` `beforeLoad` redirects to `/admin/login` unless the session is valid; the
  login route is exempt; sidebar + toaster + page transition.
  Verify: `grep -n "beforeLoad" -A3 src/routes/admin/route.tsx`

### Task 5.3 — site content editor 🟡 fixed
- [x] Hero / about / contact / footer / marquee / ASCII editors (react-hook-form + zod).
- [x] Saving in zero-DB mode now **reports failure** instead of a false "saved" toast.
  The mapping lives in one pure function (`siteSaveResult`) that `saveSiteConfig` returns.
  Verify: `bun test src/lib/cms/storage.test.ts` — passes
  `admin save → public read-back > a saved site edit is ok:true and is what the public reader returns`,
  `siteSaveResult > refuses to report ok for an unsaved write`,
  `with a database configured > updateSiteData performs one upsert on the main key and returns true`
  and `with a database configured > a failing write rejects instead of resolving true`;
  also `grep -n "Database not configured" src/lib/cms/storage.server.ts`

### Task 5.4 — reels CRUD ✅
- [x] Create / edit / delete / reorder (up-down); the embed URL is derived from YouTube
  or Vimeo links (`computeEmbedUrl`, now a pure module in `src/lib/embed.ts`).
  Verify: `bun test src/lib/embed.test.ts` (5 tests)

### Task 5.5 — collections editor ✅
- [x] Tabs for `capabilities`, `testimonials`, `caseStudies`, `stats`, `heroShowcase`
  with add / edit / delete against `ContentBlock` rows.
  Verify: `grep -n "caseStudies" src/routes/admin/content.tsx`

### Task 5.6 — Cloudinary media upload 🟡 fixed
- [x] Upload from disk to Cloudinary and copy the returned CDN URL; banner when
  Cloudinary is not configured.
- [x] **Drag-and-drop added** — the README promised it and the page only accepted a
  click-through file picker.
  The only decision it makes (which file a drop carries) is the pure `pickDroppedFile`
  helper, so that is tested; the JSX `onDrop` wiring around it is **read-verified, not
  unit-tested**: this project deliberately has no DOM test environment (adding jsdom
  would be a new dependency).
  Verify: `bun test src/lib/upload.test.ts` — passes
  `pickDroppedFile > returns the first file of a drop` and
  `pickDroppedFile > returns null when a drop carries no files`;
  `grep -n "pickDroppedFile" src/routes/admin/media.tsx`

---

## Phase 6 — Deployment

### Task 6.1 — Vercel config ⛔ blocked
- [ ] **BLOCKER — missing a deploy target and Vercel account access.** The build is a
  working Nitro server bundle (`.output/`), but a `vercel.json` can only be proven by a
  real deploy to the owner's Vercel project; writing one now would be an unexecuted guess.
  Exact missing thing: a Vercel account/project (owner credentials) or another named
  hosting target against which `vercel deploy` could be run. Not a code gap.

### Task 6.2 — deploy + dashboard env vars ⛔ blocked
- [ ] **BLOCKER — missing three credentials and a hosting account.** No live deployment
  was performed. Exact missing things: (1) a Vercel account/project token, (2) a MongoDB
  connection URI (`DATABASE_URL`), (3) Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`,
  `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). Nothing in this repo should be read as
  "deployed". Everything provable without them is proven by the tests above.

### Task 6.3 — go-live checklist ⛔ blocked
- [ ] **BLOCKER — depends on 6.1/6.2.** A go-live checklist for a deployment that has
  not happened would document fiction. Exact missing thing: a deployed environment to
  check (see 6.1/6.2). The pre-deploy facts that *are* known live in README → Verification;
  the zero-DB, Cloudinary-disabled and misconfigured-secret paths already have tests.

---

## Deviations from the original plan (decisions, not omissions)

1. **Auth** — the plan's listing set the cookie to `SESSION_SECRET` and compared it
   directly. Replaced with a derived HMAC token, a constant-time compare and a
   fail-closed login; the tests pin the new behaviour.
2. **Styles path** — `src/styles/app.css`, not `src/styles.css`.
3. **Test runner** — `bun test` (built in). No test framework or `@types/bun` was
   added; the only extra file is `src/bun-test.d.ts` for ambient types.
4. **Case studies** — a public reader was added because the admin already exposed the
   collection and the README already advertised portfolio work.
5. **Zero-DB mode** — documented as **read-only**: the site serves fallbacks and the
   admin editors refuse to claim success. Persisting edits without a database was not
   implemented; it would need a writable filesystem the deployment target does not
   guarantee.

## Known gaps (stated, not hidden)

- **"Live preview of changes" was removed from the README.** No preview surface exists;
  after saving, the public page shows the change on reload. It was not required for the
  CMS to work, so it is deferred rather than invented.
- **Live deployment** and the `vercel.json` that goes with it (Phase 6) are deferred.
- **MongoDB and Cloudinary paths have no unit tests** — they need a live database and
  credentials. Covered by tests: the fallback/normalizer path, the embed mapping and the
  session logic. The admin CRUD handlers were read, not executed against a database in
  this pass.
