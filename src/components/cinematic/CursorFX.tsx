"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Desktop-only pointer effects:
//  - a soft electric glow that trails the cursor
//  - a ring that swells over links and buttons
//  - "magnetic" pull on any element marked data-magnetic
// Decorative only; the native cursor is kept so nothing is hidden from users.
export default function CursorFX() {
  const glow = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced || !glow.current || !ring.current) return;

    gsap.set([glow.current, ring.current], { xPercent: -50, yPercent: -50, opacity: 1 });
    const gx = gsap.quickTo(glow.current, "x", { duration: 0.9, ease: "power3" });
    const gy = gsap.quickTo(glow.current, "y", { duration: 0.9, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.18, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.18, ease: "power3" });

    let magnet: HTMLElement | null = null;

    function onMove(e: PointerEvent) {
      gx(e.clientX);
      gy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);

      const target = (e.target as HTMLElement).closest<HTMLElement>("a, button, [data-magnetic]");
      gsap.to(ring.current, { scale: target ? 2.2 : 1, opacity: target ? 0.9 : 0.5, duration: 0.25 });

      const m = (e.target as HTMLElement).closest<HTMLElement>("[data-magnetic]");
      if (magnet && magnet !== m) gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        gsap.to(m, { x: dx * 0.3, y: dy * 0.35, duration: 0.4, ease: "power3" });
      }
    }

    function onLeave() {
      gsap.to([glow.current, ring.current], { opacity: 0, duration: 0.3 });
    }
    function onEnter() {
      gsap.to(glow.current, { opacity: 1, duration: 0.3 });
      gsap.to(ring.current, { opacity: 0.5, duration: 0.3 });
    }

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[85] overflow-hidden">
      <div
        ref={glow}
        className="absolute top-0 left-0 size-[420px] rounded-full opacity-0 mix-blend-screen"
        style={{ background: "radial-gradient(circle, rgba(91,140,255,.16) 0%, rgba(123,69,245,.08) 35%, transparent 70%)" }}
      />
      <div ref={ring} className="absolute top-0 left-0 size-6 rounded-full border border-[#8fb0ff] opacity-0" />
    </div>
  );
}
