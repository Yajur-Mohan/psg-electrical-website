"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { stats } from "@/lib/site";

// Numbers count up like a meter charging when they scroll into view.
// The final values are in the HTML, so screen readers and no-JS get them as-is.
export default function StatCounters() {
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (reduced || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      root.current!.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const final = el.dataset.count!;
        const num = parseFloat(final);
        if (Number.isNaN(num)) return;
        const suffix = final.replace(String(num), "");
        const state = { v: 0 };
        gsap.to(state, {
          v: num,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => (el.textContent = Math.round(state.v) + suffix),
        });
      });
      gsap.from(root.current!.children, {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <ul ref={root} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <li key={s.label} className="relative overflow-hidden rounded-2xl border border-line bg-[linear-gradient(160deg,#222833,#171a20)] p-8 text-center">
          <span aria-hidden="true" className="bg-gradient-brand absolute inset-x-0 top-0 h-px" />
          <strong data-count={s.value} className="text-gradient block text-5xl font-extrabold tabular-nums">
            {s.value}
          </strong>
          <span className="mt-2 block text-sm text-muted">{s.label}</span>
        </li>
      ))}
    </ul>
  );
}
