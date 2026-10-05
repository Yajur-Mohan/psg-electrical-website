"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { whatsappLink } from "@/lib/site";
import CinematicHero from "@/components/cinematic/CinematicHero";
import WhatsAppIcon from "@/components/whatsapp/WhatsAppIcon";
import type { Journey } from "./scene";

type Chapter = { from: number; to: number; eyebrow: string; title: string; text: string; side: "left" | "right" };

// Captions that fade in over the 3D scene at each stage of the journey.
const CHAPTERS: Chapter[] = [
  { from: 0.1, to: 0.24, eyebrow: "01 · The grid", title: "It starts miles away.", text: "High-voltage lines carry power across the country, pylon to pylon.", side: "left" },
  { from: 0.25, to: 0.38, eyebrow: "02 · Your street", title: "Stepped down for your street.", text: "A transformer brings it down to a safe voltage for homes and businesses.", side: "right" },
  { from: 0.4, to: 0.51, eyebrow: "03 · Your home", title: "Into your home.", text: "One service cable, and everything after it is our job to get right.", side: "left" },
  { from: 0.53, to: 0.64, eyebrow: "04 · The DB board", title: "The heart of the house.", text: "Every circuit, breaker and earth leakage, installed and certified to SANS 10142-1.", side: "right" },
  { from: 0.66, to: 0.76, eyebrow: "05 · Trite Solar", title: "Then we add the sun.", text: "Tier-1 panels mounted and wired by our solar division.", side: "left" },
  { from: 0.78, to: 0.87, eyebrow: "06 · Inverter + battery", title: "Wired into your board.", text: "A hybrid inverter and lithium battery, connected and protected.", side: "right" },
];

const CHAPTER_NAMES = ["Grid", "Street", "Home", "DB board", "Solar", "Storage", "Lights on"];

