import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import CtaBand from "@/components/ui/CtaBand";
import BeforeAfter from "@/components/effects/BeforeAfter";
import ProjectGrid from "./ProjectGrid";

export const metadata: Metadata = {
  title: "Projects",
  description: "Recent PSG Electrical and Trite Solar projects across commercial, industrial, residential and solar work.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero eyebrow="Proof in the work" title="Our recent" accent="projects">
        Representative electrical, cabling, maintenance and solar projects. Filter by the type of site.
      </PageHero>
      <section className="py-16">
        <div className="container-site">
          <ProjectGrid />
        </div>
      </section>
      <section className="bg-bg-2 py-16" aria-labelledby="ba-h">
        <div className="container-site grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 id="ba-h" className="text-3xl font-extrabold uppercase">Before &amp; after</h2>
            <p className="mt-3 text-muted">
              A commercial distribution board modernisation: circuits separated, labelled and protected.
            </p>
          </div>
          <BeforeAfter
            before="/projects/db-before.svg"
            after="/projects/db-after.svg"
            beforeAlt="Illustration of an old distribution board with tangled, unlabelled wiring"
            afterAlt="Illustration of the upgraded board with labelled breakers and neat wiring"
            caption="Illustrative example. Real project photos will replace these."
          />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
