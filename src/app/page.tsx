import Link from "next/link";
import CinematicHero from "@/components/cinematic/CinematicHero";
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
      <CinematicHero />

      <ScrollTextReveal
        kicker="25+ years on the tools"
        text="We wire homes, power businesses and keep industry running. Safely, neatly, and certified to standard, every single time."
      />

      <VelocityMarquee items={["Installations", "Fault finding", "DB boards", "Compliance", "Solar", "Battery backup"]} />

      <HorizontalServices />

      <Storyline steps={story} />

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

      <section className="pb-24" aria-labelledby="solar-h">
        <div className="container-site">
          <Reveal>
            <ElectricFrame color="#9bd454" glowColor="#3fbf6a" radius={24}>
              <div className="grid items-center gap-6 rounded-3xl bg-[linear-gradient(90deg,#18211e,#21352c_60%,#384631)] p-8 md:grid-cols-[2fr_1fr] md:p-14">
                <div>
                  <p className="text-xs font-extrabold tracking-[0.15em] text-solar uppercase">Powering a cleaner tomorrow</p>
                  <h2 id="solar-h" className="mt-2 text-4xl font-extrabold uppercase sm:text-5xl">Trite Solar</h2>
                  <p className="mt-3 text-[#cfd8cf]">
                    Our solar division brings the same technical focus to hybrid solar, inverters and battery backup.
                  </p>
                </div>
                <Link data-magnetic href="/trite-solar" className="inline-flex min-h-12 items-center justify-center rounded-full bg-solar px-6 font-extrabold text-[#13200f]">
                  EXPLORE TRITE SOLAR
                </Link>
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
