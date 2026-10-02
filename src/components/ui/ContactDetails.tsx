import { business } from "@/lib/site";

// Direct contact details stay visible next to every form (MASTER-IMPLEMENTATION §1.1).
export default function ContactDetails() {
  const items = [
    { icon: "☎", label: "Call", value: business.phoneDisplay, href: `tel:${business.phoneE164}` },
    { icon: "✆", label: "WhatsApp", value: "Chat with us", href: `https://wa.me/${business.whatsapp}` },
    { icon: "✉", label: "Email", value: business.email, href: `mailto:${business.email}` },
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
          <span>
            <span className="block text-sm font-bold">{i.label}</span>
            {i.href ? (
              <a href={i.href} className="text-[#a9c1ff] underline hover:text-white">
                {i.value}
              </a>
            ) : (
              <span className="text-muted">{i.value}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
