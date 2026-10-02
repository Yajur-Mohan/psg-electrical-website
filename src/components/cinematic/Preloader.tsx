"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { announceStageReady } from "@/lib/stage";

export const INTRO_KEY = "psg-intro-seen";

// Inline script for <head>: decides before first paint whether the intro plays,
// so returning visitors (and reduced-motion users) never see a flash of it.
export const introScript = `try{var m=matchMedia('(prefers-reduced-motion: reduce)').matches;document.documentElement.dataset.intro=(m||sessionStorage.getItem('${INTRO_KEY}'))?'done':'play'}catch(e){document.documentElement.dataset.intro='done'}`;

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
    tl.fromTo(el.querySelector("[data-bolt]"), { strokeDashoffset: 120 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" })
      .to(state, {
        v: 100,
        duration: 1.1,
        ease: "power3.inOut",
        onUpdate: () => {
          if (count.current) count.current.textContent = String(Math.round(state.v)).padStart(3, "0");
        },
      }, 0.1)
      .to(el.querySelector("[data-bolt]"), { fill: "#5b8cff", duration: 0.2 }, 1.0)
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
          <svg viewBox="0 0 24 24" className="mx-auto size-24 drop-shadow-[0_0_24px_rgba(91,140,255,.8)]">
            <path
              data-bolt
              d="M13 2 4 14h6l-1 8 9-12h-6z"
              fill="transparent"
              stroke="#5b8cff"
              strokeWidth="1.2"
              strokeLinejoin="round"
              strokeDasharray="120"
            />
          </svg>
          <p className="mt-6 font-mono text-sm tracking-[0.4em] text-[#8fa3c7]">POWERING UP</p>
          <p className="mt-2 text-6xl font-extrabold tabular-nums text-white">
            <span ref={count}>000</span>
            <span className="text-gradient">%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
