"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { services } from "@/lib/site";

// Pinned horizontal "film reel" of services on desktop: vertical scroll drives
// the track sideways. Phones and reduced-motion users get a normal grid.
export default function HorizontalServices() {
  const reduced = usePrefersReducedMotion();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (reduced || !section.current || !track.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const t = track.current!;
      const distance = () => t.scrollWidth - window.innerWidth + 64;
      const tween = gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.8,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
      // Each card tilts into place as it enters the frame
      t.querySelectorAll<HTMLElement>("[data-card]").forEach((card) => {
        gsap.fromTo(
          card,
          { rotateY: -18, opacity: 0.35, scale: 0.92 },
          {
            rotateY: 0,
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 95%", end: "left 55%", scrub: true },
          },
        );
      });
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <section ref={section} className="relative overflow-hidden py-20 lg:flex lg:min-h-screen lg:flex-col lg:justify-center" aria-labelledby="reel-h">
      <div className="container-site mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold tracking-[0.15em] text-[#9aa3b1] uppercase">Specialised services</p>
          <h2 id="reel-h" className="mt-1 text-4xl font-extrabold uppercase sm:text-5xl">
            Built for <span className="text-gradient">real-world</span> demands
          </h2>
        </div>
        <p className="hidden text-sm tracking-[0.2em] text-muted lg:block" aria-hidden="true">SCROLL →</p>
      </div>
      <ul
        ref={track}
        className="grid gap-5 px-4 sm:grid-cols-2 lg:flex lg:w-max lg:gap-6 lg:pr-16 lg:pl-[max(16px,calc((100vw-1180px)/2))] [perspective:1200px]"
      >
        {services.map((s, i) => (
          <li key={s.slug} data-card className="lg:w-[380px] lg:shrink-0">
            <Link
              href={`/services#${s.slug}`}
              className="group relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-3xl border border-line bg-[linear-gradient(160deg,#252b36,#181b22)] p-8 transition-colors hover:border-brand-bright"
            >
              <span aria-hidden="true" className="absolute -top-6 -right-2 text-[9rem] leading-none font-extrabold text-white/[0.04]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span aria-hidden="true" className="grid size-14 place-items-center rounded-2xl bg-[#1d2a44] text-2xl text-brand-bright transition group-hover:scale-110 group-hover:bg-brand group-hover:text-white">
                {s.icon}
              </span>
              <h3 className="mt-8 text-2xl font-extrabold">{s.title}</h3>
              <p className="mt-2 text-muted">{s.summary}</p>
              <ul className="mt-auto grid gap-1 pt-6 text-sm text-[#c3c9d3]">
                {s.points.map((p) => (
                  <li key={p}>— {p}</li>
                ))}
              </ul>
              <span aria-hidden="true" className="bg-gradient-brand absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
