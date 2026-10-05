"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { whatsappLink } from "@/lib/site";
import WhatsAppIcon from "@/components/whatsapp/WhatsAppIcon";

const CursorRingField = dynamic(() => import("@/components/originkit/ui/cursor-ring-field"), { ssr: false });

// Closing "scene" before the quote form: Originkit particle field behind a
// headline that scales up from small as it enters, like a title card.
export default function OutroCta() {
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-title]",
        { scale: 0.6, opacity: 0.2, letterSpacing: "0.2em" },
        {
          scale: 1,
          opacity: 1,
          letterSpacing: "-0.03em",
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 85%", end: "center 55%", scrub: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} className="relative grid min-h-[80svh] place-items-center overflow-hidden bg-[#05060a]" aria-labelledby="outro-h">
      {!reduced && (
        <div aria-hidden="true" className="absolute inset-0 opacity-80">
          <CursorRingField background="transparent" colors={["#2463f0", "#7b45f5", "#d736e8"]} density={260} speed={4} />
        </div>
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#05060a_75%)]" />
      <div className="relative z-10 px-4 text-center">
        <h2 id="outro-h" data-title className="text-[clamp(2.5rem,8vw,7rem)] leading-[0.92] font-extrabold uppercase">
          Ready to <br />
          <span className="text-gradient">switch on?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-lg text-[#c3c9d3]">Three quick questions, or WhatsApp a real electrician right now.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link data-magnetic href="#quote" className="bg-gradient-brand inline-flex min-h-14 items-center rounded-full px-8 text-lg font-extrabold">
            Start my quote
          </Link>
          <a
            data-magnetic
            href={whatsappLink("Hi PSG Electrical, I'm ready to switch on. Can we chat about my job?")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-14 items-center gap-2 rounded-full bg-[#25d366] px-8 text-lg font-extrabold text-[#06301a]"
          >
            <WhatsAppIcon className="size-6" />
            WhatsApp us
            <span className="sr-only"> (opens WhatsApp in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
