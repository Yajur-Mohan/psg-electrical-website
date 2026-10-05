import { PsgMark, TriteMark } from "./Logos";

// "From current to clean energy": the poster's bridge between PSG and Trite Solar.
// A plug in PSG purple runs a cable that turns green and ends in a leaf.
export default function CurrentToClean() {
  return (
    <section aria-labelledby="c2c-h" className="relative overflow-hidden border-y border-line bg-[#0d0f13] py-14">
      <div className="container-site flex flex-col items-center gap-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-3">
          <PsgMark className="size-12" />
          <div>
            <p className="font-black tracking-[0.08em]">PSG ELECTRICAL AND CABLES</p>
            <p className="text-sm text-muted">Powering today.</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center gap-2 md:px-6">
          <h2 id="c2c-h" className="text-center text-2xl font-black tracking-tight uppercase sm:text-3xl">
            <span className="text-gradient">From current</span> <span className="text-trite-gradient">to clean energy</span>
          </h2>
          <svg aria-hidden="true" viewBox="0 0 400 40" className="h-10 w-full max-w-md">
            <defs>
              <linearGradient id="c2c-cable" x1="0" x2="1">
                <stop offset="0" stopColor="#8f55b8" />
                <stop offset="0.5" stopColor="#5b8cff" />
                <stop offset="1" stopColor="#8ccf3f" />
              </linearGradient>
            </defs>
            {/* plug */}
            <rect x="4" y="12" width="26" height="16" rx="4" fill="#8f55b8" />
            <rect x="0" y="15" width="6" height="3" fill="#c9cde0" />
            <rect x="0" y="22" width="6" height="3" fill="#c9cde0" />
            <path className="cable-live" d="M30 20 C 120 -6, 200 46, 280 20 S 360 10, 366 20" fill="none" stroke="url(#c2c-cable)" strokeWidth="5" strokeLinecap="round" />
            {/* leaf */}
            <path d="M366 20c2-12 14-18 30-18-1 16-12 26-30 18Z" fill="#8ccf3f" />
          </svg>
        </div>

        <div className="flex items-center gap-3">
          <TriteMark className="size-12" />
          <div>
            <p className="font-black tracking-[0.08em]">TRITE <span className="text-trite">SOLAR</span></p>
            <p className="text-sm text-muted">Building a sustainable tomorrow.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
