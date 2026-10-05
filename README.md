# PSG Electrical and Cables: public website (Team HYDRA)

The public-facing marketing site for **PSG Electrical and Cables / Trite Solar**, built for INSY7315 (WIL) Task 2.
It implements the "Public website" scope from the HYDRA Task 1 documentation (§1.5) and the
[master implementation plan](docs/MASTER-IMPLEMENTATION.md): a one-question-at-a-time quote flow,
accessibility work, and selective cinematic effects.

## Stack

| Layer | Choice |
|---|---|
| Hosting | Cloudflare Workers (workers.dev) |
| Framework | Next.js App Router code, built with [vinext](https://github.com/cloudflare/vinext) (Vite) + React 19 + TypeScript |
| Styling | Tailwind CSS 4, PSG brand tokens from the team prototype |
| Effects | [Originkit](https://originkit.dev) (WebGL/canvas components), GSAP + ScrollTrigger, Lenis, Motion |
| Data | Cloudflare D1 (serverless SQLite), behind repositories (HYDRA §5.1) |
| Auth | bcrypt password hashes + signed JWT in an httpOnly cookie (HYDRA §6.1) |
| Validation | zod, on every API route |

> HYDRA's production design targets Azure Database for PostgreSQL. All SQL lives in `src/lib/db/*-repository.ts`,
> so moving databases means swapping the driver in `connection.ts` without touching any route. (This build already
> moved once, from `node:sqlite` to D1, by changing only the repositories.)

**Live:** <https://psg-electrical-site.axiomcompute.workers.dev>

## Getting started

```bash
npm install
cp .dev.vars.example .dev.vars   # then set ADMIN_PASSWORD and JWT_SECRET
npm run db:migrate:local         # create the local D1 tables
npm run dev                      # runs inside workerd, like production
```

### Deploying to Cloudflare Workers

```bash
npx wrangler login
npm run db:migrate               # apply migrations/ to the remote D1 database
npm run deploy                   # vite build + wrangler deploy
npx wrangler secret put ADMIN_PASSWORD   # also ADMIN_USERNAME and JWT_SECRET
```

Staff dashboard: `/admin` (the admin account is created from the Worker secrets on first login).

| Script | What it does |
|---|---|
| `npm run dev` | Development server (Vite + workerd, local D1) |
| `npm run build` / `npm start` | Production build and local preview |
| `npm run deploy` | Build and deploy to Cloudflare Workers |
| `npm run db:migrate` | Apply D1 migrations to the live database |
| `npm run lint` | ESLint (Next.js + React hooks rules) |
| `npm run typecheck` | Generates route types and runs `tsc` |
| `npm test` | Chatbot intent-matching unit tests (Node's built-in test runner) |
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

## Cinematic layer (v2)

The site is directed like a short film, with one motion language across every page.

| Moment | What happens | Built with |
|---|---|---|
| Intro | "Powering up" preloader: bolt draws, meter charges to 100%, screen splits open (once per session) | GSAP |
| Page changes | Three brand panels sweep over the screen, name the next page, then sweep away | GSAP + Next router |
| Home hero | Hand-written **WebGL lightning shader**: arcs leap from a power node to your cursor; masked headline reveal, scrambled eyebrow, parallax, scroll-out | WebGL (GLSL), GSAP SplitText + ScrambleText |
| Inner heroes | Masked line reveals, drifting glow and a giant outlined watermark that slides as you scroll | GSAP |
| Statement | Words "switch on" one at a time as you scroll | ScrollTrigger scrub |
| Services | Pinned horizontal reel; cards tilt into frame | ScrollTrigger containerAnimation |
| Marquee | Speed and skew react to scroll velocity | Lenis velocity |
| Numbers | Counters charge up on view | GSAP |
| Closing scene | Title card scales in over the Originkit particle field | ScrollTrigger + Originkit |
| Everywhere | Lenis smooth scroll, scroll progress bar, cursor glow + magnetic buttons, film grain | Lenis, GSAP quickTo |

All of it switches off under `prefers-reduced-motion`, and none of it touches the quote form.

## Sparky: rule-based assistant

A floating ⚡ button opens **Sparky**, a rule-based chatbot for basic electrical and solar questions
(`src/lib/chatbot/`). There's no AI and no server call: questions are scored against ~40 hand-written intents
(keywords plus exact phrases), with **safety intents weighted highest**, so "burning smell" or "got shocked"
always gets switch-off-and-call advice first. Covers tripping breakers, earth leakage, no power, prepaid meters,
CoCs, DB boards, geysers, surge protection, EV chargers, solar types, inverter sizing, batteries, load shedding,
payback, SSEG registration, kW vs kWh, and company info. Answers link to the quote form or contact page.

## Project structure

```
src/
  app/                 routes (pages + /api route handlers)
  components/
    cinematic/         preloader, page curtain, WebGL lightning, heroes, reel, marquee
    chatbot/           Sparky chat panel
    effects/           smooth scroll, reveals, before/after, storyline
    originkit/ui/      components installed with `npx originkit add`
    quote/ contact/    lead capture
    layout/ ui/        header, footer, shared blocks
  lib/
    chatbot/           knowledge base, scoring engine and tests
    db/                D1 connection + repositories
    site.ts            all business copy in one place
    validation.ts      zod schemas
    auth.ts            bcrypt + JWT session
migrations/            D1 schema
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
