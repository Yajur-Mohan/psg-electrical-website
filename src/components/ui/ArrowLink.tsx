"use client";

import ArrowRevealButton from "@/components/originkit/ui/arrow-reveal-button";

// Primary CTA using Originkit's arrow-reveal button (renders a real <a>).
export default function ArrowLink({ href, label }: { href: string; label: string }) {
  return (
    <ArrowRevealButton
      label={label}
      link={href}
      colors={{ fill: "#2d6cff", textColor: "#ffffff" }}
      border={{ borderColor: "#5b8cff", borderStyle: "solid", borderWidth: 2 }}
      padding="14px 48px 14px 22px"
      font={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: 14, letterSpacing: "0.04em" }}
      icon={{ type: "symbol", symbol: "→", side: "left", size: 18, padding: 10, rounded: 100, background: "#ffffff", color: "#2d6cff" }}
      gap={16}
      newTab={false}
    />
  );
}
