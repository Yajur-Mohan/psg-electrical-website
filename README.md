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

Needs Node.js 24 LTS (the version the CI workflow uses).

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

## Part 3 changes (25 Oct 2026)

Two releases: the client's change requests (`df372bf`) and a performance pass (`088b34e`).

**Client requests** (passed on by Yashodha Govender)
- Floating WhatsApp button reads **"WhatsApp us"**.
- New home statement: *"Powering homes, energising businesses, and driving industries forward — with expert workmanship, uncompromising safety, and quality you can trust."*
- The "24/7" stat is now **7am–6pm, Support available**; 24/7 call-out wording is gone from the Contact page, FAQ, Sparky and page descriptions.
- `trite@polka.co.za` removed; grey hint lines removed from the quote form's service options (the size hints stay).
- The "Flip the switches" house is now **3D** (`src/components/cinematic/House3D.tsx`, React Three Fiber + drei): each breaker lights its part of the house. It falls back to the SVG house without WebGL and holds still under reduced motion.

**Bug fix:** the featured project on `/projects` showed only the top-left of its image, because the glass-curl reveal kept its 1200 × 800 px minimum inside a smaller frame. `FeaturedReveal.tsx` now sets the minimum to 0.

**Performance** (measured on a GeForce GT 710: home page 24–40 fps before, 100 fps outside the hero after)

| Effect | Change |
|---|---|
| Electric border | Glow is two translucent strokes instead of up to ten `shadowBlur` passes; 6 noise octaves, 1.5× pixel cap, ~30 fps |
| Electric border, particle ring, glass reveal | Skip drawing while off screen (Intersection Observer) |
| Hero scene (`journey/scene.ts`) | Steps quality down below 40 fps: 1× pixels and no shadows, then 0.75× pixels without post-processing; remembered for the visit |
| 3D house | 1× pixels; contact shadow baked once |
| Film grain | Static and screen-sized instead of an animated 4× overlay |
| WhatsApp and chat pulses | `transform`/`opacity` ring instead of animating `box-shadow` |
| Cable flow | Stepped `stroke-dashoffset` animation on its own layer |

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
    cinematic/         preloader, page curtain, WebGL lightning, heroes, reel, marquee, 3D house demo
    journey/           three.js power-journey hero (scene + procedural models)
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

