"use client";

import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const GlassCurlReveal = dynamic(() => import("@/components/originkit/ui/glass-curl-reveal"), { ssr: false });

// Featured project: Originkit glass-curl-reveal settles the image out of rippled
// glass as it scrolls into view. Static image under reduced motion.
export default function FeaturedReveal() {
  const reduced = usePrefersReducedMotion();
  const image = { src: "/projects/solar.svg", alt: "Illustration of a Trite Solar hybrid system: rooftop panels and a battery" };
  return (
    <section className="py-16" aria-labelledby="featured-h">
      <div className="container-site grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-trite uppercase">Featured project</p>
          <h2 id="featured-h" className="mt-2 text-4xl font-black uppercase">
            Solar hybrid <span className="text-trite-gradient">backup system</span>
          </h2>
          <p className="mt-3 text-muted">
            Panels, hybrid inverter and lithium storage, designed by Trite Solar so the lights stay on through load
            shedding.
          </p>
        </div>
        <div className="aspect-[8/5] overflow-hidden rounded-2xl border border-line">
          {reduced ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.src} alt={image.alt} className="size-full object-cover" />
          ) : (
            <>
              <span className="sr-only">{image.alt}</span>
              <GlassCurlReveal image={image} trigger="scroll" rounded={16} ripples={18} amount={45} tint="#8ccf3f" style={{ width: "100%", height: "100%" }} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
