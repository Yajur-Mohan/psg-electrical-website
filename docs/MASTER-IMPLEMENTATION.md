# Master Implementation Plan: Lead Form, Accessibility & Premium Visuals

> **For Claude Code:** This is the master brief for upgrading this website (a family business site, currently in development). Read the whole file before changing anything. Work **one phase at a time**, in order. At the end of each phase, stop, summarise what changed, and wait for the owner to approve before starting the next phase.
>
> **For the owner:** Save this file as `docs/MASTER-IMPLEMENTATION.md` in the project, then tell Claude Code:
> *"Read docs/MASTER-IMPLEMENTATION.md and do Phase 0."*

---

## Where this brief comes from

It is based on four short-form videos. Their ideas are kept here, but some claims have been corrected:

| Source | Idea | Status |
|---|---|---|
| @mattxwebb, "Delete your Contact Us page" | Long contact forms lose leads ("every extra field is a reason to leave"). Replace them with a **one-question-at-a-time** quote flow: *What do you need done? → How big, roughly? → Where do we text it? → Done, quote on its way.* | Sound UX principle. His "2–3× more enquiries, same visitors" figure is his own claim; measure it ourselves (Phase 1, analytics). |
| @tunezbash / "Vibecoding = lawsuit" | AI-built ("vibe-coded") sites often skip accessibility. The video quotes 4,600 lawsuits last year, ~80% settled, and says to add an **accessibility statement** in the footer. | The statistics are unverified and mostly about the US (ADA). **A statement alone protects nothing.** The real fix is testing for and fixing barriers. The statement comes *after* that (Phase 2). |
| @seanaiux, "Elements that make a site cost $30k+" | Scroll-based storyline, smooth animations, hero video, hover-based reveal, object breakdown (exploded 3D view on scroll). | Use them selectively, where they show off the business's work (Phase 3). |
| @aiwithsurabhi, "Immersive websites" | Tools: Spline, React Three Fiber, Theatre.js (captioned "Hater.js" in the video), Curtains.js, Framer. | Framer is a separate site builder, so it doesn't apply to a coded site; use **Framer Motion** (the React library) instead. Each of the others is mapped to a use in Phase 3. |

**Priority order:** leads first (Phase 1), then making sure everyone can use the site (Phase 2), then polish (Phase 3). The visual effects must never slow the site down or break the quote form.

---

## Phase 0: Recon (no code changes)

Find out the following and report back in a short summary:

1. **Stack:** framework and version (Next.js App/Pages router, Vite + React, Astro, plain HTML, etc.), language (TS/JS), styling (Tailwind, CSS modules, etc.), package manager, and hosting target.
2. **Business details:** what the business does and the services it offers, taken from the site copy. List the **3–6 service categories** a customer would choose from, and the **size or scope options** that make sense for this trade (e.g., Small / Medium / Large, number of rooms, m²). If the copy doesn't make this clear, **ask the owner**; don't invent services.
3. **The current contact flow:** where the Contact page and its form live, which fields it has, and where submissions go (email service, API route, Formspree, Supabase, nothing yet?).
4. **Existing analytics:** GA4, Plausible, Vercel Analytics, or none.
5. **Existing animation or 3D libraries** already installed.
6. **Quick baseline:** run Lighthouse (performance and accessibility) on the home page and contact page, and record the scores so we can compare later.

Then propose:
- the exact step questions and options for the quote form (using the real services),
- where submissions will be delivered (use the existing mechanism if there is one; see Phase 1.4),
- which Phase 3 effects suit *this* business (use the fit guide in Phase 3).

**Do not delete anything in Phase 0.** Work on a git branch (see Appendix A).

---

## Phase 1: Replace the contact form with a one-question-at-a-time quote flow

### 1.1 What we're building

Replace the long contact form (name, email, phone, postcode, type of work, project description…) with a short stepped flow:

| Step | Question (adapt wording to the business) | Input |
|---|---|---|
| 1 of 3 | **What do you need done?** | Big tap-buttons, one per service category (from Phase 0) |
| 2 of 3 | **How big, roughly?** | Small / Medium / Large (or the trade-appropriate scale from Phase 0) |
| 3 of 3 | **Where should we send your quote?** | Phone number only (WhatsApp/SMS), plus a first name field marked optional |
| Done | **Done, your quote is on its way ✓** | Confirmation plus the expected response time (e.g., "We'll WhatsApp you within one working day") |

