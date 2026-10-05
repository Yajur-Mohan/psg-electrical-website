"use client";

import { usePathname } from "next/navigation";
import { nav, whatsappLink } from "@/lib/site";
import WhatsAppIcon from "./WhatsAppIcon";

const PAGE_NAMES: Record<string, string> = {
  ...Object.fromEntries(nav.map((n) => [n.href, n.label])),
  "/quote": "Quote",
  "/partners": "Partners",
};

// Floating "WhatsApp an electrician" button on every public page, bottom-left so
// it never collides with Sparky (bottom-right). The message says which page they're on.
export default function WhatsAppFloat() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const page = PAGE_NAMES[pathname];
  const message = page && pathname !== "/"
    ? `Hi PSG Electrical, I'm on your ${page} page and I'd like some help.`
    : "Hi PSG Electrical, I'd like some help with an electrical or solar job.";

  return (
    <aside aria-label="Quick contact">
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      data-magnetic
      className="wa-float group fixed bottom-20 left-4 z-[70] flex min-h-14 items-center gap-2 rounded-full bg-[#25d366] pr-4 pl-3 font-extrabold text-[#06301a] shadow-2xl sm:bottom-6"
    >
      <WhatsAppIcon className="size-8" />
      <span className="text-sm">
        WhatsApp<span className="hidden sm:inline"> an electrician</span>
      </span>
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
    </aside>
  );
}
