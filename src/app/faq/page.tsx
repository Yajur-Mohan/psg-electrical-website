import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import CtaBand from "@/components/ui/CtaBand";
import { faqs } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about quotes, compliance certificates, emergencies and solar.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero eyebrow="Questions" title="Frequently asked" accent="questions" />
      <section className="py-16">
        <div className="container-site max-w-3xl">
          {faqs.map((f) => (
            <details key={f.q} className="group mb-3 rounded-xl border border-line bg-card">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold">
                <span>{f.q}</span>
                <span aria-hidden="true" className="text-xl text-brand-bright transition group-open:rotate-45">+</span>
              </summary>
              <p className="px-5 pb-5 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