Rules:
- **One question on screen at a time**, with a "Step X of 3" label and progress dots.
- Choosing an option **advances automatically** (no separate "Next" click needed for choice steps).
- Include a **Back** button on steps 2 and 3, and keep earlier answers.
- **Contact details come last.** Visitors have committed by then, which is the whole point.
- **Don't add fields back.** Address, email and project description can be collected later on the phone call or WhatsApp chat. An optional "Anything else?" text box may appear *after* submission on the Done screen, never before.
- **Keep the business's direct contact details visible** on the page (phone, WhatsApp link, email, service area, hours). "Delete your Contact Us page" means delete the *long form*, not the way to reach the business. Some people (and screen-reader users) will always prefer to just call.
- The flow should also be embeddable: put it on the Contact/Quote page **and** as a section on the home page (and optionally behind a sticky "Get a quote" button on mobile).

### 1.2 Accessibility requirements for the form (non-negotiable)

- Each step is a `<fieldset>` with a `<legend>` (the question) **or** a group with a heading that receives focus when the step changes.
- When the step changes, **move focus to the new question heading** (but not on the initial page load).
- The progress text ("Step 2 of 3") sits in an `aria-live="polite"` region.
- Option buttons are real `<button type="button">` elements with visible focus styles and at least 44×44 px targets.
- The phone input has a proper `<label>`, `type="tel"`, `inputMode="tel"`, `autoComplete="tel"`, and an error message linked with `aria-describedby` and announced on failure.
- Everything works with the keyboard alone, at 200% zoom, and at 320 px width.

### 1.3 Reference component (React + TypeScript; adapt to the stack and styling found in Phase 0)

```tsx
"use client";
import { useEffect, useRef, useState, FormEvent } from "react";

type Option = { value: string; label: string };
type Step =
  | { id: "service" | "size"; kind: "choice"; question: string; options: Option[] }
  | { id: "phone"; kind: "contact"; question: string };

// TODO(Phase 0): replace with the real services and sizes for this business.
const STEPS: Step[] = [
  { id: "service", kind: "choice", question: "What do you need done?",
    options: [{ value: "service-a", label: "Service A" }, { value: "service-b", label: "Service B" }, { value: "service-c", label: "Service C" }] },
  { id: "size", kind: "choice", question: "How big, roughly?",
    options: [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }] },
  { id: "phone", kind: "contact", question: "Where should we send your quote?" },
];

// South African numbers: 0XX XXX XXXX or +27 XX XXX XXXX
const SA_PHONE = /^(\+27|0)\d{9}$/;

function track(event: string, props: Record<string, string | number> = {}) {
  // TODO(Phase 0): wire to the existing analytics (gtag / plausible / va.track).
  if (typeof window !== "undefined") (window as any).gtag?.("event", event, props);
}

export default function QuoteFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">("idle");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus();
  }, [step, status]);

  useEffect(() => { track("quote_step_view", { step: step + 1 }); }, [step]);

  const current = STEPS[step];

  function choose(id: string, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalised = phone.replace(/[\s()-]/g, "");
    if (!SA_PHONE.test(normalised)) {
      setError("Please enter a valid phone number, e.g. 082 123 4567");
      return;
    }
    setError("");
    setStatus("sending");
    const honeypot = (e.currentTarget.elements.namedItem("company") as HTMLInputElement)?.value;
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, phone: normalised, name, company: honeypot }),
      });
      if (!res.ok) throw new Error(String(res.status));
      track("quote_submitted", { service: answers.service ?? "", size: answers.size ?? "" });
      setStatus("done");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "done") {
    return (
      <section className="quote-card" aria-labelledby="quote-done">
        <h2 id="quote-done" ref={headingRef} tabIndex={-1}>Done, your quote is on its way ✓</h2>
        <p>We'll WhatsApp or text you within one working day.</p>
      </section>
    );
  }

  return (
    <section className="quote-card" aria-labelledby="quote-q">
      <p className="quote-eyebrow">One question at a time</p>
      <p aria-live="polite" className="quote-progress">Step {step + 1} of {STEPS.length}</p>
      <h2 id="quote-q" ref={headingRef} tabIndex={-1}>{current.question}</h2>

      {current.kind === "choice" ? (
        <div role="group" aria-labelledby="quote-q" className="quote-options">
          {current.options.map((o) => (
            <button key={o.value} type="button"
              aria-pressed={answers[current.id] === o.value}
              onClick={() => choose(current.id, o.value)}>
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <label htmlFor="quote-phone">Mobile number (WhatsApp or SMS)</label>
          <input id="quote-phone" type="tel" inputMode="tel" autoComplete="tel" required
            value={phone} onChange={(e) => setPhone(e.target.value)}
            aria-invalid={!!error} aria-describedby={error ? "quote-phone-err quote-privacy" : "quote-privacy"} />
          {error && <p id="quote-phone-err" role="alert">{error}</p>}

          <label htmlFor="quote-name">First name <span>(optional)</span></label>
          <input id="quote-name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />

          {/* Honeypot: hidden from people, bots fill it in */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
            <label htmlFor="company">Company</label>
            <input id="company" name="company" tabIndex={-1} autoComplete="off" />
          </div>

          <p id="quote-privacy" className="quote-privacy">
            We'll only use your number to send this quote. <a href="/privacy">Privacy policy</a>
          </p>
          <button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Get my quote"}
          </button>
          {status === "failed" && (
            <p role="alert">Something went wrong. Please call or WhatsApp us directly at <a href="tel:+27XXXXXXXXX">0XX XXX XXXX</a>.</p>
          )}
        </form>
      )}

      {step > 0 && <button type="button" className="quote-back" onClick={() => setStep((s) => s - 1)}>← Back</button>}
    </section>
  );
}
```

