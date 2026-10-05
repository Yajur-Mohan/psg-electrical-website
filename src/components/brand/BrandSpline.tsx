"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { PsgMark, TriteMark } from "./Logos";
import { business } from "@/lib/site";

// Spline runtime only downloads when a scene is configured
const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

// A small 3D brand moment (MASTER-IMPLEMENTATION §3.0, "Interactive 3D scene").
// With `business.splineScene` set it renders that Spline scene; otherwise it shows
// a Framer Motion tilt card of the logos so the section is never empty.
export default function BrandSpline() {
  const scene = business.splineScene;
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-line bg-[radial-gradient(circle_at_50%_40%,#2a2350,#11131a_70%)]">
      {scene ? (
        <>
          <Spline scene={scene} onLoad={() => setLoaded(true)} className="!absolute inset-0" />
          {!loaded && <TiltLogos />}
        </>
      ) : (
        <TiltLogos />
      )}
    </div>
  );
}

function TiltLogos() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [18, -18]), { stiffness: 150, damping: 15 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-24, 24]), { stiffness: 150, damping: 15 });
  const glowX = useTransform(mx, [-0.5, 0.5], ["30%", "70%"]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 grid place-items-center [perspective:900px]"
      onPointerMove={(e) => {
        if (reduce || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }} className="relative grid place-items-center">
        <motion.div
          style={{ left: glowX }}
          className="absolute top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(143,85,184,.55),transparent_65%)] blur-2xl"
        />
        <div style={{ transform: "translateZ(80px)" }} className="drop-shadow-[0_30px_40px_rgba(0,0,0,.6)]">
          <PsgMark className="size-44 sm:size-56" />
        </div>
        <div style={{ transform: "translateZ(140px) translate(70%, 55%)" }} className="absolute drop-shadow-[0_20px_30px_rgba(0,0,0,.6)]">
          <TriteMark className="size-16 sm:size-20" />
        </div>
      </motion.div>
    </div>
  );
}
