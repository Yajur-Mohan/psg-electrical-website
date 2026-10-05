// Single source of truth for business content.
// Copy comes from the team's PSG live prototype and the HYDRA Task 1 documentation.
// Contact details confirmed by the client (Oct 2026). Service area still to confirm.

export const business = {
  name: "PSG Electrical and Cables",
  shortName: "PSG Electrical",
  solarBrand: "Trite Solar",
  tagline: "Powering what matters.",
  // Primary contact, used wherever only one link fits (chatbot, error messages)
  phoneDisplay: "082 603 9283",
  phoneE164: "+27826039283",
  whatsapp: "27826039283",
  email: "keoran@psgelectrical.co.za",
  // Both numbers take calls and WhatsApp messages
  phones: [
    { display: "082 603 9283", e164: "+27826039283", whatsapp: "27826039283" },
    { display: "072 752 0848", e164: "+27727520848", whatsapp: "27727520848" },
  ],
  emails: [
    { address: "keoran@psgelectrical.co.za", label: "PSG Electrical" },
    { address: "keoran@tritesolar.co.za", label: "Trite Solar" },
    { address: "trite@polka.co.za", label: "General" },
  ],
  hours: "07:00–18:00",
  emergency: "24/7 emergency call-outs",
  serviceArea: "Residential, commercial and industrial sites across the region",
  responseTime: "within one working day",
  // Public Spline scene URL (https://prod.spline.design/<id>/scene.splinecode) for the About page 3D brand moment
  splineScene: "",
} as const;

export type Service = {
  slug: string;
  title: string;
  icon: string;
  summary: string;
  points: string[];
};

export const services: Service[] = [
  {
    slug: "installations",
    title: "Electrical Installations",
    icon: "⚡",
    summary: "New installations, upgrades and electrical infrastructure work.",
    points: ["Residential installations", "Commercial fit-outs", "Industrial electrical work"],
  },
  {
    slug: "fault-finding",
    title: "Fault Finding",
    icon: "⌁",
    summary: "Methodical troubleshooting for electrical faults and performance issues.",
    points: ["Fault diagnosis", "Testing and verification", "Corrective recommendations"],
  },
  {
    slug: "db-boards",
    title: "Distribution Boards",
    icon: "▦",
    summary: "DB board installation, upgrades, repairs and circuit organisation.",
    points: ["New DB installations", "Upgrades and replacements", "Safety inspection"],
  },
  {
    slug: "compliance",
    title: "Compliance (CoC)",
    icon: "✓",
    summary: "Inspection and testing towards a Certificate of Compliance (SANS 10142-1).",
    points: ["System inspections", "Compliance checks", "Documentation support"],
  },
  {
    slug: "maintenance",
    title: "Maintenance & Repairs",
    icon: "↻",
    summary: "Scheduled and responsive maintenance to support reliable operation.",
    points: ["Preventative maintenance", "Emergency repairs", "System upgrades"],
  },
  {
    slug: "solar",
    title: "Solar & Backup Power",
    icon: "☀",
    summary: "Delivered through Trite Solar for homes and businesses.",
    points: ["Solar panels", "Inverters", "Battery backup"],
  },
];

export const solarServices = [
  { icon: "☀", title: "Solar Panels", text: "Supply and installation of solar generation systems." },
  { icon: "⚡", title: "Hybrid Systems", text: "Integrated inverter, solar and battery configurations." },
  { icon: "▣", title: "Battery Backup", text: "Energy storage for continuity during outages." },
  { icon: "↻", title: "Maintenance", text: "System checks, performance support and maintenance." },
  { icon: "↗", title: "Upgrades", text: "Capacity and component upgrades for existing systems." },
  { icon: "▦", title: "Commercial Solar", text: "Scalable solar solutions for business requirements." },
];

export type ProjectCategory = "Commercial" | "Industrial" | "Residential" | "Solar";