Visual style (from the reference video): a white card on a soft background, a small spaced-capitals eyebrow ("ONE QUESTION AT A TIME"), small "Step X of 3" text with three dots (filled ones in the brand accent colour), a bold centred question, and pill-shaped option buttons. The selected option turns solid dark, and a large green tick appears on the Done screen. Match the site's existing brand colours and type, and keep transitions between steps short (≤200 ms fade/slide, disabled under reduced motion).

### 1.4 Delivering submissions

Use whatever the site already has. If nothing exists, choose in this order and confirm with the owner:
1. **API route + email** (e.g., Resend or the host's email service) sent to the business inbox, **and** a WhatsApp click-to-chat link in the email (`https://wa.me/27XXXXXXXXX?text=...`) so a parent can reply in one tap.
2. **Supabase table** `quote_requests` (id, created_at, service, size, phone, name, source_page, user_agent) with RLS that allows insert only from the server, plus an email notification.
3. A form service (Formspree or similar) if there's no backend at all.

Server side, always: re-validate every field, reject requests where the honeypot `company` is filled, rate-limit by IP, never log full phone numbers in plain text, and return JSON `{ ok: true }`.

### 1.5 POPIA (South Africa) basics

A phone number is personal information. Show a one-line purpose notice at the point of collection (already in the component), link to a privacy policy that says what's collected, why, who sees it and how long it's kept, and don't reuse numbers for marketing without consent. *(This is general guidance, not legal advice.)*

### 1.6 Measuring the result

Track `quote_step_view` (with step number) and `quote_submitted`. Record the old form's submission rate as a baseline if any data exists. After a few weeks, compare completion rate per step to see where people drop off.

### Phase 1 done when
- [ ] The long form is removed and the stepped flow is live on the Contact/Quote page and the home page
- [ ] Direct contact details (phone, WhatsApp, email, hours, area) are still visible
- [ ] A test submission arrives at the business inbox/WhatsApp
- [ ] The form passes keyboard-only, screen-reader (NVDA) and 320 px mobile checks
- [ ] Analytics events fire

---

## Phase 2: Accessibility (test and fix first, *then* the statement)

### 2.1 Automated checks

```powershell
# from the project root, with the dev server running on port 3000
npx lighthouse http://localhost:3000 --only-categories=accessibility --view
npx @axe-core/cli http://localhost:3000 http://localhost:3000/contact
```
Also add `eslint-plugin-jsx-a11y` (for React projects) and an automated `@axe-core/playwright` test that runs on the main pages, so regressions are caught.

### 2.2 Fix list (target: WCAG 2.2 level AA)

- [ ] Every meaningful image has descriptive `alt`; decorative images use `alt=""`
- [ ] Colour contrast ≥ 4.5:1 for body text and ≥ 3:1 for large text and UI controls (check brand colours too)
- [ ] One `<h1>` per page, logical heading order, and landmark elements (`header`, `nav`, `main`, `footer`)
- [ ] "Skip to content" link as the first focusable element
- [ ] Visible focus outline on every interactive element; nothing reachable only by mouse
- [ ] All form fields have labels; errors are described in text, not colour alone
- [ ] Links make sense out of context (no bare "click here")
- [ ] `lang` attribute set on `<html>`
- [ ] Autoplaying motion longer than 5 s has a **pause control** (applies to the hero video in Phase 3)
- [ ] `prefers-reduced-motion` respected site-wide (see Phase 3 guardrails)
- [ ] Touch targets ≥ 24×24 px minimum (aim for 44×44)
- [ ] Page works at 200% zoom and 320 px width without horizontal scrolling

### 2.3 Manual check

Use **NVDA** (free, Windows) with Chrome or Firefox. Tab through the home page and complete a quote request using only the keyboard and screen reader. Note anything confusing and fix it.

### 2.4 Accessibility statement (only after 2.1–2.3)

Create `/accessibility` and link it in the footer next to the Privacy policy. Content:
- Our commitment: we aim to meet WCAG 2.2 level AA.
- How we tested: automated checks (Lighthouse, axe) and manual keyboard and screen-reader testing, with the date of last review.
- Known limitations: be honest, e.g., "some older project photos lack detailed descriptions."
- Feedback: phone, WhatsApp and email for reporting a barrier, plus a response-time commitment.
- Alternative: "If anything on this site doesn't work for you, call us on … and we'll help directly."

### Phase 2 done when
- [ ] Lighthouse accessibility ≥ 95 on all main pages, with zero serious or critical axe violations
- [ ] Manual keyboard and NVDA run-through completed
- [ ] `/accessibility` page live and linked in the footer

---

## Phase 3: Premium visual elements (selective)

### 3.0 Fit guide: choose what suits this business

| Effect (from the video) | Best use on a family business site | Default |
|---|---|---|
| **Hero video** | A 6–12 s loop of the business's real work (on site, finished projects, the team). Strongest single upgrade. | ✅ Yes, if there is footage |
| **Smooth animations / smooth scroll** | Gentle fade/slide-in of sections, smooth scrolling. Makes the site feel premium at low cost. | ✅ Yes, subtle |
| **Hover-based reveal** | **Before/after reveal** of real projects (hover on desktop, drag slider on touch). Very persuasive for service businesses. | ✅ Yes, if before/after photos exist |
| **Scroll-based storyline** | A "How we work" or project-transformation sequence that progresses as you scroll (photos or a video converted to frames). | 🟡 Optional |
| **Object breakdown (exploded 3D)** | Only if the business sells or installs a physical product worth showing apart (a product, system or kit). | ❌ Skip unless that applies |
| **Interactive 3D scene** | A small brand moment (3D logo, product) via Spline. Never on the critical path. | 🟡 Optional |

Present the recommended set to the owner in Phase 0 and implement only what's approved.

### 3.1 Guardrails (apply to everything in Phase 3)

- **Performance budget:** Largest Contentful Paint < 2.5 s on mobile (4G), CLS < 0.1, and Lighthouse performance not more than 5 points below the Phase 0 baseline.
- **Lazy-load** all heavy pieces (3D, image sequences, below-the-fold video) with dynamic import or IntersectionObserver.
- **Reduced motion:** when `prefers-reduced-motion: reduce` is set, show static images, no smooth-scroll hijacking, no parallax, and no autoplay.
- **Mobile first:** every effect needs a simple, fast mobile fallback.
- The **quote form must never be blocked** or delayed by any effect.

```ts
// hooks/usePrefersReducedMotion.ts
import { useEffect, useState } from "react";
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
```

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

### 3.2 Hero video

```html
<section class="hero">
  <video class="hero__video" autoplay muted loop playsinline preload="metadata"
         poster="/media/hero-poster.webp" aria-hidden="true">
    <source src="/media/hero.webm" type="video/webm" />
    <source src="/media/hero.mp4" type="video/mp4" />
  </video>
  <div class="hero__content"><h1>…</h1><a href="#quote">Get a free quote</a></div>
  <button class="hero__pause" type="button" aria-pressed="false">Pause background video</button>
</section>
```
- Wire the pause button to `video.pause()`/`play()` and toggle `aria-pressed` (WCAG 2.2.2).
- Under reduced motion, don't autoplay; show the poster.
- On small screens, consider poster-only or a lighter 720p file.
- Keep text readable over the video with a dark gradient overlay, and check contrast.
- Target file size: ≤ 3–5 MB, 6–12 s, no audio track. Compress with the ffmpeg commands in Appendix A.

### 3.3 Smooth scroll and section animations (Lenis + GSAP, or Framer Motion)

```ts
// lib/smoothScroll.ts: call once on the client, skip if reduced motion
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
```
For section reveals in React, Framer Motion is simpler:
```tsx
import { motion } from "framer-motion";
<motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, ease: "easeOut" }}>…</motion.section>
```
Keep the motion subtle (short distances, ≤ 0.6 s) and don't animate the quote form's entry.

### 3.4 Hover-based reveal → before/after

Desktop: a circular "spotlight" that follows the cursor and reveals the *after* photo over the *before*. Touch: a draggable slider. Keyboard: the slider handle is an `<input type="range">` with a label.

```css
.reveal { position: relative; --x: 50%; --y: 50%; --r: 0px; aspect-ratio: 16/10; overflow: hidden; }
.reveal img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.reveal__after { clip-path: circle(var(--r) at var(--x) var(--y)); transition: clip-path .25s ease-out; }
@media (hover: hover) { .reveal:hover .reveal__after { --r: 180px; } }
@media (hover: none) { .reveal__after { clip-path: inset(0 0 0 var(--split, 50%)); transition: none; } }
```
```ts
el.addEventListener("pointermove", (e) => {
  const r = el.getBoundingClientRect();
  el.style.setProperty("--x", `${e.clientX - r.left}px`);
  el.style.setProperty("--y", `${e.clientY - r.top}px`);
});
// Touch/keyboard: <input type="range" aria-label="Compare before and after"> sets --split on the .reveal element
```
Both images need meaningful `alt` text ("Driveway before resurfacing", "…after").

### 3.5 Scroll-based storyline (image sequence on a canvas)

Turn a short video (e.g., a drone or time-lapse of a project) into frames, then scrub through them as the user scrolls. This is the technique behind the house example in the video.

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function initSequence(section: HTMLElement, canvas: HTMLCanvasElement, frameCount: number) {
  const ctx = canvas.getContext("2d")!;
  const src = (i: number) => `/sequence/frame_${String(i).padStart(4, "0")}.webp`;
  const images = Array.from({ length: frameCount }, (_, i) => { const img = new Image(); img.src = src(i + 1); return img; });
  const state = { frame: 0 };
  const render = () => {
    const img = images[state.frame];
    if (img?.complete) { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); }
  };
  images[0].onload = render;
  gsap.to(state, {
    frame: frameCount - 1, snap: "frame", ease: "none", onUpdate: render,
    scrollTrigger: { trigger: section, start: "top top", end: "+=2000", scrub: true, pin: true },
  });
}
```
- Keep to ~60–120 frames at ≤ 1600 px wide WebP. Load lazily when the section approaches.
- Overlay 2–4 short captions that fade in at points along the scroll (e.g., "Day 1: site prep" … "Done").
- Reduced motion or slow connection: show 3–4 still images in a simple stack instead.

### 3.6 Object breakdown / interactive 3D (only if approved in 3.0)

**Easiest: Spline.** Design the scene at spline.design and export it as a React component. Lazy-load it (in Next.js use `@splinetool/react-spline/next` or `next/dynamic` with `ssr: false`). Always show a static image fallback.
```tsx
import Spline from "@splinetool/react-spline";
<Spline scene="https://prod.spline.design/XXXX/scene.splinecode" />
```

**Full control: React Three Fiber + drei.** An exploded view driven by scroll, using a GLTF model whose parts are separate meshes:
```tsx
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, useScroll, useGLTF } from "@react-three/drei";
import { useMemo } from "react";

