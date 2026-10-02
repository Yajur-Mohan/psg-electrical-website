"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// WebGL particle field from Originkit, loaded lazily so it never blocks first paint.
const CursorRingField = dynamic(() => import("@/components/originkit/ui/cursor-ring-field"), {
  ssr: false,
});

// Stands in for the hero video from MASTER-IMPLEMENTATION §3.2 until real
// footage exists. Same rules apply: decorative, pausable (WCAG 2.2.2), and
// a static fallback under reduced motion or on small screens.
export default function HeroBackdrop() {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const live = !reduced && !paused && wide;

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,#2b3a66_0,#1d2333_35%,#171a20_70%)]" />
        {live && (
          <div className="absolute inset-0 opacity-70">
            <CursorRingField
              background="transparent"
              colors={["#2d6cff", "#7b45f5", "#d736e8"]}
              density={220}
              speed={4}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,26,32,.97)_0%,rgba(23,26,32,.82)_45%,rgba(23,26,32,.25)_100%)]" />
      </div>
      {!reduced && wide && (
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
          className="absolute right-4 bottom-4 z-20 min-h-11 rounded-full border border-white/30 bg-black/50 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-black/70"
        >
          {paused ? "Play background animation" : "Pause background animation"}
        </button>
      )}
    </>
  );
}
