"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { whenStageReady } from "@/lib/stage";
import ArrowLink from "@/components/ui/ArrowLink";

const LightningField = dynamic(() => import("./LightningField"), { ssr: false });

// Home hero: GPU lightning backdrop, letter-by-letter headline reveal,
// scrambled eyebrow, pointer parallax, and a scroll-out as you move on.
export default function CinematicHero() {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced || !section.current) return;
    gsap.registerPlugin(SplitText, ScrambleTextPlugin, ScrollTrigger);
    const root = section.current;
    const q = gsap.utils.selector(root);
    let split: SplitText | undefined;

    // Hide before the stage uncovers, so the reveal is the first thing seen
    gsap.set(q("[data-fade]"), { opacity: 0, y: 30 });
    gsap.set(q("[data-headline]"), { opacity: 0 });

    const stop = whenStageReady(() => {
      split = SplitText.create(q("[data-headline]")[0], { type: "lines", mask: "lines" });
      gsap.set(q("[data-headline]"), { opacity: 1 });
      gsap
        .timeline()
        .from(split.lines, { yPercent: 115, rotate: 3, duration: 1.1, ease: "power4.out", stagger: 0.14 })
        .to(q("[data-eyebrow]"), { duration: 1, scrambleText: { text: "{original}", chars: "⚡01ΩVA", speed: 0.6 } }, 0)
        .to(q("[data-fade]"), { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 }, 0.45);
    });

    // Scroll-out: content drifts up and fades, backdrop zooms
    const ctx = gsap.context(() => {
      gsap.to(q("[data-content]"), {
        yPercent: -30,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(q("[data-backdrop]"), {
        scale: 1.15,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);

    // Pointer parallax on the content layer
    const px = gsap.quickTo(q("[data-parallax]")[0], "x", { duration: 1, ease: "power3" });
    const py = gsap.quickTo(q("[data-parallax]")[0], "y", { duration: 1, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      px((e.clientX / innerWidth - 0.5) * -24);
      py((e.clientY / innerHeight - 0.5) * -16);
    };
    window.addEventListener("pointermove", onMove);

    return () => {
      stop();
      ctx.revert();
      split?.revert();
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  return (
    <section ref={section} className="relative flex min-h-[100svh] items-center overflow-hidden" aria-labelledby="hero-h">
      <div data-backdrop aria-hidden="true" className="absolute inset-0">
        {reduced ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,#2b3a66_0,#1d2333_35%,#171a20_70%)]" />
        ) : (
          <LightningField paused={paused} />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,15,19,.9)_0%,rgba(13,15,19,.55)_45%,rgba(13,15,19,0)_75%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div data-content className="container-site relative z-10 py-28">
        <div data-parallax className="max-w-3xl">
          <p data-eyebrow className="eyebrow">Professional Electrical Solutions</p>
          <h1
            id="hero-h"
            data-headline
            className="mt-6 text-[clamp(3rem,9vw,7.5rem)] leading-[0.9] font-extrabold tracking-[-0.04em] uppercase"
          >
            Powering <br />
            <span className="text-gradient">what matters.</span>
          </h1>
          <p data-fade className="mt-6 max-w-xl text-lg text-[#c3c9d3]">
            Expert electrical engineering, cabling and solar for homes, businesses and industry. Technical precision where
            reliability is non-negotiable.
          </p>
          <div data-fade className="mt-9 flex flex-wrap items-center gap-4">
            <div data-magnetic>
              <ArrowLink href="#quote" label="GET A FREE QUOTE" />
            </div>
            <Link
              data-magnetic
              href="/services"
              className="inline-flex min-h-12 items-center rounded-full border border-white/25 bg-white/5 px-6 font-extrabold backdrop-blur hover:bg-white/10"
            >
              EXPLORE SERVICES
            </Link>
          </div>
        </div>
      </div>

      {!reduced && (
        <>
          <div data-fade aria-hidden="true" className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-[0.3em] text-white/60 md:flex">
            SCROLL
            <span className="scroll-cue block h-12 w-px bg-white/40" />
          </div>
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
            className="absolute right-4 bottom-4 z-20 min-h-11 rounded-full border border-white/30 bg-black/50 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-black/70"
          >
            {paused ? "Play background animation" : "Pause background animation"}
          </button>
        </>
      )}
    </section>
  );
}