- Service area in `src/lib/site.ts` (phone, WhatsApp, emails and hours are the client's real details).
- Whether the quote form's size hints should also go (Part 3 kept them).
- Real project photos to replace the before/after illustrations.
- Named partners for the Partners page.
- Email/WhatsApp notification on new quotes (MASTER-IMPLEMENTATION §1.4).

## References

Harvard style. Versions are the ones installed in this repository; all online sources were accessed on 5 November 2026.

**Libraries and tools used in the code**

- Cloudflare (n.d.a) *vinext* (Version 1.0.1) [Computer program]. Available at: https://www.npmjs.com/package/vinext
- Cloudflare (n.d.b) *Wrangler* (Version 4.147.0) [Computer program]. Available at: https://www.npmjs.com/package/wrangler
- darkroom.engineering (n.d.) *Lenis* (Version 1.3.26) [Computer program]. Available at: https://www.npmjs.com/package/lenis
- GreenSock (n.d.) *GSAP* (Version 3.15.0) [Computer program]. Available at: https://www.npmjs.com/package/gsap
- Laxenaire, M. (n.d.) *curtains.js* (Version 8.1.6) [Computer program]. Available at: https://www.npmjs.com/package/curtainsjs
- McDonnell, C. (n.d.) *Zod* (Version 4.6.5) [Computer program]. Available at: https://www.npmjs.com/package/zod
- Meta Open Source (n.d.) *React* (Version 19.3.0) [Computer program]. Available at: https://www.npmjs.com/package/react
- Motion (n.d.) *Motion* (Version 13.5.0) [Computer program]. Available at: https://www.npmjs.com/package/motion
- Originkit (n.d.) *Originkit components: cursor-ring-field, electricborder, glass-curl-reveal, appear-text, arrow-reveal-button, slide-fill-button* [Computer program]. Available at: https://originkit.dev
- Poimandres (n.d.a) *drei* (Version 10.7.9) [Computer program]. Available at: https://www.npmjs.com/package/@react-three/drei
- Poimandres (n.d.b) *React Three Fiber* (Version 9.8.1) [Computer program]. Available at: https://www.npmjs.com/package/@react-three/fiber
- Skokan, F. (n.d.) *jose* (Version 6.2.12) [Computer program]. Available at: https://www.npmjs.com/package/jose
- Spline (n.d.) *react-spline* (Version 4.1.0) [Computer program]. Available at: https://www.npmjs.com/package/@splinetool/react-spline
- Tailwind Labs (n.d.) *Tailwind CSS* (Version 4.3.3) [Computer program]. Available at: https://www.npmjs.com/package/tailwindcss
- Theatre.js (n.d.) *Theatre.js core* (Version 0.7.2) [Computer program]. Available at: https://www.npmjs.com/package/@theatre/core
- three.js authors (n.d.) *three.js* (Version 0.186.1) [Computer program]. Available at: https://www.npmjs.com/package/three
- Vercel (n.d.) *Next.js* (Version 16.3.8) [Computer program]. Available at: https://www.npmjs.com/package/next
- Vite (n.d.) *Vite* (Version 8.3.2) [Computer program]. Available at: https://www.npmjs.com/package/vite
- Wirtz, D. (n.d.) *bcrypt.js* (Version 3.0.3) [Computer program]. Available at: https://www.npmjs.com/package/bcryptjs

**Standards and legislation the site follows**

- Republic of South Africa (2013) *Protection of Personal Information Act 4 of 2013*. Pretoria: Government Printer. (Privacy page)
- South African Bureau of Standards (n.d.) *SANS 10142-1: The wiring of premises, Part 1: Low-voltage installations*. Pretoria: SABS. (CoC copy, FAQ and chatbot)
- W3C (2023) *Web Content Accessibility Guidelines (WCAG) 2.2*. Available at: https://www.w3.org/TR/WCAG22/ (Accessibility work)
- W3C Web Accessibility Initiative (2025) *Understanding Success Criterion 2.3.3: Animation from Interactions*. Available at: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html (reduced-motion fallbacks)

**Documentation behind the Part 3 techniques**

- Cloudflare (2026) *Secrets*. Available at: https://developers.cloudflare.com/workers/configuration/secrets/ (admin credentials)
- Google Chrome (n.d.) *Avoid non-composited animations*. Available at: https://developer.chrome.com/docs/lighthouse/performance/non-composited-animations (button pulses)
- Lewis, P. (n.d.) *Stick to compositor-only properties and manage layer count*. web.dev. Available at: https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count (button pulses)
- MDN Web Docs (2025a) *CanvasRenderingContext2D: shadowBlur property*. Available at: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur (electric border)
- MDN Web Docs (2025b) *stroke-dashoffset*. Available at: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-dashoffset (cable flow)
- MDN Web Docs (2026a) *Intersection Observer API*. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API (off-screen pausing)
- MDN Web Docs (2026b) *prefers-reduced-motion*. Available at: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion (motion fallbacks)
- MDN Web Docs (2026c) *WebGL best practices*. Available at: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices (adaptive hero)
- MDN Web Docs (2026d) *will-change*. Available at: https://developer.mozilla.org/en-US/docs/Web/CSS/will-change (cable flow layer)
- MDN Web Docs (2026e) *Window: requestAnimationFrame() method*. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame (frame-rate sampling)
- Next.js (2026) *How to lazy load Client Components and libraries*. Available at: https://nextjs.org/docs/app/guides/lazy-loading (3D house loading)
- Poimandres (n.d.c) *ContactShadows*. Drei documentation. Available at: https://drei.docs.pmnd.rs/staging/contact-shadows (3D house shadow)
- Poimandres (n.d.d) *Scaling performance*. React Three Fiber documentation. Available at: https://r3f.docs.pmnd.rs/advanced/scaling-performance (3D house frame loop)

## Team HYDRA

Kaedon Naidoo (lead) · Yashodha Govender · Darsh Somayi · Katelyn Narain · Yajur Mohan · Lonwabo Gumede
