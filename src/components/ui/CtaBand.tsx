import Link from "next/link";
import WhatsAppButton from "@/components/whatsapp/WhatsAppButton";
import FillLink from "./FillLink";

export default function CtaBand() {
  return (
    <section className="bg-[linear-gradient(90deg,#1450d8,#2e6bff_60%,#3549c8)] py-9">
      <div className="container-site flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-extrabold">READY TO POWER YOUR NEXT PROJECT?</h2>
          <p className="text-white/90">Three quick questions, or WhatsApp us and chat to an electrician.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <FillLink href="/quote" label="GET A QUOTE" />
          <WhatsAppButton message="Hi PSG Electrical, I'd like a quote for a job." label="WHATSAPP US" />
          <Link href="/contact" className="inline-flex min-h-11 items-center rounded border border-white/70 px-5 font-extrabold">
            CONTACT US
          </Link>
        </div>
      </div>
    </section>
  );
}
