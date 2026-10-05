import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import CtaBand from "@/components/ui/CtaBand";
import Reveal from "@/components/effects/Reveal";
import { reasons, team } from "@/lib/site";
import BrandSpline from "@/components/brand/BrandSpline";

export const metadata: Metadata = {
  title: "About & Team",
  description: "Why customers choose PSG Electrical, and the people behind PSG and Trite Solar.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="Built on experience" title="Powering reliability through" accent="expertise.">
        PSG Electrical combines practical industry experience with a disciplined approach to safety, workmanship and
        dependable electrical solutions.
      </PageHero>

      <section className="py-20" aria-labelledby="why-h">
        <div className="container-site">
          <h2 id="why-h" className="text-3xl font-extrabold uppercase">Why choose PSG Electrical?</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((r, i) => (
              <li key={r.title}>
                <Reveal delay={(i % 3) * 0.06} className="h-full">
                  <div className="h-full rounded-xl border border-line bg-card p-6">
                    <span aria-hidden="true" className="grid size-11 place-items-center rounded-lg bg-[#1d2a44] text-brand-bright">{r.icon}</span>
                    <h3 className="mt-4 text-lg font-bold">{r.title}</h3>
                    <p className="mt-1 text-sm text-muted">{r.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20" aria-labelledby="brand3d-h">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-extrabold tracking-[0.15em] text-[#9aa3b1] uppercase">Two brands, one team</p>
            <h2 id="brand3d-h" className="mt-1 text-4xl font-black uppercase">
              <span className="text-gradient">PSG Electrical</span> &amp; <span className="text-trite-gradient">Trite Solar</span>
            </h2>
            <p className="mt-4 text-muted">
              PSG Electrical and Cables keeps homes and businesses safely powered today. Trite Solar, our solar division,
              builds the sustainable tomorrow. Move your cursor over the logo.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <BrandSpline />
          </Reveal>
        </div>
      </section>

      <section className="bg-bg-2 py-20" aria-labelledby="team-h">
        <div className="container-site">
          <p className="text-xs font-extrabold tracking-[0.15em] text-[#9aa3b1] uppercase">Our team</p>
          <h2 id="team-h" className="mt-1 text-3xl font-extrabold uppercase">Technical experience. Human service.</h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {team.map((m) => (
              <li key={m.name} className="rounded-xl border border-line bg-card p-6 text-center">
                <div aria-hidden="true" className="mx-auto grid size-24 place-items-center rounded-full border-2 border-[#3a4350] bg-[linear-gradient(145deg,#343b46,#1b1f25)] text-2xl font-bold text-[#9aa6b8]">
                  {m.initials}
                </div>
                <h3 className="mt-4 text-lg font-bold">{m.name}</h3>
                <p className="text-sm font-bold text-[#8fb0ff]">{m.role}</p>
                <p className="mt-2 text-sm text-muted">{m.text}</p>
                <ul className="mt-3 flex flex-wrap justify-center gap-2">
                  {m.tags.map((t) => (
                    <li key={t} className="rounded-full border border-[#31486f] bg-[#202d44] px-3 py-1 text-xs text-[#a9c1ff]">{t}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
