import { useId } from "react";

// Vector recreations of the PSG and Trite Solar marks from the team's brand poster.
// Inline SVG so gradients stay crisp at any size and can be animated.

type MarkProps = { className?: string; title?: string };

/** PSG mark: a house outline with a keyhole-shaped plug inside, blue → purple → pink. */
export function PsgMark({ className = "size-10", title }: MarkProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={`psg-${id}`} x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2f9ee5" />
          <stop offset="0.5" stopColor="#8f55b8" />
          <stop offset="1" stopColor="#ea357a" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#psg-${id})`} strokeWidth="11" strokeLinejoin="miter">
        <path data-logo-stroke d="M52 90.5H14.5V41L50 10l35.5 31v49.5" />
        <path data-logo-stroke d="M50 90.5V66" />
        <circle data-logo-stroke cx="50" cy="55" r="10" />
      </g>
    </svg>
  );
}

/** Trite Solar mark: three grey solar tiles with a green leaf in the fourth slot. */
export function TriteMark({ className = "size-10", title }: MarkProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={`tile-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a39d95" />
          <stop offset="1" stopColor="#77716a" />
        </linearGradient>
        <linearGradient id={`leaf-${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#4f9a2a" />
          <stop offset="1" stopColor="#b5d334" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="44" height="44" rx="2" fill={`url(#tile-${id})`} />
      <rect x="4" y="52" width="44" height="44" rx="2" fill={`url(#tile-${id})`} />
      <rect x="52" y="52" width="44" height="44" rx="2" fill={`url(#tile-${id})`} />
      <path d="M54 46C54 22 72 7 97 4c1 26-14 42-43 42Z" fill={`url(#leaf-${id})`} />
      <path d="M57 43C68 30 80 20 92 10" stroke="#1d3a12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Full PSG lockup for headers and footers. */
export function PsgLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <PsgMark className={compact ? "size-9" : "size-11"} />
      <span className="leading-none">
        <span className="block text-lg font-black tracking-[0.04em] text-white">PSG</span>
        <span className="mt-0.5 block text-[10px] font-bold tracking-[0.18em] text-[#c9cde0]">ELECTRICAL AND CABLES</span>
      </span>
    </span>
  );
}

/** Full Trite Solar lockup. */
export function TriteLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <TriteMark className="size-11" />
      <span className="leading-none">
        <span className="block text-lg font-black tracking-[0.06em] text-[#e9e6e1]">TRITE</span>
        <span className="block text-lg font-black tracking-[0.06em] text-trite">SOLAR</span>
      </span>
    </span>
  );
}