let webglSupport: boolean | undefined;
function hasWebGL() {
  if (webglSupport === undefined) {
    try {
      const c = document.createElement("canvas");
      webglSupport = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}
const noopSubscribe = () => () => {};

/**
 * Hero: a scroll-driven 3D camera journey from pylons to a solar-powered home.
 * Reduced motion or no WebGL falls back to the static cinematic hero.
 */
export default function PowerJourney() {
  const reduced = usePrefersReducedMotion();
  // Assume WebGL on the server; the client checks once and falls back if missing
  const webgl = useSyncExternalStore(noopSubscribe, hasWebGL, () => true);
  const [paused, setPaused] = useState(false);
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const journey = useRef<Journey | null>(null);

  useEffect(() => {
    if (reduced || !webgl || !section.current || !canvas.current) return;
    gsap.registerPlugin(ScrollTrigger);
    let disposed = false;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const root = section.current;
    const q = gsap.utils.selector(root);
    const captions = q<HTMLElement>("[data-chapter]");
    const intro = q<HTMLElement>("[data-journey-intro]")[0];
    const finale = q<HTMLElement>("[data-finale]")[0];
    const rail = q<HTMLElement>("[data-rail]");
    const fill = q<HTMLElement>("[data-rail-fill]")[0];

    const smooth = (a: number, b: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    const show = (el: HTMLElement | undefined, o: number) => {
      if (!el) return;
      el.style.opacity = String(o);
      el.style.transform = `translateY(${(1 - o) * 24}px)`;
      el.style.visibility = o < 0.01 ? "hidden" : "visible";
    };

    function update(p: number) {
      journey.current?.setProgress(p);
      show(intro, 1 - smooth(0.02, 0.08, p));
      CHAPTERS.forEach((c, i) => show(captions[i], smooth(c.from, c.from + 0.025, p) * (1 - smooth(c.to - 0.025, c.to, p))));
      show(finale, smooth(0.9, 0.95, p));
      const stage = Math.min(CHAPTER_NAMES.length - 1, Math.floor(p * CHAPTER_NAMES.length * 0.999));
      rail.forEach((el, i) => el.toggleAttribute("data-active", i <= stage));
      if (fill) fill.style.transform = `scaleY(${p})`;
    }

    import("./scene").then(({ createJourney }) => {
      if (disposed || !canvas.current) return;
      journey.current = createJourney(canvas.current, { mobile });
      update(0);
      // Dev-only hook for reviewing exact frames: window.__journey.renderStill(0.6)
      if (process.env.NODE_ENV !== "production") Object.assign(window, { __journey: journey.current });
    });

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: () => `+=${window.innerHeight * (mobile ? 5 : 6.5)}`,
      pin: true,
      scrub: true,
      onUpdate: (self) => update(self.progress),
    });
    const onResize = () => journey.current?.resize();
    window.addEventListener("resize", onResize);
    update(0);

    return () => {
      disposed = true;
      st.kill();
      window.removeEventListener("resize", onResize);
      journey.current?.dispose();
      journey.current = null;
    };
  }, [reduced, webgl]);

  useEffect(() => journey.current?.setPaused(paused), [paused]);

  if (reduced || !webgl) return <CinematicHero />;

  // Outer div is what React adds/removes; GSAP's pin-spacer lives inside it
  return (
    <div>
      <section ref={section} className="relative h-[100svh] overflow-hidden bg-[#0b0d12]" aria-labelledby="journey-h">
        <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,6,10,.65)_100%)]" />

        {/* Opening title card: the page's real H1 */}
        <div data-journey-intro className="absolute inset-0 flex items-center">
          <div className="container-site">
            <div className="max-w-3xl">
              <p className="eyebrow !bg-[#0b0d12]/70 backdrop-blur">Innovation-driven electrical solutions</p>
              <h1 id="journey-h" className="mt-6 text-[clamp(3rem,9vw,7.5rem)] leading-[0.9] font-extrabold tracking-[-0.04em] uppercase drop-shadow-[0_4px_30px_rgba(0,0,0,.6)]">
                Powering <br />
                <span className="text-gradient">what matters.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-[#e3e6ee] drop-shadow-[0_2px_12px_rgba(0,0,0,.8)]">
                Follow the power from the grid to your home, then watch us make it yours with solar.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link data-magnetic href="#quote" className="bg-gradient-brand inline-flex min-h-12 items-center rounded-full px-7 font-extrabold">
                  GET A FREE QUOTE
                </Link>
                <a
                  data-magnetic
                  href={whatsappLink("Hi PSG Electrical, I'd like some help with an electrical or solar job.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#25d366] px-6 font-extrabold text-[#06301a]"
                >
                  <WhatsAppIcon className="size-5" /> WHATSAPP US
                  <span className="sr-only"> (opens WhatsApp in a new tab)</span>
                </a>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-[0.3em] text-white/70">
            SCROLL TO FOLLOW THE POWER
            <span className="scroll-cue block h-12 w-px bg-white/40" />
          </div>
        </div>

        {/* Chapter captions */}
        {CHAPTERS.map((c) => (
          <div
            key={c.eyebrow}
            data-chapter
            className="pointer-events-none invisible absolute inset-x-0 top-24 opacity-0 sm:top-1/2 sm:-mt-24"
          >
            <div className={`container-site flex ${c.side === "right" ? "sm:justify-end" : ""}`}>
              <div className="max-w-md rounded-2xl border border-white/10 bg-[#0b0d12]/55 p-6 backdrop-blur-md">
                <p className="text-xs font-extrabold tracking-[0.25em] text-[#8fb0ff] uppercase">{c.eyebrow}</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{c.title}</h2>
                <p className="mt-2 text-[#d3d7e0]">{c.text}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Finale */}
        <div data-finale className="invisible absolute inset-x-0 bottom-16 opacity-0">
          <div className="container-site text-center">
            <p className="text-xs font-extrabold tracking-[0.25em] text-trite uppercase">07 · Lights on</p>
            <h2 className="mt-2 text-[clamp(2.2rem,6vw,5rem)] leading-none font-black uppercase">
              Lights on. Fans on. <br />
              <span className="text-trite-gradient">Load shedding off.</span>
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link data-magnetic href="#quote" className="bg-gradient-brand inline-flex min-h-12 items-center rounded-full px-7 font-extrabold">
                POWER MY HOME
              </Link>
              <Link data-magnetic href="/trite-solar" className="inline-flex min-h-12 items-center rounded-full bg-trite px-7 font-extrabold text-[#102008]">
                EXPLORE TRITE SOLAR
              </Link>
            </div>
          </div>
        </div>

        {/* Chapter rail */}
        <ol aria-hidden="true" className="absolute top-1/2 right-4 hidden -translate-y-1/2 lg:block">
          <span className="absolute top-0 right-[5px] bottom-0 w-px bg-white/15">
            <span data-rail-fill className="bg-gradient-brand block h-full w-full origin-top" style={{ transform: "scaleY(0)" }} />
          </span>
          {CHAPTER_NAMES.map((n) => (
            <li key={n} data-rail className="group relative flex items-center justify-end gap-3 py-2.5 text-[11px] font-bold tracking-widest text-white/40 uppercase data-[active]:text-white">
              {n}
              <span className="size-[11px] rounded-full border border-white/40 bg-[#0b0d12] group-data-[active]:border-[#8fb0ff] group-data-[active]:bg-[#8fb0ff] group-data-[active]:shadow-[0_0_10px_#8fb0ff]" />
            </li>
          ))}
        </ol>

        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
          className="absolute top-24 right-4 z-20 hidden min-h-11 rounded-full border border-white/30 bg-black/50 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-black/70 sm:block"
        >
          {paused ? "Play 3D animation" : "Pause 3D animation"}
        </button>
      </section>
    </div>
  );
}
