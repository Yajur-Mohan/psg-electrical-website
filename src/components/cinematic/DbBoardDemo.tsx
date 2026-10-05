"use client";

import { useState } from "react";

type Circuit = "lighting" | "power" | "security" | "solar";

const CIRCUITS: { id: Circuit; label: string; color: string }[] = [
  { id: "lighting", label: "Lighting", color: "#ffd166" },
  { id: "power", label: "Power", color: "#5b8cff" },
  { id: "security", label: "Security", color: "#ea357a" },
  { id: "solar", label: "Solar", color: "#8ccf3f" },
];

// "Live demo" from the brand poster: a distribution board whose main isolator and
// breakers actually power a little house. Switches are real role="switch" buttons.
export default function DbBoardDemo() {
  const [main, setMain] = useState(true);
  const [on, setOn] = useState<Record<Circuit, boolean>>({ lighting: true, power: true, security: false, solar: true });
  const live = (c: Circuit) => main && on[c];
  const count = CIRCUITS.filter((c) => live(c.id)).length;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
      {/* The board */}
      <div className="relative rounded-3xl border border-[#3a3f4c] bg-[linear-gradient(160deg,#e9ecf2,#c9ced8)] p-5 shadow-[0_30px_80px_rgba(0,0,0,.5)] sm:p-7">
        <div className="mb-5 flex items-center justify-between rounded-lg bg-[#14171d] px-4 py-2.5">
          <p className="text-xs font-black tracking-[0.2em] text-white sm:text-sm">POWERING YOUR WORLD</p>
          <span aria-hidden="true" className={`text-lg ${main ? "text-psg-pink drop-shadow-[0_0_8px_#ea357a]" : "text-[#555]"}`}>⚡</span>
        </div>
        <div role="group" aria-label="Distribution board" className="grid grid-cols-5 gap-2 sm:gap-3">
          <Breaker label="Main isolator" short="MAIN" checked={main} onToggle={() => setMain((m) => !m)} color="#ffffff" isMain />
          {CIRCUITS.map((c) => (
            <Breaker
              key={c.id}
              label={c.label}
              short={c.label.toUpperCase()}
              checked={on[c.id]}
              live={live(c.id)}
              color={c.color}
              onToggle={() => setOn((s) => ({ ...s, [c.id]: !s[c.id] }))}
            />
          ))}
        </div>
        {/* Cables down to the house */}
        <svg aria-hidden="true" viewBox="0 0 500 70" className="mt-3 h-14 w-full" preserveAspectRatio="none">
          {CIRCUITS.map((c, i) => {
            const x = 150 + i * 100; // centre of each breaker column (5 columns across 500)
            return (
              <path
                key={c.id}
                d={`M${x} 0 C ${x} 40, 250 30, 250 70`}
                fill="none"
                stroke={live(c.id) ? c.color : "#7a808c"}
                strokeWidth="5"
                strokeLinecap="round"
                className={live(c.id) ? "cable-live" : ""}
              />
            );
          })}
        </svg>
      </div>

      {/* The house */}
      <div className="text-center">
        <House lit={live("lighting")} power={live("power")} security={live("security")} solar={live("solar")} />
        <p role="status" className="mt-4 text-sm text-muted">
          {!main
            ? "Main isolator is off: the whole house is dead. That's how electricians make a board safe to work on."
            : count === 4
              ? "Every circuit is live. Solar is feeding the house."
              : `${count} of 4 circuits live. Each breaker protects its own circuit.`}
        </p>
      </div>
    </div>
  );
}

function Breaker({
  label,
  short,
  checked,
  live = checked,
  color,
  onToggle,
  isMain = false,
}: {
  label: string;
  short: string;
  checked: boolean;
  live?: boolean;
  color: string;
  onToggle: () => void;
  isMain?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${label} breaker`}
      onClick={onToggle}
      className={`group flex min-h-36 flex-col items-center justify-between rounded-lg border border-[#9aa1ad] px-1 py-2 text-[#1d2129] shadow-inner sm:min-h-40 ${
        isMain ? "bg-[#d7dbe3]" : "bg-[#eef0f4]"
      }`}
    >
      <span className="text-[9px] font-black tracking-wider sm:text-[10px]">{short}</span>
      <span className="relative h-16 w-8 rounded-md bg-[#2a2e36] p-1 shadow-[inset_0_2px_6px_rgba(0,0,0,.6)]">
        <span
          className={`absolute inset-x-1 h-7 rounded bg-gradient-to-b from-[#4a505c] to-[#1b1e24] shadow transition-all duration-200 ${
            checked ? "top-1" : "top-8"
          }`}
        />
      </span>
      <span
        aria-hidden="true"
        className="size-3 rounded-full transition"
        style={{ background: live ? color : "#6b7280", boxShadow: live ? `0 0 12px ${color}` : "none" }}
      />
    </button>
  );
}

function House({ lit, power, security, solar }: { lit: boolean; power: boolean; security: boolean; solar: boolean }) {
  const glow = lit ? "#ffd166" : "#1b1f27";
  return (
    <svg viewBox="0 0 320 240" className="mx-auto w-full max-w-md" role="img" aria-label="House showing which circuits are on">
      {/* solar panels */}
      <g transform="translate(150 28) rotate(-14)">
        {[0, 1, 2].map((i) => (
          <rect key={i} x={i * 34} y="0" width="30" height="22" rx="2" fill={solar ? "#1e3a8a" : "#2a2f3a"} stroke={solar ? "#8ccf3f" : "#444"} strokeWidth="2" />
        ))}
      </g>
      {/* body */}
      <path d="M40 110 160 30 280 110" fill="none" stroke="#9aa1ad" strokeWidth="10" strokeLinejoin="round" />
      <rect x="62" y="105" width="196" height="120" fill="#2b2f38" />
      {/* windows */}
      {[[85, 130], [205, 130], [85, 178], [205, 178]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="32" height="28" rx="3" fill={glow} style={{ filter: lit ? "drop-shadow(0 0 10px #ffd166)" : "none" }} className="transition-all duration-300" />
      ))}
      {/* door + wifi/tv from the power circuit */}
      <rect x="145" y="165" width="30" height="60" rx="3" fill="#191c22" />
      <g opacity={power ? 1 : 0.15} className="transition-opacity">
        <path d="M152 140a12 12 0 0 1 16 0M148 134a20 20 0 0 1 24 0" stroke="#5b8cff" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="160" cy="146" r="3" fill="#5b8cff" />
      </g>
      {/* security light */}
      <circle cx="266" cy="100" r="6" fill={security ? "#ea357a" : "#3b3f48"} style={{ filter: security ? "drop-shadow(0 0 10px #ea357a)" : "none" }} />
      {security && <path d="M266 100 300 150 240 150Z" fill="#ea357a" opacity=".12" />}
      <rect x="20" y="225" width="280" height="6" rx="3" fill="#2b2f38" />
    </svg>
  );
}
