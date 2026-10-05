import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import CtaBand from "@/components/ui/CtaBand";
import Reveal from "@/components/effects/Reveal";
import { reasons, team } from "@/lib/site";
import BrandSpline from "@/components/brand/BrandSpline";
import { PsgMark, TriteMark } from "@/components/brand/Logos";

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
            {team.map((m) => {
              const trite = m.brand === "trite";
              return (
                <li
                  key={m.name}
                  className={`group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 ${
                    trite ? "border-trite/30 hover:border-trite/70" : "border-line hover:border-brand-bright"
                  }`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(145deg,#2a2f3a,#14171d)]">
                    {m.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photo}
                        alt={`${m.name}, ${m.role}`}
                        width={640}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover object-top transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div aria-hidden="true" className="grid size-full place-items-center">
                        <PsgMark className="size-28 opacity-80" />
                      </div>
                    )}
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card to-transparent" />
                    <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-1 ${trite ? "bg-[linear-gradient(90deg,#8ccf3f,#f5b335)]" : "bg-gradient-brand"}`} />
                    <span className="absolute top-3 left-3 rounded-full bg-black/60 p-1.5 backdrop-blur" aria-hidden="true">
                      {trite ? <TriteMark className="size-6" /> : <PsgMark className="size-6" />}
                    </span>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-lg font-bold">{m.name}</h3>
                    <p className={`text-sm font-bold ${trite ? "text-trite" : "text-[#8fb0ff]"}`}>{m.role}</p>
                    <p className="mt-2 text-sm text-muted">{m.text}</p>
                    <ul className="mt-3 flex flex-wrap justify-center gap-2">
                      {m.tags.map((t) => (
                        <li key={t} className="rounded-full border border-[#31486f] bg-[#202d44] px-3 py-1 text-xs text-[#a9c1ff]">{t}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
