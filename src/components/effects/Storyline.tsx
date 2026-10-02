"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type StoryStep = { label: string; title: string; text: string };

// Scroll-based storyline (MASTER-IMPLEMENTATION §3.5): the section pins and each
// step lights up as you scroll. Text-only for now; swap in a frame sequence when
// real project footage is available. Reduced motion gets a plain list.
export default function Storyline({ steps }: { steps: StoryStep[] }) {
  const reduced = usePrefersReducedMotion();
  const section = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !section.current) return;
    let cleanup = () => {};
    let cancelled = false;

    // Load GSAP only when this section is on the page
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled || !section.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const items = section.current.querySelectorAll<HTMLElement>("[data-step]");
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: `+=${steps.length * 500}`,
            scrub: true,
            pin: true,
          },
        });
        tl.fromTo(bar.current, { scaleY: 0 }, { scaleY: 1, ease: "none", duration: steps.length }, 0);
        items.forEach((el, i) => {
          tl.fromTo(el, { opacity: 0.25, x: 0 }, { opacity: 1, x: 12, duration: 0.5 }, i);
          if (i < items.length - 1) tl.to(el, { opacity: 0.25, x: 0, duration: 0.5 }, i + 0.9);
        });
      }, section);
      cleanup = () => ctx.revert();
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [reduced, steps.length]);

  // Outer div is what React adds/removes; GSAP's pin-spacer lives inside it
  return (
    <div>
    <div ref={section} className="relative flex min-h-screen items-center bg-bg-2 py-16">
      <div className="container-site grid gap-10 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="eyebrow">How we work</p>
          <h2 className="mt-4 text-3xl font-extrabold uppercase sm:text-4xl">
            From first call to <span className="text-gradient">certified</span>
          </h2>
          <p className="mt-4 max-w-md text-muted">
            Every job follows the same four steps, so you always know what happens next.
          </p>
        </div>
        <div className="relative pl-8">
          <div aria-hidden="true" className="absolute top-0 bottom-0 left-0 w-1 rounded bg-line">
            <div ref={bar} className="bg-gradient-brand h-full w-full origin-top rounded" style={reduced ? undefined : { transform: "scaleY(0)" }} />
          </div>
          <ol className="grid gap-8">
            {steps.map((s) => (
              <li key={s.label} data-step>
                <p className="text-xs font-extrabold tracking-[0.2em] text-brand-bright uppercase">{s.label}</p>
                <h3 className="mt-1 text-xl font-bold">{s.title}</h3>
                <p className="mt-1 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
    </div>
  );
}
