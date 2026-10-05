// "The power of the sun" diagram from the Trite Solar poster panel.
// Animated green current flows sun → panels → inverter → battery → home.
// Decorative motion only; the steps are also listed as text for screen readers.

const STEPS = [
  { id: "sun", label: "Sunlight", text: "Free energy, every day" },
  { id: "panels", label: "Solar panels", text: "Turn light into DC power" },
  { id: "inverter", label: "Inverter", text: "Converts DC to the AC your home uses" },
  { id: "battery", label: "Battery storage", text: "Keeps the lights on through load shedding" },
  { id: "home", label: "Your home", text: "Runs on clean, cheaper power" },
];

export default function SolarFlow() {
  return (
    <figure className="m-0">
      <svg viewBox="0 0 560 300" className="w-full" aria-hidden="true">
        <defs>
          <radialGradient id="sf-sun">
            <stop offset="0" stopColor="#ffe08a" />
            <stop offset="0.6" stopColor="#f5b335" />
            <stop offset="1" stopColor="#e8890c" />
          </radialGradient>
          <filter id="sf-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* current paths */}
        <g fill="none" stroke="#8ccf3f" strokeWidth="4" strokeLinecap="round" filter="url(#sf-glow)" className="cable-live">
          <path d="M92 92 L150 120" />
          <path d="M240 150 L240 190 L300 190" />
          <path d="M370 190 L420 190 L420 150" />
          <path d="M420 150 L470 150 L470 205" />
        </g>

        {/* sun */}
        <g className="sun-spin" style={{ transformOrigin: "60px 70px" }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x="57" y="16" width="6" height="16" rx="3" fill="#f5b335" transform={`rotate(${i * 30} 60 70)`} />
          ))}
        </g>
        <circle cx="60" cy="70" r="28" fill="url(#sf-sun)" filter="url(#sf-glow)" />

        {/* panels */}
        <g transform="translate(150 95) skewX(-12)">
          <rect width="150" height="58" rx="4" fill="#1e3a8a" stroke="#c9cde0" strokeWidth="3" />
          {[1, 2, 3, 4].map((i) => <line key={i} x1={i * 30} y1="0" x2={i * 30} y2="58" stroke="#93c5fd" strokeOpacity=".5" />)}
          <line x1="0" y1="29" x2="150" y2="29" stroke="#93c5fd" strokeOpacity=".5" />
        </g>

        {/* inverter */}
        <rect x="300" y="165" width="70" height="52" rx="6" fill="#d9dde4" />
        <rect x="314" y="176" width="42" height="14" rx="2" fill="#0d1a10" />
        <text x="335" y="187" fontSize="9" fontWeight="800" textAnchor="middle" fill="#8ccf3f">5 kW</text>
        <circle cx="335" cy="204" r="4" fill="#8ccf3f" filter="url(#sf-glow)" />

        {/* battery */}
        <rect x="395" y="95" width="50" height="58" rx="6" fill="#20262f" stroke="#8ccf3f" strokeWidth="2" />
        <rect x="410" y="89" width="20" height="7" rx="2" fill="#8ccf3f" />
        <path d="M424 106 412 126h10l-4 16 14-22h-10z" fill="#8ccf3f" filter="url(#sf-glow)" />

        {/* home */}
        <path d="M440 238 470 210 500 238" fill="none" stroke="#c9cde0" strokeWidth="6" strokeLinejoin="round" />
        <rect x="448" y="236" width="44" height="40" fill="#2b2f38" />
        <rect x="456" y="246" width="12" height="12" fill="#ffd166" filter="url(#sf-glow)" />
        <rect x="474" y="246" width="12" height="12" fill="#ffd166" filter="url(#sf-glow)" />

        {/* labels */}
        <g fontSize="11" fontWeight="800" fill="#c9cde0" letterSpacing="1">
          <text x="60" y="126" textAnchor="middle">SUNLIGHT</text>
          <text x="210" y="172" textAnchor="middle">SOLAR PANELS</text>
          <text x="335" y="236" textAnchor="middle">INVERTER</text>
          <text x="420" y="80" textAnchor="middle">BATTERY</text>
          <text x="470" y="292" textAnchor="middle">YOUR HOME</text>
        </g>
      </svg>
      <figcaption>
        <ol className="sr-only">
          {STEPS.map((s) => (
            <li key={s.id}>
              {s.label}: {s.text}
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
