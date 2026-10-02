"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const ElectricBorder = dynamic(() => import("@/components/originkit/ui/electricborder"), { ssr: false });

// Wraps a card in Originkit's crackling electric outline. Purely decorative:
// the content sits above it and a static border is shown under reduced motion.
export default function ElectricFrame({
  children,
  color = "#5b8cff",
  glowColor = "#7b45f5",
  radius = 16,
  className = "",
}: {
  children: ReactNode;
  color?: string;
  glowColor?: string;
  radius?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className={`relative ${className}`} style={{ borderRadius: radius }}>
      {reduced ? (
        <div aria-hidden="true" className="absolute inset-0 border-2" style={{ borderRadius: radius, borderColor: color }} />
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <ElectricBorder
            color={color}
            bgColor="transparent"
            glowColor={glowColor}
            borderRadius={radius}
            speed={0.8}
            chaos={3}
            thickness={2}
            glowIntensity={6}
          />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
