"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { nav } from "@/lib/site";
import { announceStageReady } from "@/lib/stage";

const LABELS: Record<string, string> = {
  ...Object.fromEntries(nav.map((n) => [n.href, n.label])),
  "/quote": "Get a quote",
  "/partners": "Partners",
  "/privacy": "Privacy",
  "/accessibility": "Accessibility",
  "/admin": "Staff",
};

// Jump to the top instantly, both natively and inside Lenis
function resetScroll() {
  window.__lenis?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

const labelFor = (path: string) => LABELS[path] ?? LABELS["/" + path.split("/")[1]] ?? "PSG Electrical";

// Cinematic curtain between pages: three brand panels sweep up and cover the
// screen, the route changes underneath, then the panels sweep away.
// Intercepts internal link clicks only; skipped entirely under reduced motion.
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLParagraphElement>(null);
  const pending = useRef(false);
  const busy = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // same page or hash link: let Lenis handle it
      if (url.pathname.startsWith("/api")) return;

      // Capture phase on window runs before Next's <Link> handler, so we own the navigation
      e.preventDefault();
      e.stopPropagation();
      if (busy.current) return;
      busy.current = true;
      pending.current = true;

      const panels = root.current!.querySelectorAll("[data-panel]");
      if (label.current) label.current.textContent = labelFor(url.pathname);
      document.documentElement.dataset.transitioning = "true";
      gsap.set(root.current, { visibility: "visible" });

      // Navigate once, either when the curtain closes or after a timeout in case
      // animation frames are paused (background tab), so a click never gets stuck
      let navigated = false;
      const navigate = () => {
        if (navigated) return;
        navigated = true;
        resetScroll();
        router.push(url.pathname + url.search + url.hash, { scroll: false });
      };
      window.setTimeout(navigate, 1200);

      gsap
        .timeline({ onComplete: navigate })
        .fromTo(panels, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: "power4.inOut", stagger: 0.07 })
        .fromTo(label.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, "-=0.25");
    }

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router]);

  // Route has changed underneath the curtain: reset scroll and reveal.
  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    resetScroll();

    const panels = root.current!.querySelectorAll("[data-panel]");
    gsap
      .timeline({
        delay: 0.1,
        onComplete: () => {
          gsap.set(root.current, { visibility: "hidden" });
          busy.current = false;
          document.getElementById("main")?.focus({ preventScroll: true });
        },
      })
      .to(label.current, { opacity: 0, y: -30, duration: 0.25 })
      .to(panels, { yPercent: -100, duration: 0.6, ease: "power4.inOut", stagger: { each: 0.07, from: "end" } }, "-=0.1")
      .call(() => {
        document.documentElement.dataset.transitioning = "false";
        announceStageReady();
      }, [], "-=0.45");
  }, [pathname]);

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]" style={{ visibility: "hidden" }}>
      <div data-panel className="absolute inset-0 bg-[#2463f0]" />
      <div data-panel className="absolute inset-0 bg-[#7b45f5]" />
      <div data-panel className="absolute inset-0 grid place-items-center bg-[#0d0f13]">
        <div className="text-center">
          <svg viewBox="0 0 24 24" className="mx-auto size-14 text-[#5b8cff]" fill="currentColor">
            <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
          </svg>
          <p ref={label} className="mt-4 text-4xl font-extrabold tracking-tight text-white uppercase sm:text-6xl" />
        </div>
      </div>
    </div>
  );
}
