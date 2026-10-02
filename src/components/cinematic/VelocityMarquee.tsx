"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Endless marquee whose speed and skew react to how fast you scroll.
export default function VelocityMarquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const row = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !row.current) return;
    const el = row.current;
    let x = 0;
    let skew = 0;
    const dir = reverse ? 1 : -1;
    const tick = () => {
      const v = window.__lenis?.velocity ?? 0;
      x += dir * (0.6 + Math.abs(v) * 0.25);
      const half = el.scrollWidth / 2;
      if (x <= -half) x += half;
      if (x >= 0 && dir > 0) x -= half;
      skew += (Math.max(-12, Math.min(12, v * 0.6)) - skew) * 0.1;
      el.style.transform = `translate3d(${x}px,0,0) skewX(${-skew}deg)`;
    };
    if (dir > 0) x = -el.scrollWidth / 2;
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [reduced, reverse]);

  const content = items.map((t, i) => (
    <span key={i} className="flex items-center gap-10 pr-10">
      <span>{t}</span>
      <span aria-hidden="true" className="text-brand-bright">⚡</span>
    </span>
  ));

  return (
    <div className="overflow-hidden border-y border-line bg-[#101318] py-6" aria-label={items.join(", ")} role="marquee">
      <div ref={row} aria-hidden="true" className="flex w-max text-5xl font-extrabold tracking-tight whitespace-nowrap text-white/90 uppercase will-change-transform sm:text-7xl">
        {content}
        {content}
      </div>
    </div>
  );
}
