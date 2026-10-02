"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

// Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger stays in sync
// (MASTER-IMPLEMENTATION §3.3). Skipped entirely under reduced motion.
// Also publishes --scroll-progress and --scroll-velocity for CSS-driven effects.
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ anchors: { offset: -90 }, lerp: 0.085, wheelMultiplier: 0.9 });
    window.__lenis = lenis;
    const docStyle = document.documentElement.style;
    lenis.on("scroll", (l: Lenis) => {
      ScrollTrigger.update();
      docStyle.setProperty("--scroll-progress", String(l.progress || 0));
      docStyle.setProperty("--scroll-velocity", String(Math.max(-40, Math.min(40, l.velocity))));
    });
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // New page content means new pin spacers and trigger positions
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
