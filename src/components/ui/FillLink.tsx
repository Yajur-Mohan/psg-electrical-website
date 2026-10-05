"use client";

import SlideFillButton from "@/components/originkit/ui/slide-fill-button";

// Banner CTA built on Originkit's slide-fill-button: white face that fills
// with PSG blue "water" on hover. Renders a real <a>.
export default function FillLink({ href, label }: { href: string; label: string }) {
  return (
    <SlideFillButton
      label={label}
      link={href}
      padding="12px 22px"
      rounded={6}
      colors={{ fill: "#ffffff", textColor: "#1239a6" }}
      water={{ color: "#0d1b4a", textColor: "#ffffff", direction: "up", waveSpeed: 60, defaultFill: 0 }}
      font={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: 15, letterSpacing: "0.02em" }}
      border={{ borderWidth: 0 }}
    />
  );
}
