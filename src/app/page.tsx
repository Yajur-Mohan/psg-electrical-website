import Link from "next/link";
import PowerJourney from "@/components/journey/PowerJourney";
import ScrollTextReveal from "@/components/cinematic/ScrollTextReveal";
import HorizontalServices from "@/components/cinematic/HorizontalServices";
import VelocityMarquee from "@/components/cinematic/VelocityMarquee";
import StatCounters from "@/components/cinematic/StatCounters";
import OutroCta from "@/components/cinematic/OutroCta";
import Reveal from "@/components/effects/Reveal";
import ElectricFrame from "@/components/effects/ElectricFrame";
import BeforeAfter from "@/components/effects/BeforeAfter";
import Storyline from "@/components/effects/Storyline";
import KineticBanner from "@/components/effects/KineticBanner";
import QuoteFlow from "@/components/quote/QuoteFlow";
import ContactDetails from "@/components/ui/ContactDetails";
import DbBoardDemo from "@/components/cinematic/DbBoardDemo";
import CurrentToClean from "@/components/brand/CurrentToClean";
import SolarFlow from "@/components/brand/SolarFlow";
import { TriteLockup } from "@/components/brand/Logos";

const story = [
  { label: "Step 1", title: "Tell us what you need", text: "Three quick questions, or a phone call. No long forms." },
  { label: "Step 2", title: "We assess the site", text: "A qualified electrician scopes the job and sends a clear quote." },
  { label: "Step 3", title: "Safe, tidy installation", text: "Work done to SANS 10142-1, with progress updates along the way." },
  { label: "Step 4", title: "Tested and certified", text: "Everything is tested, and a Certificate of Compliance issued where required." },
];

// The home page is directed like a short film: title sequence → statement →
// services reel → process → proof → numbers → solar → closing scene → quote.
export default function Home() {
  return (
    <>
      <PowerJourney />

      <ScrollTextReveal
        kicker="25+ years on the tools"
        text="We wire homes, power businesses and keep industry running. Safely, neatly, and certified to standard, every single time."
      />

      <VelocityMarquee items={["Installations", "Fault finding", "DB boards", "Compliance", "Solar", "Battery backup"]} />

      <HorizontalServices />

      <Storyline steps={story} />

      <section className="relative overflow-hidden py-24" aria-labelledby="demo-h">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-brand opacity-60" />
        <div className="container-site">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-psg-pink/50 bg-psg-pink/10 px-3 py-1 text-xs font-extrabold tracking-[0.2em] text-[#ff8fb6] uppercase">
              ⚡ Live demo ⚡
            </p>
            <h2 id="demo-h" className="mt-4 text-4xl font-black uppercase sm:text-5xl">
              Flip the <span className="text-gradient">switches</span>
            </h2>
            <p className="mt-3 mb-10 max-w-xl text-muted">
              This is how we power homes, businesses and a sustainable future. Try the main isolator, then each circuit.
            </p>
          </Reveal>
          <DbBoardDemo />
        </div>
      </section>

      <section className="py-24" aria-labelledby="work-h">
        <div className="container-site grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <p className="text-xs font-extrabold tracking-[0.15em] text-[#9aa3b1] uppercase">Proof in the work</p>
            <h2 id="work-h" className="mt-1 text-4xl font-extrabold uppercase sm:text-5xl">
              See the <span className="text-gradient">difference</span>
            </h2>
            <p className="mt-4 text-muted">
              Hover over the board (or drag the slider) to compare an overloaded, unlabelled distribution board with a
              compliant PSG upgrade.
            </p>
            <Link href="/projects" className="mt-6 inline-flex min-h-11 items-center font-bold text-[#a9c1ff] underline">
              View more projects
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <BeforeAfter
              before="/projects/db-before.svg"
              after="/projects/db-after.svg"
              beforeAlt="Illustration of an old distribution board with tangled, unlabelled wiring"
              afterAlt="Illustration of the same board after a PSG upgrade, with labelled breakers and neat wiring"
              caption="Illustrative example. Real project photos will replace these."
            />
          </Reveal>
        </div>
      </section>

      <KineticBanner text="SAFE · COMPLIANT · RELIABLE" />

      <section className="py-24" aria-labelledby="stats-h">
        <div className="container-site">
          <h2 id="stats-h" className="sr-only">PSG in numbers</h2>
          <StatCounters />
        </div>
      </section>

      <CurrentToClean />

      <section className="bg-[#0f140f] py-24" aria-labelledby="solar-h">
        <div className="container-site">
          <Reveal>
            <ElectricFrame color="#8ccf3f" glowColor="#f5b335" radius={28}>
              <div className="grid items-center gap-10 rounded-[1.75rem] bg-[linear-gradient(120deg,#121a12,#1a2a16_55%,#2f2f12)] p-8 md:p-12 lg:grid-cols-[1fr_1.2fr]">
                <div>
                  <TriteLockup />
                  <h2 id="solar-h" className="mt-6 text-4xl font-black uppercase sm:text-5xl">
                    Smarter energy. <br />
                    <span className="text-trite-gradient">Smarter living.</span>
                  </h2>
                  <p className="mt-4 text-[#d6dfcf]">
                    Our solar division brings the same technical focus to hybrid solar, inverters and battery backup.
                  </p>
                  <Link data-magnetic href="/trite-solar" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-trite px-7 font-extrabold text-[#102008]">
                    EXPLORE TRITE SOLAR
                  </Link>
                </div>
                <SolarFlow />
              </div>
            </ElectricFrame>
          </Reveal>
        </div>
      </section>

      <OutroCta />

      <section id="quote" className="grid-lines scroll-mt-24 bg-bg-2 py-24" aria-label="Get a quote">
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
