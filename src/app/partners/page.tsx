import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import CtaBand from "@/components/ui/CtaBand";
import { partners } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Partners",
  description: "The suppliers and specialists PSG Electrical and Trite Solar work with.",
};

// TODO(client): replace the partner categories with named partners once permission to list them is confirmed.
export default function PartnersPage() {
  return (
    <>
      <PageHero eyebrow="Working together" title="Our" accent="partners">
        Quality work depends on quality components. These are the kinds of partners behind every PSG and Trite Solar
        installation.
      </PageHero>
      <section className="py-20">
        <ul className="container-site grid gap-5 sm:grid-cols-2">
          {partners.map((p) => (
            <li key={p.name} className="rounded-xl border border-line bg-card p-6">
              <h2 className="text-lg font-bold">{p.name}</h2>
              <p className="mt-1 text-muted">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand />
    </>
  );
}
