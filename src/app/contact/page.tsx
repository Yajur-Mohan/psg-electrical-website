import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import ContactForm from "@/components/contact/ContactForm";
import ContactDetails from "@/components/ui/ContactDetails";
import QuoteFlow from "@/components/quote/QuoteFlow";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Call, WhatsApp or email PSG Electrical, or send a quick message. Emergency support available 24/7.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Speak to the team" title="Connect with the" accent="experts.">
        Need a price? Use the three-question quote below. Anything else, send us a message or reach us directly.
      </PageHero>

      <section className="grid-lines bg-bg-2 py-16" aria-label="Get a quote">
        <div className="container-site max-w-3xl">
          <QuoteFlow sourcePage="/contact" />
        </div>
      </section>

      <section className="py-16">
        <div className="container-site grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold">Send a general enquiry</h2>
            <p className="mt-2 mb-6 text-muted">
              Questions about an existing job, partnerships or anything that isn&apos;t a quote.
            </p>
            <ContactForm />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold">Reach us directly</h2>
            <p className="mt-2 mb-6 text-muted">
              If anything on this site doesn&apos;t work for you, call us and we&apos;ll help.{" "}
              <Link href="/accessibility" className="text-[#a9c1ff] underline">Accessibility statement</Link>
            </p>
            <ContactDetails />
          </div>
        </div>
      </section>
    </>
  );
}
