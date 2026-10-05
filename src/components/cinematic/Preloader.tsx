"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { INTRO_KEY, announceStageReady } from "@/lib/stage";
import { PsgMark } from "@/components/brand/Logos";

// "Powering up" intro: a bolt draws itself, a counter charges to 100%, then the
// screen splits open. Once per session; a CSS fallback hides it if JS fails.
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (document.documentElement.dataset.intro !== "play" || !root.current) return;
    const el = root.current;
    const state = { v: 0 };
    document.documentElement.classList.add("intro-lock");

    const tl = gsap.timeline({
      onComplete: () => document.documentElement.classList.remove("intro-lock"),
    });
    // Draw the PSG logo stroke by stroke, like current running through a circuit
    const strokes = el.querySelectorAll<SVGGeometryElement>("[data-logo-stroke]");
    strokes.forEach((s) => {
      const len = s.getTotalLength();
      gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
    });
    tl.to(strokes, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut", stagger: 0.15 })
      .to(state, {
        v: 100,
        duration: 1.1,
        ease: "power3.inOut",
        onUpdate: () => {
          if (count.current) count.current.textContent = String(Math.round(state.v)).padStart(3, "0");
        },
      }, 0.1)
      .to(el.querySelector("[data-flash]"), { opacity: 1, duration: 0.08, yoyo: true, repeat: 3 }, 1.15)
      .to(el.querySelector("[data-content]"), { opacity: 0, scale: 1.4, duration: 0.4, ease: "power2.in" }, 1.4)
      .to(el.querySelector("[data-top]"), { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, 1.55)
      .to(el.querySelector("[data-bottom]"), { yPercent: 100, duration: 0.8, ease: "power4.inOut" }, 1.55)
      // Let the hero start revealing while the screen is still splitting open
      .call(() => {
        document.documentElement.dataset.intro = "done";
        try {
          sessionStorage.setItem(INTRO_KEY, "1");
        } catch {}
        announceStageReady();
      }, [], 1.75);

    return () => {
      tl.kill();
      document.documentElement.classList.remove("intro-lock");
    };
  }, []);

  return (
    <div ref={root} aria-hidden="true" className="intro fixed inset-0 z-[100]">
      <div data-top className="absolute inset-x-0 top-0 h-1/2 bg-[#0b0d11]" />
      <div data-bottom className="absolute inset-x-0 bottom-0 h-1/2 bg-[#0b0d11]" />
      <div data-flash className="absolute inset-0 bg-[#5b8cff]/20 opacity-0" />
      <div data-content className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="mx-auto size-28 drop-shadow-[0_0_28px_rgba(143,85,184,.7)]">
            <PsgMark className="size-full" />
          </div>
          <p className="mt-6 font-mono text-sm tracking-[0.4em] text-[#8fa3c7]">POWERING YOUR WORLD</p>
          <p className="mt-2 text-6xl font-extrabold tabular-nums text-white">
            <span ref={count}>000</span>
            <span className="text-gradient">%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
