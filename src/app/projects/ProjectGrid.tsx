"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { projects, type ProjectCategory } from "@/lib/site";
import WhatsAppButton from "@/components/whatsapp/WhatsAppButton";
import RippleImage from "@/components/effects/RippleImage";

const IMAGES: Record<ProjectCategory, string> = {
  Commercial: "/projects/commercial.svg",
  Industrial: "/projects/industrial.svg",
  Residential: "/projects/residential.svg",
  Solar: "/projects/solar.svg",
};

const FILTERS: ("All" | ProjectCategory)[] = ["All", "Commercial", "Industrial", "Residential", "Solar"];

export default function ProjectGrid() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const shown = filter === "All" ? projects : projects.filter((p) => p.category === filter);
  const reduce = useReducedMotion();

  return (
    <>
      <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`min-h-11 rounded border px-4 text-sm font-semibold ${
              filter === f ? "border-brand bg-brand text-white" : "border-[#46505d] bg-[#20252c] text-[#c3c9d3]"
            }`}
          >
            {f === "All" ? "All projects" : f}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="mt-4 text-sm text-muted">
        Showing {shown.length} {shown.length === 1 ? "project" : "projects"}
      </p>
      {/* Framer Motion: cards glide to their new spots when the filter changes */}
      <LayoutGroup>
        <motion.ul layout={!reduce} className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p) => (
              <motion.li
                key={p.title}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="flex flex-col overflow-hidden rounded-xl border border-line bg-card"
              >
                <RippleImage
                  src={IMAGES[p.category]}
                  alt={`Illustration of a ${p.category.toLowerCase()} electrical project`}
                  className="h-44"
                />
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-bold text-[#8fb0ff] uppercase">{p.tag}</p>
                  <h2 className="mt-1 text-lg font-bold">{p.title}</h2>
                  <p className="mt-1 text-sm text-muted">{p.text}</p>
                  <WhatsAppButton
                    variant="link"
                    className="mt-auto pt-3"
                    label="Ask about a job like this"
                    message={`Hi PSG Electrical, I saw your "${p.title}" project and I'd like something similar.`}
                  />
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>
    </>
  );
}
