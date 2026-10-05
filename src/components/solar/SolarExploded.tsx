"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// R3F, drei and Theatre only download when this section mounts
const ExplodedKit = dynamic(() => import("./ExplodedKit"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-[#121a12]" />,
});

const STEPS = [
  { title: "Panels make DC power", text: "Tier-1 monocrystalline panels on anodised rails." },
  { title: "Isolated for safety", text: "A DC isolator lets us shut the array down for maintenance." },
  { title: "Inverted for your home", text: "The hybrid inverter turns DC into AC and manages grid, solar and battery." },
  { title: "Stored for the night", text: "A lithium battery keeps essentials running through load shedding." },
];

// Pinned "object breakdown": scrolling pulls the solar kit apart.
export default function SolarExploded() {
  const reduced = usePrefersReducedMotion();
  const section = useRef<HTMLElement>(null);
  const progress = useRef(reduced ? 0.75 : 0);

  useEffect(() => {
    if (reduced || !section.current) return;
    gsap.registerPlugin(ScrollTrigger);
    progress.current = 0;
    const root = section.current;
    const steps = root.querySelectorAll<HTMLElement>("[data-step]");
    const onUpdate = (self: ScrollTrigger) => {
      progress.current = self.progress;
      const active = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
      steps.forEach((el, i) => el.toggleAttribute("data-active", i === active));
    };
    // Pin side-by-side on large screens; on smaller (stacked) screens just scrub while it passes
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      ScrollTrigger.create({ trigger: root, start: "top top", end: () => `+=${window.innerHeight * 2.5}`, pin: true, scrub: true, onUpdate });
    });
    mm.add("(max-width: 1023px)", () => {
      ScrollTrigger.create({ trigger: root, start: "top 20%", end: "bottom 60%", scrub: true, onUpdate });
    });
    return () => mm.revert();
  }, [reduced]);

  // Outer div is what React adds/removes; GSAP's pin-spacer lives inside it
  return (
    <div>
      <section ref={section} aria-labelledby="kit-h" className="relative grid min-h-[100svh] bg-[#0f140f] lg:grid-cols-[1fr_1.4fr]">
        <div className="relative z-10 flex flex-col justify-center px-4 py-16 lg:pl-[max(16px,calc((100vw-1180px)/2))]">
          <p className="text-xs font-extrabold tracking-[0.2em] text-trite uppercase">Inside a Trite Solar system</p>
          <h2 id="kit-h" className="mt-2 text-4xl font-black uppercase sm:text-5xl">
            Every part, <span className="text-trite-gradient">explained.</span>
          </h2>
          <ol className="mt-8 grid gap-3">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                data-step
                data-active={reduced || i === 0 ? "" : undefined}
                className="rounded-xl border border-white/10 p-4 transition data-[active]:border-trite/60 data-[active]:bg-trite/10 data-[active]:shadow-[0_0_30px_rgba(140,207,63,.15)]"
              >
                <p className="font-bold">{s.title}</p>
                <p className="text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative h-[60svh] lg:h-auto" aria-hidden="true">
          <ExplodedKit progress={progress} />
        </div>
      </section>
    </div>
  );
}
