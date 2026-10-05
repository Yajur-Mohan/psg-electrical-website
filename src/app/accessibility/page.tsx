import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { business } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "Our commitment to WCAG 2.2 AA, how we tested this site, and how to report a barrier.",
};

// MASTER-IMPLEMENTATION §2.4: written after testing, and honest about limitations.
export default function AccessibilityPage() {
  return (
    <>
      <PageHero eyebrow="For everyone" title="Accessibility" accent="statement" />
      <article className="container-site max-w-3xl py-16 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-extrabold [&_li]:mt-1 [&_p]:mt-3 [&_p]:text-[#c3c9d3] [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-[#c3c9d3]">
        <h2>Our commitment</h2>
        <p>We want everyone to be able to use this website. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.</p>

        <h2>What we did</h2>
        <ul>
          <li>Skip-to-content link, landmarks and one main heading per page.</li>
          <li>Every form field has a label, and errors are described in text, not only colour.</li>
          <li>The quote form moves focus to each new question and announces progress to screen readers.</li>
          <li>Buttons and links are at least 44×44 pixels and show a clear focus outline.</li>
          <li>All animation stops when your device is set to reduce motion, and the home-page background animation has a pause button.</li>
          <li>The before/after comparison can be used with the keyboard through a labelled slider.</li>
        </ul>

        <h2>How we tested</h2>
        <p>Automated checks with Lighthouse and axe, plus manual keyboard-only testing at 320px width and 200% zoom. Last reviewed: 2 October 2026.</p>

        <h2>Known limitations</h2>
        <ul>
          <li>Project images are currently illustrations; real photos will need detailed descriptions when added.</li>
          <li>A full screen-reader (NVDA) walkthrough is still to be completed.</li>
        </ul>

        <h2>Tell us about a barrier</h2>
        <p>
          If anything on this site doesn&apos;t work for you, call us on{" "}
          <a className="text-[#a9c1ff] underline" href={`tel:${business.phones[0].e164}`}>{business.phones[0].display}</a> or{" "}
          <a className="text-[#a9c1ff] underline" href={`tel:${business.phones[1].e164}`}>{business.phones[1].display}</a>, WhatsApp
          us, or email <a className="text-[#a9c1ff] underline" href={`mailto:${business.email}`}>{business.email}</a> and
          we&apos;ll help directly. We aim to respond {business.responseTime}.
        </p>
      </article>
    </>
  );
}
