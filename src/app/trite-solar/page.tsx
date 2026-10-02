import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import CtaBand from "@/components/ui/CtaBand";
import Reveal from "@/components/effects/Reveal";
import ElectricFrame from "@/components/effects/ElectricFrame";
import { solarServices } from "@/lib/site";

export const metadata: Metadata = {
  title: "Trite Solar",
  description: "Trite Solar: hybrid solar, inverters and battery backup for homes and businesses, from PSG Electrical.",
};

export default function TriteSolarPage() {
  return (
    <>
      <PageHero eyebrow="Trite Solar" title="Powering a" accent="cleaner tomorrow." tone="solar">
        Solar, hybrid systems, inverters and battery backup for residential and commercial energy needs.
      </PageHero>
      <section className="py-20" aria-labelledby="solar-services-h">
        <div className="container-site">
          <h2 id="solar-services-h" className="text-3xl font-extrabold uppercase">Built around dependable backup power</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {solarServices.map((s, i) => (
              <li key={s.title}>
                <Reveal delay={(i % 3) * 0.06} className="h-full">
                  <div className="h-full rounded-xl border border-line bg-card p-6">
                    <span aria-hidden="true" className="grid size-11 place-items-center rounded-lg bg-[#1f2e1c] text-solar">{s.icon}</span>
                    <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted">{s.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="pb-20">
        <div className="container-site">
          <ElectricFrame color="#9bd454" glowColor="#3fbf6a">
            <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-[#1b2a20] p-8 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-extrabold">Load-shedding ready?</h2>
                <p className="mt-1 text-[#cfd8cf]">Tell us roughly what you want to keep running and we&apos;ll size a system.</p>
              </div>
              <Link href="/quote" className="inline-flex min-h-12 items-center rounded bg-solar px-6 font-extrabold text-[#13200f]">
                REQUEST A SOLAR QUOTE
              </Link>
            </div>
          </ElectricFrame>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
