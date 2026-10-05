import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { business } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PSG Electrical collects, uses and protects your personal information under POPIA.",
};

// POPIA basics (MASTER-IMPLEMENTATION §1.5, HYDRA §6.4). General guidance, not legal advice.
export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="POPIA" title="Privacy" accent="policy" />
      <article className="container-site max-w-3xl py-16 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-extrabold [&_li]:mt-1 [&_p]:mt-3 [&_p]:text-[#c3c9d3] [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-[#c3c9d3]">
        <p>
          {business.name} (including {business.solarBrand}) respects your privacy and processes personal information in
          line with the Protection of Personal Information Act, 2013 (POPIA).
        </p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Quote requests:</strong> the service you chose, the rough job size, your phone number and, if you give it, your first name and any note you add.</li>
          <li><strong>General enquiries:</strong> your name, a phone number or email address, and your message.</li>
          <li><strong>Technical data:</strong> your browser type, used only to fix problems with the site. We do not log full phone numbers.</li>
        </ul>

        <h2>Why we collect it</h2>
        <p>Only to reply to you about the quote or question you sent. We will not use your number for marketing unless you separately agree to it.</p>

        <h2>Who sees it</h2>
        <p>Only PSG office staff who handle quotes and enquiries. We do not sell or share your information with third parties.</p>

        <h2>How long we keep it</h2>
        <p>Enquiries that don&apos;t become a job are deleted after 12 months. If you become a customer, records are kept as long as the law requires for invoices and compliance certificates.</p>

        <h2>How we protect it</h2>
        <p>Data is sent over HTTPS, stored in a database only staff can access, and staff logins use hashed passwords and expiring sessions.</p>

        <h2>Your rights</h2>
        <p>
          You can ask to see, correct or delete your information at any time. Contact us on{" "}
          <a className="text-[#a9c1ff] underline" href={`tel:${business.phones[0].e164}`}>{business.phones[0].display}</a>,{" "}
          <a className="text-[#a9c1ff] underline" href={`tel:${business.phones[1].e164}`}>{business.phones[1].display}</a> or{" "}
          <a className="text-[#a9c1ff] underline" href={`mailto:${business.email}`}>{business.email}</a>. You may also
          complain to the Information Regulator of South Africa.
        </p>
        <p className="text-sm">Last updated: 2 October 2026.</p>
      </article>
    </>
  );
}
