"use client";

import { useId, useRef, useState, type PointerEvent } from "react";

// Hover-based reveal (MASTER-IMPLEMENTATION §3.4).
// Mouse: a spotlight follows the pointer and shows the "after" image.
// Touch and keyboard: a labelled range slider wipes between the two.
export default function BeforeAfter({
  before,
  after,
  beforeAlt,
  afterAlt,
  caption,
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  caption: string;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setSpot({ x: e.clientX - r.left, y: e.clientY - r.top });
  }

  const clip = spot ? `circle(170px at ${spot.x}px ${spot.y}px)` : `inset(0 0 0 ${split}%)`;

  return (
    <figure className="m-0">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={() => setSpot(null)}
        className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-card"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt={beforeAlt} className="absolute inset-0 size-full object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={after}
          alt={afterAlt}
          className="absolute inset-0 size-full object-cover transition-[clip-path] duration-200 ease-out"
          style={{ clipPath: clip }}
        />
        {!spot && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,.8)]"
            style={{ left: `${split}%` }}
          />
        )}
        <span className="absolute top-3 left-3 rounded bg-black/70 px-2 py-1 text-xs font-bold">Before</span>
        <span className="absolute top-3 right-3 rounded bg-brand px-2 py-1 text-xs font-bold">After</span>
      </div>
      <label htmlFor={id} className="mt-3 block text-sm font-semibold text-muted">
        Compare before and after
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={split}
        onChange={(e) => setSplit(Number(e.target.value))}
        className="mt-1 h-11 w-full accent-[#5b8cff]"
      />
      <figcaption className="mt-1 text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}
