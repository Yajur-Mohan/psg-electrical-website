import type { Metadata } from "next";
import QuoteFlow from "@/components/quote/QuoteFlow";
import ContactDetails from "@/components/ui/ContactDetails";

export const metadata: Metadata = {
  title: "Get a Quote",
  description: "Get an electrical or solar quote in three quick questions. We'll WhatsApp or text you back.",
};

export default function QuotePage() {
  return (
    <section className="grid-lines bg-bg-2 py-16">
      <div className="container-site">
        <h1 className="text-4xl font-extrabold uppercase">
          Get a <span className="text-gradient">free quote</span>
        </h1>
        <p className="mt-2 mb-8 max-w-xl text-muted">Three quick questions. No long forms, no account needed.</p>
        <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
          <QuoteFlow sourcePage="/quote" />
          <aside aria-labelledby="direct-h">
            <h2 id="direct-h" className="text-2xl font-extrabold">Prefer to call?</h2>
            <p className="mt-2 mb-5 text-muted">For emergencies, please phone us rather than using the form.</p>
            <ContactDetails />
          </aside>
        </div>
      </div>
    </section>
  );
}
