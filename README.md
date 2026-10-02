# PSG Electrical and Cables: public website (Team HYDRA)

The public-facing marketing site for **PSG Electrical and Cables / Trite Solar**, built for INSY7315 (WIL) Task 2.
It implements the "Public website" scope from the HYDRA Task 1 documentation (§1.5) and the
[master implementation plan](docs/MASTER-IMPLEMENTATION.md): a one-question-at-a-time quote flow,
accessibility work, and selective cinematic effects.

## Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 24 |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4, PSG brand tokens from the team prototype |
| Effects | [Originkit](https://originkit.dev) (WebGL/canvas components), GSAP + ScrollTrigger, Lenis, Motion |
| Data | SQLite via Node's built-in `node:sqlite`, behind repositories (HYDRA §5.1) |
| Auth | bcrypt password hashes + signed JWT in an httpOnly cookie (HYDRA §6.1) |
| Validation | zod, on every API route |

> HYDRA's production design targets Azure Database for PostgreSQL. All SQL lives in `src/lib/db/*-repository.ts`,
> so moving to Postgres means swapping the driver in `connection.ts` without touching any route.

## Getting started

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD and JWT_SECRET
npm run dev                  # http://localhost:3000
```

Staff dashboard: <http://localhost:3000/admin> (the admin account is created from `.env.local` on first login).

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint (Next.js + React hooks rules) |
| `npm run typecheck` | Generates route types and runs `tsc` |
| `npm run smoke` | End-to-end checks of every page and API route against a running server |

## What's in it

**Pages:** Home, About & Team, Services, Projects, Trite Solar, Partners, FAQ, Contact, Quote, Privacy (POPIA),
Accessibility statement, 404, and a staff-only enquiries dashboard.

**Phase 1: quote flow** (`src/components/quote/QuoteFlow.tsx`)
- Three steps: *What do you need done?* → *How big, roughly?* → *Where should we send your quote?*
- Choices auto-advance; Back keeps earlier answers; contact details come last; optional note only after submitting.
- Focus moves to each new question, progress is announced (`aria-live`), and phone errors are linked with `aria-describedby`.
- On the home page, Contact page and `/quote`, plus a sticky mobile button. Direct phone/WhatsApp/email always visible.
- Server side: zod re-validation, honeypot, per-IP rate limit, phone numbers masked in logs.
- Analytics events `quote_step_view` and `quote_submitted` (`src/lib/analytics.ts`).

**HYDRA user stories covered**
- **#22:** visitors browse services, FAQ and portfolio without logging in.
- **#24:** contact enquiry creates a `contact_query` row with status `New`.
- **#19:** admin sees quotes and queries, replies via WhatsApp link, and sets status to In Progress / Converted to Job / Closed.

**Phase 2: accessibility**
- Skip link, landmarks, one `h1` per page, visible focus, 44px targets, labelled fields, text errors.
- `prefers-reduced-motion` turns off every effect; the WebGL hero has a pause button (WCAG 2.2.2).
- axe-core scan: **0 violations** on all main pages (2 Oct 2026).

**Phase 3: cinematic effects** (all lazy-loaded, all with static fallbacks)

| Effect | Where | Source |
|---|---|---|
| Interactive particle field hero | Home | Originkit `cursor-ring-field` |
| Crackling electric border | Trite Solar cards | Originkit `electricborder` |
| Kinetic type band | Home | Originkit `appear-text` |
| Arrow-reveal CTA | Home hero | Originkit `arrow-reveal-button` |
| Smooth scroll | Site-wide | Lenis + GSAP ticker |
| Pinned "How we work" storyline | Home | GSAP ScrollTrigger |
| Before/after spotlight reveal | Home, Projects | Custom, with keyboard slider |
| Section reveals | Most pages | Motion `whileInView` |

## Project structure

```
src/
  app/                 routes (pages + /api route handlers)
  components/
    effects/           smooth scroll, reveals, hero, before/after, storyline
    originkit/ui/      components installed with `npx originkit add`
    quote/ contact/    lead capture
    layout/ ui/        header, footer, shared blocks
  lib/
    db/                SQLite connection + repositories
    site.ts            all business copy in one place
    validation.ts      zod schemas
    auth.ts            bcrypt + JWT session
docs/                  master implementation plan
scripts/smoke.mjs      end-to-end smoke test
```

## Before launch (client to confirm)

- Real phone, WhatsApp number, email and service area in `src/lib/site.ts` (placeholders now).
- Real project photos to replace the before/after illustrations.
- Named partners for the Partners page.
- Email/WhatsApp notification on new quotes (MASTER-IMPLEMENTATION §1.4).

## Team HYDRA

Kaedon Naidoo (lead) · Yashodha Govender · Darsh Somayi · Katelyn Narain · Yajur Mohan · Lonwabo Gumede
