import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import CtaBand from "@/components/ui/CtaBand";
import Reveal from "@/components/effects/Reveal";
import { services } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Electrical installations, fault finding, DB boards, CoC compliance, maintenance and solar backup power.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Engineering excellence" title="Our" accent="services">
        Specialised electrical engineering, structured cabling and renewable-energy solutions for residential,
        commercial and industrial sites.
      </PageHero>

      <section className="py-20">
        <div className="container-site grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 0.06}>
              <article id={s.slug} className="flex h-full scroll-mt-28 flex-col rounded-xl border border-line bg-card p-6">
                <span aria-hidden="true" className="grid size-11 place-items-center rounded-lg bg-[#1d2a44] text-brand-bright">{s.icon}</span>
                <h2 className="mt-4 text-xl font-bold">{s.title}</h2>
                <p className="mt-1 text-muted">{s.summary}</p>
                <ul className="mt-4 grid gap-1 text-sm text-[#c3c9d3]">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2"><span aria-hidden="true" className="text-success">✓</span>{p}</li>
                  ))}
                </ul>
                <Link
                  href={s.slug === "solar" ? "/trite-solar" : "/quote"}
                  className="mt-auto pt-6 font-bold text-[#a9c1ff] underline"
                >
                  {s.slug === "solar" ? "Explore Trite Solar" : `Get a quote for ${s.title.toLowerCase()}`}
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
