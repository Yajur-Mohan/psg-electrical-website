"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { whenStageReady } from "@/lib/stage";

// Inner-page hero with the same reveal language as the home page:
// masked line reveal, scrambled eyebrow, drifting glow and a giant watermark
// that slides as you scroll away.
export default function PageHero({
  eyebrow,
  title,
  accent,
  children,
  tone = "default",
  logo,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  children?: ReactNode;
  tone?: "default" | "solar";
  /** Optional brand lockup shown above the eyebrow */
  logo?: ReactNode;
}) {
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const solar = tone === "solar";

  useEffect(() => {
    if (reduced || !root.current) return;
    gsap.registerPlugin(SplitText, ScrambleTextPlugin, ScrollTrigger);
    const q = gsap.utils.selector(root.current);
    let split: SplitText | undefined;
    gsap.set(q("[data-title], [data-fade]"), { opacity: 0 });

    const stop = whenStageReady(() => {
      split = SplitText.create(q("[data-title]")[0], { type: "lines", mask: "lines" });
      gsap.set(q("[data-title]"), { opacity: 1 });
      gsap
        .timeline()
        .from(split.lines, { yPercent: 115, duration: 1, ease: "power4.out", stagger: 0.12 })
        .to(q("[data-eyebrow]"), { duration: 0.9, scrambleText: { text: "{original}", chars: "⚡01ΩVA", speed: 0.6 } }, 0)
        .fromTo(q("[data-fade]"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.35);
    });

    const ctx = gsap.context(() => {
      gsap.to(q("[data-watermark]"), {
        xPercent: -25,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(q("[data-orb]"), { x: 80, y: -40, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, root);

    return () => {
      stop();
      split?.revert();
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section
      ref={root}
      className={`relative flex min-h-[62svh] items-end overflow-hidden border-b border-[#303742] pt-32 pb-16 ${
        solar ? "bg-[#141c17]" : "bg-[#14171d]"
      }`}
    >
      <div aria-hidden="true" className="grid-lines absolute inset-0" />
      <div
        data-orb
        aria-hidden="true"
        className="absolute -top-32 right-[-10%] size-[620px] rounded-full blur-3xl"
        style={{
          background: solar
            ? "radial-gradient(circle, rgba(245,179,53,.32), rgba(140,207,63,.18) 40%, transparent 68%)"
            : "radial-gradient(circle, rgba(91,140,255,.3), rgba(123,69,245,.18) 40%, transparent 70%)",
        }}
      />
      <p
        data-watermark
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 left-0 text-[clamp(6rem,18vw,16rem)] leading-none font-extrabold whitespace-nowrap text-transparent uppercase opacity-[0.07] [-webkit-text-stroke:2px_white]"
      >
        {eyebrow} · {eyebrow}
      </p>
      <div className="container-site relative">
        {logo && (
          <div data-fade className="mb-8">
            {logo}
          </div>
        )}
        <p data-eyebrow className={solar ? "eyebrow !border-trite/60 !bg-trite/10 !text-trite" : "eyebrow"}>{eyebrow}</p>
        <h1
          data-title
          className="mt-6 max-w-4xl text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] font-extrabold tracking-[-0.03em] uppercase"
        >
          {title} {accent && <span className={solar ? "text-trite-gradient" : "text-gradient"}>{accent}</span>}
        </h1>
        {children && (
          <div data-fade className="mt-6 max-w-2xl text-lg text-[#c3c9d3]">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
