import Link from "next/link";
import { business } from "@/lib/site";
import { PsgLockup, TriteLockup } from "@/components/brand/Logos";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#272c34] bg-[#14171c] pt-10 pb-24 text-sm sm:pb-6">
      <div className="container-site grid gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-6">
            <PsgLockup />
            <span aria-hidden="true" className="h-8 w-px bg-line" />
            <TriteLockup />
          </div>
          <p className="mt-3 max-w-sm text-muted">
            Professional electrical engineering, cabling and maintenance for residential, commercial and industrial
            environments. Solar and backup power through {business.solarBrand}.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-widest uppercase">Explore</h2>
          <ul className="mt-3 grid gap-2 text-muted">
            <li><Link href="/services" className="hover:text-white">Services</Link></li>
            <li><Link href="/projects" className="hover:text-white">Projects</Link></li>
            <li><Link href="/about" className="hover:text-white">About &amp; team</Link></li>
            <li><Link href="/partners" className="hover:text-white">Partners</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-widest uppercase">Contact</h2>
          <ul className="mt-3 grid gap-2 text-muted">
            {business.phones.map((p) => (
              <li key={p.e164}>
                <a href={`tel:${p.e164}`} className="hover:text-white">Call {p.display}</a>
                {" · "}
                <a href={`https://wa.me/${p.whatsapp}`} className="hover:text-white">
                  WhatsApp<span className="sr-only"> {p.display}</span>
                </a>
              </li>
            ))}
            {business.emails.map((e) => (
              <li key={e.address} className="break-all">
                <a href={`mailto:${e.address}`} className="hover:text-white">{e.address}</a>
              </li>
            ))}
            <li>Hours: {business.hours}</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-widest uppercase">Get started</h2>
          <ul className="mt-3 grid gap-2 text-muted">
            <li><Link href="/quote" className="hover:text-white">Request a quote</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact us</Link></li>
            <li><Link href="/trite-solar" className="hover:text-white">Trite Solar</Link></li>
          </ul>
        </div>
      </div>
      <div className="container-site mt-8 flex flex-wrap justify-between gap-4 border-t border-[#272c34] pt-5 text-[#9aa3b1]">
        <p>© {new Date().getFullYear()} {business.name}. Built by Team HYDRA for INSY7315.</p>
        <ul className="flex gap-4">
          <li><Link href="/privacy" className="underline hover:text-white">Privacy policy</Link></li>
          <li><Link href="/accessibility" className="underline hover:text-white">Accessibility statement</Link></li>
          <li><Link href="/admin" className="underline hover:text-white">Staff login</Link></li>
        </ul>
      </div>
    </footer>
  );
}
