import { business } from "@/lib/site";

type Link = { text: string; href: string; hint?: string };
type Item = { icon: string; label: string; links?: Link[]; value?: string };

// Direct contact details stay visible next to every form (MASTER-IMPLEMENTATION §1.1).
export default function ContactDetails() {
  const items: Item[] = [
    {
      icon: "☎",
      label: "Call",
      links: business.phones.map((p) => ({ text: p.display, href: `tel:${p.e164}` })),
    },
    {
      icon: "✆",
      label: "WhatsApp",
      links: business.phones.map((p) => ({ text: p.display, href: `https://wa.me/${p.whatsapp}` })),
    },
    {
      icon: "✉",
      label: "Email",
      links: business.emails.map((e) => ({ text: e.address, href: `mailto:${e.address}`, hint: e.label })),
    },
    { icon: "◷", label: "Hours", value: business.hours },
    { icon: "⚡", label: "Emergencies", value: business.emergency },
    { icon: "⌖", label: "Service area", value: business.serviceArea },
  ];
  return (
    <ul className="grid gap-3">
      {items.map((i) => (
        <li key={i.label} className="flex gap-4 rounded-lg border border-line bg-card p-4">
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#1d2a44] text-brand-bright">
            {i.icon}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold">{i.label}</span>
            {i.links ? (
              <span className="flex flex-col gap-1">
                {i.links.map((l) => (
                  <span key={l.href} className="break-all">
                    <a
                      href={l.href}
                      className="inline-flex min-h-6 items-center text-[#a9c1ff] underline hover:text-white"
                      aria-label={l.hint ? `${l.text} (${l.hint})` : undefined}
                    >
                      {l.text}
                    </a>
                    {l.hint && <span className="ml-2 text-xs text-muted">{l.hint}</span>}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-muted">{i.value}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
