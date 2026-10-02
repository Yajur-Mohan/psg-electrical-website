import Link from "next/link";
import HeroBackdrop from "@/components/effects/HeroBackdrop";
import Reveal from "@/components/effects/Reveal";
import ElectricFrame from "@/components/effects/ElectricFrame";
import BeforeAfter from "@/components/effects/BeforeAfter";
import Storyline from "@/components/effects/Storyline";
import KineticBanner from "@/components/effects/KineticBanner";
import QuoteFlow from "@/components/quote/QuoteFlow";
import ContactDetails from "@/components/ui/ContactDetails";
import ArrowLink from "@/components/ui/ArrowLink";
import { services, stats } from "@/lib/site";

const story = [
  { label: "Step 1", title: "Tell us what you need", text: "Three quick questions, or a phone call. No long forms." },
  { label: "Step 2", title: "We assess the site", text: "A qualified electrician scopes the job and sends a clear quote." },
  { label: "Step 3", title: "Safe, tidy installation", text: "Work done to SANS 10142-1, with progress updates along the way." },
  { label: "Step 4", title: "Tested and certified", text: "Everything is tested, and a Certificate of Compliance issued where required." },
];

export default function Home() {
  return (
    <>
      <section className="relative flex min-h-[600px] items-center overflow-hidden">
        <HeroBackdrop />
        <div className="container-site relative z-10 py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Professional Electrical Solutions</p>
            <h1 className="mt-6 text-5xl leading-[0.95] font-extrabold tracking-tight uppercase sm:text-6xl">
              Powering <br /> <span className="text-gradient">what matters.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-[#c3c9d3]">
              Expert electrical engineering and cabling for residential, commercial and industrial sites. Technical
              precision where reliability is non-negotiable.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ArrowLink href="#quote" label="GET A FREE QUOTE" />
              <Link href="/services" className="inline-flex min-h-12 items-center rounded-full border border-[#59606c] bg-[#2d3138] px-6 font-extrabold">
                EXPLORE SERVICES
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20" aria-labelledby="services-h">
        <div className="container-site">
          <Reveal>
            <p className="text-xs font-extrabold tracking-[0.15em] text-[#9aa3b1] uppercase">Specialised services</p>
            <h2 id="services-h" className="mt-1 text-3xl font-extrabold uppercase">Built for real-world demands</h2>
          </Reveal>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <li key={s.slug}>
                <Reveal delay={i * 0.05} className="h-full">
                  <Link href={`/services#${s.slug}`} className="block h-full rounded-xl border border-line bg-card p-6 transition hover:-translate-y-1 hover:border-brand-bright">
                    <span aria-hidden="true" className="grid size-11 place-items-center rounded-lg bg-[#1d2a44] text-brand-bright">{s.icon}</span>
                    <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted">{s.summary}</p>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Storyline steps={story} />

      <section className="py-20" aria-labelledby="work-h">
        <div className="container-site grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <p className="text-xs font-extrabold tracking-[0.15em] text-[#9aa3b1] uppercase">Proof in the work</p>
            <h2 id="work-h" className="mt-1 text-3xl font-extrabold uppercase">See the difference</h2>
            <p className="mt-4 text-muted">
              Hover over the board (or drag the slider) to compare an overloaded, unlabelled distribution board with a
              compliant PSG upgrade.
            </p>
            <Link href="/projects" className="mt-6 inline-flex min-h-11 items-center font-bold text-[#a9c1ff] underline">
              View more projects
            </Link>
          </Reveal>
          <BeforeAfter
            before="/projects/db-before.svg"
            after="/projects/db-after.svg"
            beforeAlt="Illustration of an old distribution board with tangled, unlabelled wiring"
            afterAlt="Illustration of the same board after a PSG upgrade, with labelled breakers and neat wiring"
            caption="Illustrative example. Real project photos will replace these."
          />
        </div>
      </section>

      <KineticBanner text="SAFE · COMPLIANT · RELIABLE" />

      <section className="py-16" aria-labelledby="stats-h">
        <div className="container-site">
          <h2 id="stats-h" className="sr-only">PSG in numbers</h2>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <li key={s.label} className="rounded-xl border border-line bg-card p-6 text-center">
                <strong className="block text-3xl">{s.value}</strong>
                <span className="text-sm text-muted">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pb-20" aria-labelledby="solar-h">
        <div className="container-site">
          <ElectricFrame color="#9bd454" glowColor="#3fbf6a">
            <div className="grid items-center gap-6 rounded-2xl bg-[linear-gradient(90deg,#18211e,#21352c_60%,#384631)] p-8 md:grid-cols-[2fr_1fr] md:p-12">
              <div>
                <p className="text-xs font-extrabold tracking-[0.15em] text-solar uppercase">Powering a cleaner tomorrow</p>
                <h2 id="solar-h" className="mt-2 text-3xl font-extrabold uppercase">Trite Solar</h2>
                <p className="mt-3 text-[#cfd8cf]">
                  Our solar division brings the same technical focus to hybrid solar, inverters and battery backup.
                </p>
              </div>
              <Link href="/trite-solar" className="inline-flex min-h-12 items-center justify-center rounded bg-solar px-6 font-extrabold text-[#13200f]">
                EXPLORE TRITE SOLAR
              </Link>
            </div>
          </ElectricFrame>
        </div>
      </section>

      <section id="quote" className="grid-lines scroll-mt-24 bg-bg-2 py-20" aria-label="Get a quote">
        <div className="container-site grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
          <QuoteFlow sourcePage="/" />
          <div>
            <h2 className="text-2xl font-extrabold">Rather talk to someone?</h2>
            <p className="mt-2 mb-5 text-muted">Call, WhatsApp or email us directly. We&apos;re happy to help.</p>
            <ContactDetails />
          </div>
        </div>
      </section>
    </>
  );
}
