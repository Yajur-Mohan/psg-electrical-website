import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import CtaBand from "@/components/ui/CtaBand";
import Reveal from "@/components/effects/Reveal";
import ElectricFrame from "@/components/effects/ElectricFrame";
import SolarFlow from "@/components/brand/SolarFlow";
import CurrentToClean from "@/components/brand/CurrentToClean";
import { TriteLockup } from "@/components/brand/Logos";
import { solarServices } from "@/lib/site";

export const metadata: Metadata = {
  title: "Trite Solar",
  description: "Trite Solar: smarter energy, smarter living. Hybrid solar, inverters and battery backup from PSG Electrical.",
};

const whySolar = [
  { icon: "☀", text: "Lower electricity costs" },
  { icon: "🌿", text: "Clean and renewable energy" },
  { icon: "⚡", text: "Energy independence" },
  { icon: "🏠", text: "Increases property value" },
  { icon: "♻", text: "Better for the environment" },
];

const didYouKnow = [
  "Solar energy is clean and renewable.",
  "It can reduce electricity bills significantly.",
  "It increases your energy independence.",
  "Lower carbon emissions for a better future.",
  "Long-term savings for your home and business.",
];

export default function TriteSolarPage() {
  return (
    <>
      <PageHero
        eyebrow="Smarter energy. Smarter living."
        title="Powering a"
        accent="cleaner tomorrow."
        tone="solar"
        logo={<TriteLockup className="scale-125 origin-left" />}
      >
        Trite Solar is PSG Electrical&apos;s dedicated solar division, helping homes and businesses harness the power of
        the sun with smart, reliable and affordable solar solutions.
      </PageHero>

      <section className="bg-[#0f140f] py-20" aria-labelledby="sun-h">
        <div className="container-site grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <p className="text-xs font-extrabold tracking-[0.2em] text-trite uppercase">The power of the sun</p>
            <h2 id="sun-h" className="mt-2 text-4xl font-black uppercase sm:text-5xl">
              From sunlight <span className="text-trite-gradient">to your home</span>
            </h2>
            <div className="mt-8 rounded-3xl border border-trite/30 bg-[#121a12] p-4 shadow-[0_0_60px_rgba(140,207,63,.12)] sm:p-6">
              <SolarFlow />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <aside
              aria-labelledby="dyk-h"
              className="relative rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,#ffd46b,#f5b335_55%,#e3920f)] p-8 text-[#2a1c00] shadow-[0_0_80px_rgba(245,179,53,.35)]"
            >
              <span aria-hidden="true" className="absolute -top-5 -right-3 text-6xl">☀</span>
              <h2 id="dyk-h" className="text-2xl font-black uppercase">Did you know?</h2>
              <ul className="mt-5 grid gap-3">
                {didYouKnow.map((d) => (
                  <li key={d} className="flex gap-3 font-semibold">
                    <span aria-hidden="true">✓</span>
                    {d}
                  </li>
                ))}
              </ul>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="py-20" aria-labelledby="why-solar-h">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <h2 id="why-solar-h" className="text-4xl font-black uppercase">
              Why <span className="text-trite-gradient">solar?</span>
            </h2>
            <ul className="mt-6 grid gap-3">
              {whySolar.map((w) => (
                <li key={w.text} className="flex items-center gap-4 rounded-xl border border-trite/25 bg-[#141a14] p-4">
                  <span aria-hidden="true" className="grid size-10 place-items-center rounded-lg bg-trite/15 text-lg">{w.icon}</span>
                  <span className="font-semibold">{w.text}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <div>
            <h2 className="text-4xl font-black uppercase">Built around dependable backup power</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {solarServices.map((s, i) => (
                <li key={s.title}>
                  <Reveal delay={(i % 2) * 0.06} className="h-full">
                    <div className="h-full rounded-xl border border-line bg-card p-6 transition hover:border-trite/60">
                      <span aria-hidden="true" className="grid size-11 place-items-center rounded-lg bg-[#1f2e1c] text-trite">{s.icon}</span>
                      <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                      <p className="mt-1 text-sm text-muted">{s.text}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-site">
          <ElectricFrame color="#8ccf3f" glowColor="#f5b335" radius={24}>
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[linear-gradient(90deg,#132013,#1f3318_60%,#3a3a14)] p-8 md:flex-row md:items-center md:p-12">
              <div>
                <h2 className="text-3xl font-black">Load-shedding ready?</h2>
                <p className="mt-1 text-[#d6dfcf]">Tell us roughly what you want to keep running and we&apos;ll size a system.</p>
              </div>
              <Link data-magnetic href="/quote" className="inline-flex min-h-12 items-center rounded-full bg-trite px-7 font-extrabold text-[#102008]">
                REQUEST A SOLAR QUOTE
              </Link>
            </div>
          </ElectricFrame>
        </div>
      </section>

      <CurrentToClean />
      <CtaBand />
    </>
  );
}
