"use client";

import { useState } from "react";
import { projects, type ProjectCategory } from "@/lib/site";

const FILTERS: ("All" | ProjectCategory)[] = ["All", "Commercial", "Industrial", "Residential", "Solar"];

export default function ProjectGrid() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const shown = filter === "All" ? projects : projects.filter((p) => p.category === filter);

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
      <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <li key={p.title} className="overflow-hidden rounded-xl border border-line bg-card">
            <div aria-hidden="true" className="grid h-40 place-items-center bg-[linear-gradient(145deg,#39404a,#1c2026)] font-extrabold tracking-widest text-[#9aa3b1] uppercase">
              {p.category}
            </div>
            <div className="p-5">
              <p className="text-xs font-bold text-[#8fb0ff] uppercase">{p.tag}</p>
              <h2 className="mt-1 text-lg font-bold">{p.title}</h2>
              <p className="mt-1 text-sm text-muted">{p.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
