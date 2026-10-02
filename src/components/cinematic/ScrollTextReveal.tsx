"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// A big statement whose words "switch on" one by one as you scroll through it.
export default function ScrollTextReveal({ text, kicker }: { text: string; kicker?: string }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (reduced || !ref.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const words = ref.current.querySelectorAll("[data-word]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.12, textShadow: "0 0 0 rgba(91,140,255,0)" },
        {
          opacity: 1,
          textShadow: "0 0 24px rgba(91,140,255,.45)",
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
    });
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="py-28 sm:py-36">
      <div className="container-site">
        {kicker && <p className="mb-6 text-xs font-extrabold tracking-[0.2em] text-brand-bright uppercase">{kicker}</p>}
        <p ref={ref} className="max-w-5xl text-[clamp(2rem,5vw,4.25rem)] leading-[1.08] font-extrabold tracking-tight">
          {text.split(" ").map((w, i) => (
            <span key={i} data-word className="inline-block pr-[0.25em]">
              {w}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