export const projects: { tag: string; title: string; text: string; category: ProjectCategory }[] = [
  { tag: "DB upgrade", title: "Commercial Distribution Board Modernisation", text: "Old board replaced, circuits labelled and protection brought up to standard.", category: "Commercial" },
  { tag: "Cabling", title: "Industrial Structured Electrical Cabling", text: "Cable routing and containment for a working industrial floor.", category: "Industrial" },
  { tag: "Upgrade", title: "Residential Home Electrical Upgrade", text: "Rewiring and safety improvements for a family home.", category: "Residential" },
  { tag: "Solar + battery", title: "Solar Hybrid Backup System", text: "Trite Solar system combining generation, inverter and battery backup.", category: "Solar" },
  { tag: "Maintenance", title: "Commercial Planned Maintenance", text: "Scheduled inspections and maintenance for business operations.", category: "Commercial" },
  { tag: "Fault diagnosis", title: "Industrial Electrical Fault Investigation", text: "Structured troubleshooting for a complex intermittent fault.", category: "Industrial" },
];

export const team = [
  { initials: "RG", name: "Ricky Govender", role: "Founder / Electrical Specialist", text: "Leadership grounded in more than three decades of electrical industry experience.", tags: ["Electrical", "Leadership"] },
  { initials: "KG", name: "Keoran Govender", role: "Trite Solar Founder", text: "Solar and backup-power leadership focused on practical renewable-energy systems.", tags: ["Solar", "Hybrid systems"] },
  { initials: "PSG", name: "PSG Project Team", role: "Technical & Customer Support", text: "Installations, maintenance, site support and customer coordination across projects.", tags: ["Projects", "Support"] },
];

export const reasons = [
  { icon: "✓", title: "Certified Safety", text: "Safety and compliance are treated as core project requirements, not afterthoughts." },
  { icon: "⌁", title: "Industry Experience", text: "Decades of practical experience across electrical environments and project types." },
  { icon: "⚙", title: "Professional Processes", text: "Clear assessment, technical planning and structured execution from enquiry to completion." },
  { icon: "↻", title: "Responsive Maintenance", text: "Support for planned maintenance, repairs and urgent electrical issues." },
  { icon: "◆", title: "Client-Centred Delivery", text: "Communication and practical project visibility are designed into the customer journey." },
  { icon: "↗", title: "Optimised Efficiency", text: "Solutions are selected around reliability, maintainability and the needs of the site." },
];

export const stats = [
  { value: "25+", label: "Years of industry experience" },
  { value: "24/7", label: "Emergency support availability" },
  { value: "3", label: "Client environments" },
  { value: "100%", label: "Focus on safe workmanship" },
];

export const faqs = [
  { q: "Do I need an account to get a quote?", a: "No. Answer three quick questions and leave a phone number. We'll WhatsApp or text you back." },
  { q: "Can you issue a Certificate of Compliance (CoC)?", a: "Yes. We inspect and test installations against SANS 10142-1 and can issue a CoC once the installation complies." },
  { q: "Do you handle emergencies after hours?", a: "Yes, 24/7 emergency support is available for urgent electrical faults. Call us directly rather than using the quote form." },
  { q: "Who installs solar and battery backup?", a: "Our solar division, Trite Solar, designs and installs hybrid solar, inverter and battery systems." },
  { q: "How quickly will I hear back?", a: `We aim to reply ${business.responseTime} during business hours.` },
  { q: "What areas do you work in?", a: "Residential, commercial and industrial sites. Ask us when you request a quote and we'll confirm." },
];

export const partners = [
  { name: "Inverter & battery suppliers", text: "Hybrid inverters and lithium storage for Trite Solar systems." },
  { name: "Cable & switchgear wholesalers", text: "SABS-approved cable, breakers and distribution boards." },
  { name: "Panel manufacturers", text: "Tier-1 solar PV modules for residential and commercial roofs." },
  { name: "Compliance inspectors", text: "Independent verification for larger commercial installations." },
];

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/trite-solar", label: "Trite Solar" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

/** WhatsApp click-to-chat link with a pre-filled message (defaults to the primary number). */
export function whatsappLink(message: string, number: string = business.whatsapp): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
