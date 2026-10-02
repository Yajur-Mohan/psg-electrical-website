"use client";

import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const KineticTextGrid = dynamic(() => import("@/components/originkit/ui/appear-text"), { ssr: false });

// Decorative kinetic type band (Originkit appear-text). Screen readers get the
// plain sentence once; the animated grid is hidden from them.
export default function KineticBanner({ text }: { text: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <section className="relative h-[260px] overflow-hidden border-y border-line bg-black" aria-label="Our promise">
      <p className="sr-only">{text}</p>
      {reduced ? (
        <p aria-hidden="true" className="grid h-full place-items-center px-4 text-center text-3xl font-extrabold tracking-tight text-white/80 uppercase sm:text-5xl">
          {text}
        </p>
      ) : (
        <div aria-hidden="true" className="h-full w-full">
          <KineticTextGrid
            text={text}
            textColor="#5b8cff"
            backgroundColor="#000000"
            rowCount={4}
            repeatCount={4}
            font={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: 48, lineHeight: "1.2em", letterSpacing: "-0.02em", textAlign: "left" }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}
    </section>
  );
}