function Exploded({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const scroll = useScroll();
  const parts = useMemo(() => scene.children.map((obj) => ({
    obj, base: obj.position.clone(), dir: obj.position.clone().normalize(),
  })), [scene]);
  useFrame(() => {
    const t = scroll.range(0.15, 0.6); // 0→1 across the middle of the scroll
    parts.forEach((p) => p.obj.position.copy(p.base).addScaledVector(p.dir, t * 1.5));
  });
  return <primitive object={scene} />;
}

export default function ProductBreakdown() {
  return (
    <Canvas camera={{ position: [0, 1, 5], fov: 40 }} dpr={[1, 2]}>
      <ambientLight intensity={0.6} /><directionalLight position={[3, 5, 2]} />
      <ScrollControls pages={3}><Exploded url="/models/product.glb" /></ScrollControls>
    </Canvas>
  );
}
```
- **Theatre.js** (`@theatre/core`, `@theatre/studio`, `@theatre/r3f`): use it for cinematic camera moves on a visual timeline, then play the sequence on scroll. Load the studio only in development.
- **Curtains.js:** WebGL distortion effects on regular HTML images (e.g., a ripple on project photos on hover). Optional and decorative only; check the library's current maintenance status before adopting it.
- Compress models with `gltf-transform` / Draco, keep them under ~2 MB, and render only when in view.

### Phase 3 done when
- [ ] Only the approved effects are implemented
- [ ] Performance budget met on mobile (Lighthouse run recorded)
- [ ] Reduced-motion mode verified (Windows: Settings → Accessibility → Visual effects → Animation effects **off**)
- [ ] Hero video has a working pause button; all effects have mobile fallbacks
- [ ] The quote form is still the clearest call to action on every page

---

## Phase 4: Final QA before launch

- [ ] Real-device test: an Android phone and an iPhone if available, plus desktop Chrome, Edge and Firefox
- [ ] End-to-end quote submission from each device reaches the business
- [ ] Lighthouse: Performance ≥ 85 mobile, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95
- [ ] axe: zero serious or critical issues
- [ ] Privacy policy and accessibility statement linked in the footer
- [ ] 404 page, favicon, Open Graph image and meta descriptions in place
- [ ] Analytics confirmed receiving `quote_step_view` / `quote_submitted`
- [ ] Owner (parents) has tried the quote flow themselves and knows where leads arrive

---

## Appendix A: PowerShell scripts for local steps

**A1. Put this doc in the project and start a branch**
```powershell
# --- EDIT THESE TWO PATHS ---
$ProjectPath = "C:\path\to\parents-site"
$DocSource   = "$env:USERPROFILE\Downloads\MASTER-IMPLEMENTATION.md"

Set-Location $ProjectPath
New-Item -ItemType Directory -Force -Path ".\docs" | Out-Null
Copy-Item $DocSource ".\docs\MASTER-IMPLEMENTATION.md" -Force

git status
git checkout -b feature/quote-flow-a11y-visuals
git add docs/MASTER-IMPLEMENTATION.md
git commit -m "docs: add master implementation plan"
```

**A2. Install packages (only those needed for the approved phases)**
```powershell
Set-Location "C:\path\to\parents-site"

# Phase 2 tooling
npm install -D eslint-plugin-jsx-a11y @axe-core/playwright @playwright/test

# Phase 3, core motion (approved in 3.0)
npm install framer-motion gsap lenis

# Phase 3, 3D (only if approved)
npm install three @react-three/fiber @react-three/drei
npm install @splinetool/react-spline
npm install -D @theatre/studio
npm install @theatre/core @theatre/r3f
```

**A3. Accessibility and performance audit (dev server running)**
```powershell
Set-Location "C:\path\to\parents-site"
$Base = "http://localhost:3000"
New-Item -ItemType Directory -Force -Path ".\audits" | Out-Null
npx lighthouse $Base --output html --output-path ".\audits\home.html" --view
npx lighthouse "$Base/contact" --output html --output-path ".\audits\contact.html"
npx @axe-core/cli $Base "$Base/contact"
```

**A4. Prepare media with ffmpeg** (install once: `winget install --id Gyan.FFmpeg -e`)
```powershell
Set-Location "C:\path\to\parents-site"
New-Item -ItemType Directory -Force -Path ".\public\media", ".\public\sequence" | Out-Null

# Hero video: 1080p, no audio, web-optimised MP4 + WebM, and a poster frame
ffmpeg -i ".\raw\hero.mp4" -t 12 -vf "scale=-2:1080" -an -c:v libx264 -crf 26 -preset slow -movflags +faststart ".\public\media\hero.mp4"
ffmpeg -i ".\raw\hero.mp4" -t 12 -vf "scale=-2:1080" -an -c:v libvpx-vp9 -crf 36 -b:v 0 ".\public\media\hero.webm"
ffmpeg -i ".\raw\hero.mp4" -ss 1 -frames:v 1 ".\public\media\hero-poster.webp"

# Scroll storyline: video → numbered WebP frames (24 fps, 1600 px wide)
ffmpeg -i ".\raw\storyline.mp4" -vf "fps=24,scale=1600:-2" -c:v libwebp -quality 75 ".\public\sequence\frame_%04d.webp"
(Get-ChildItem ".\public\sequence\*.webp").Count   # pass this number as frameCount
```

---

## Appendix B: Information to collect from the owner (parents)

- [ ] Final list of services and how they describe job sizes
- [ ] The phone/WhatsApp number and email where quotes should arrive, plus the promised response time
- [ ] Service area and business hours
- [ ] Footage for the hero video (phone video in landscape is fine) and before/after photo pairs
- [ ] Whether they sell or install a physical product that suits a 3D or exploded view
- [ ] Approval of the Phase 3 effects list
