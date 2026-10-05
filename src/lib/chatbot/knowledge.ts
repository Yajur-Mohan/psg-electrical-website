// Rule-based knowledge for "Sparky", the PSG / Trite Solar assistant.
// Each intent lists trigger keywords (stems are fine: "trip" matches "tripping")
// and optional phrases that score extra. General guidance only; anything
// dangerous or job-specific is handed to a qualified electrician.

import { business } from "../site.ts";

export type Link = { label: string; href: string };

export type Intent = {
  id: string;
  topic: "safety" | "electrical" | "solar" | "company" | "smalltalk";
  keywords: string[];
  phrases?: string[];
  answer: string;
  links?: Link[];
  followUps?: string[];
  /** Safety intents win ties and are checked first */
  priority?: number;
};

const QUOTE: Link = { label: "Get a quote", href: "/quote" };
const CONTACT: Link = { label: "Contact us", href: "/contact" };
const SOLAR: Link = { label: "Trite Solar", href: "/trite-solar" };

export const INTENTS: Intent[] = [
  // ---------- Safety first ----------
  {
    id: "emergency-burning",
    topic: "safety",
    priority: 3,
    keywords: ["burn", "smoke", "smell", "melt", "fire", "scorch", "hot", "spark", "arc"],
    phrases: ["burning smell", "plug is hot", "sparks", "smoke from"],
    answer:
      "⚠️ This could be dangerous. If it's safe to do so, switch off the main switch at your DB board and don't touch the outlet or appliance. If there's fire or smoke, get everyone out and call emergency services (10177 / 112). Then call us for an urgent call-out. We offer 24/7 emergency support.",
    links: [{ label: "Call us now", href: `tel:${business.phoneE164}` }, CONTACT],
  },
  {
    id: "emergency-shock",
    topic: "safety",
    priority: 3,
    keywords: ["shock", "electrocut", "zap", "tingle", "jolt"],
    phrases: ["got shocked", "electric shock", "tingling"],
    answer:
      "⚠️ Any shock or tingle means something is faulty, often a missing earth or failed earth leakage. Switch off the main switch and stop using that appliance or socket. If someone was hurt, don't touch them while they're still in contact with the source; switch off the power first and call 10177 / 112. Please book an electrician before switching it back on.",
    links: [{ label: "Call us now", href: `tel:${business.phoneE164}` }],
  },
  {
    id: "emergency-water",
    topic: "safety",
    priority: 3,
    keywords: ["water", "flood", "leak", "wet", "rain", "damp"],
    phrases: ["water in", "flooded", "wet plug", "leak near"],
    answer:
      "⚠️ Water and electricity don't mix. Don't touch wet sockets, switches or the DB board. If you can reach the main switch safely from a dry spot, turn it off. Otherwise stay clear and call us; we'll make it safe and test the circuits before power goes back on.",
    links: [{ label: "Call us now", href: `tel:${business.phoneE164}` }],
  },
  {
    id: "diy",
    topic: "safety",
    priority: 2,
    keywords: ["diy", "myself", "self", "own"],
    phrases: ["do it myself", "can i install", "can i wire", "fix it myself"],
    answer:
      "Changing a light bulb is fine, but in South Africa electrical installation work must be done or supervised by a registered electrician, and only a registered person can issue a Certificate of Compliance. DIY wiring can void your insurance and is a real safety risk. We're happy to quote.",
    links: [QUOTE],
  },

  // ---------- Electrical ----------
  {
    id: "tripping",
    topic: "electrical",
    keywords: ["trip", "breaker", "keeps", "switch", "off", "falls", "earth", "leakage", "elcb", "rcd"],
    phrases: ["keeps tripping", "earth leakage", "breaker trips", "trips when"],
    answer:
      "A tripping breaker is a safety device doing its job. Common causes: an overloaded circuit (too many appliances), a faulty appliance, or moisture. If it's the earth leakage, try this: switch all circuit breakers off, reset the earth leakage, then turn breakers on one at a time to find the problem circuit. Then unplug everything on that circuit and plug items back in one by one. If it still trips with nothing plugged in, it's likely a wiring fault and needs an electrician.",
    followUps: ["What is an earth leakage?", "Book fault finding"],
    links: [QUOTE],
  },
  {
    id: "earth-leakage",
    topic: "electrical",
    keywords: ["earth", "leakage", "elcb", "rcd", "what"],
    phrases: ["what is an earth leakage", "earth leakage unit"],
    answer:
      "An earth leakage unit (RCD/ELCB) compares the current going out and coming back on a circuit. If even a small amount leaks to earth (for example through a faulty appliance or a person), it switches off in milliseconds. It's one of the most important safety devices in your DB board, and it's required for a Certificate of Compliance.",
  },
  {
    id: "no-power",
    topic: "electrical",
    keywords: ["no", "power", "outage", "dead", "nothing", "electricity", "gone"],
    phrases: ["no power", "power is off", "no electricity", "half the house"],
    answer:
      "First check whether it's just you: look at neighbours' lights, check the load-shedding schedule, and check your prepaid meter balance. Then look at your DB board for a tripped main switch, breaker or earth leakage. If only part of the house is off, a single breaker has probably tripped. If everything looks on but there's still no power, call us; it may be a supply or wiring fault.",
    followUps: ["My breaker keeps tripping", "Prepaid meter issues"],
  },
  {
    id: "prepaid",
    topic: "electrical",
    keywords: ["prepaid", "meter", "token", "units", "credit"],
    phrases: ["prepaid meter", "token not working"],
    answer:
      "For prepaid meters: check the balance and any error code on the display, and re-enter the token carefully. Token or vending problems are handled by your municipality or Eskom. If the meter shows credit but there's no power, the problem may be after the meter, which an electrician can check.",
  },
  {
    id: "flicker",
    topic: "electrical",
    keywords: ["flicker", "dim", "lights", "blink", "buzz", "humming"],
    phrases: ["lights flicker", "lights dim", "buzzing sound"],
    answer:
      "Flickering on one light is often just a loose or failing bulb or an incompatible dimmer. If many lights flicker, or they dim when big appliances start, it can point to a loose connection or an overloaded circuit, which can overheat. Buzzing from switches or the DB board should be checked soon.",
    links: [QUOTE],
  },
  {
    id: "coc",
    topic: "electrical",
    keywords: ["coc", "certificate", "compliance", "sell", "selling", "transfer", "inspection", "sans", "10142"],
    phrases: ["certificate of compliance", "selling my house", "electrical compliance", "need a coc"],
    answer:
      "A Certificate of Compliance (CoC) confirms your electrical installation meets SANS 10142-1. You need one when selling a property, after new installation work, and often for insurance. An electrician inspects and tests the installation; if anything doesn't comply it must be fixed before the CoC is issued. Many buyers and banks prefer a CoC that's less than two years old.",
    followUps: ["How long does a CoC take?", "Get a quote for a CoC"],
    links: [QUOTE],
  },
  {
    id: "coc-time",
    topic: "electrical",
    keywords: ["long", "time", "take", "days", "valid", "expire"],
    phrases: ["how long does a coc", "coc valid", "coc expire"],
    answer:
      "The inspection itself usually takes a few hours for a typical home. If everything complies, the CoC can be issued straight away. If repairs are needed, it depends on what's found. A CoC doesn't formally expire, but it only covers the installation as it was when inspected, so any later changes need a new certificate.",
    links: [QUOTE],
  },
  {
    id: "db-board",
    topic: "electrical",
    keywords: ["db", "board", "distribution", "breakers", "upgrade", "old", "fuse"],
    phrases: ["db board", "distribution board", "old fuses", "upgrade my board"],
    answer:
      "Your DB (distribution) board holds the main switch, earth leakage and circuit breakers. Consider an upgrade if it still has old fuses, has no earth leakage, is full with no space for new circuits, or shows heat marks. A modern, labelled board is safer and makes adding solar or backup power much easier.",
    links: [QUOTE],
  },
  {
    id: "plugs",
    topic: "electrical",
    keywords: ["plug", "socket", "outlet", "point", "add", "extra", "more"],
    phrases: ["plug not working", "add a plug", "more sockets", "socket not working"],
    answer:
      "If one plug point has stopped working, check its breaker and the earth leakage first. If others on the same circuit work, the socket or a connection may have failed. Adding new plug points is a quick job for an electrician. Avoid running multiple adaptors and extension leads, as they're a common overload and fire risk.",
    links: [QUOTE],
  },
  {
    id: "geyser",
    topic: "electrical",
    keywords: ["geyser", "hot", "water", "element", "thermostat", "timer"],
    phrases: ["geyser not heating", "geyser timer", "no hot water"],
    answer:
      "If there's no hot water, check the geyser's breaker or isolator first. A tripping geyser breaker often means a failed element or thermostat. A geyser timer or smart switch can cut your bill noticeably, since the geyser is usually a home's biggest electricity user. Leaking geysers are a job for a plumber, and the electrical side should be isolated.",
    links: [QUOTE],
  },
  {
    id: "surge",
    topic: "electrical",
    keywords: ["surge", "spike", "lightning", "protect", "protection", "load", "shedding", "appliances"],
    phrases: ["surge protection", "power surge", "lightning damage"],
    answer:
      "Surges happen with lightning and when power returns after load shedding. A surge arrester installed at the DB board protects the whole house, and plug-in surge protectors add a second layer for TVs and computers. It's a small cost compared with replacing appliances.",
    links: [QUOTE],
  },
  {
    id: "rewire",
    topic: "electrical",
    keywords: ["rewire", "rewiring", "old", "house", "wiring", "aluminium", "cloth"],
    phrases: ["old wiring", "rewire my house"],
    answer:
      "Older homes may have perished insulation, no earth wiring, or undersized cables for today's appliances. Warning signs include frequent tripping, warm switches, scorch marks or a burning smell. We can inspect and advise whether repairs or a full or partial rewire make sense.",
    links: [QUOTE],
  },
  {
    id: "ev",
    topic: "electrical",
    keywords: ["ev", "electric", "car", "vehicle", "charger", "charging", "wallbox"],
    phrases: ["ev charger", "electric car"],
    answer:
      "A dedicated EV charger needs its own correctly sized circuit and protection, and sometimes a DB board or supply upgrade. We can check your supply capacity and install it safely, and even pair it with solar.",
    links: [QUOTE],
  },

  // ---------- Solar ----------
  {
    id: "solar-basics",
    topic: "solar",
    keywords: ["solar", "work", "works", "how", "pv", "panels", "sun"],
    phrases: ["how does solar work", "how do solar panels work"],
    answer:
      "Solar panels turn sunlight into DC electricity. An inverter converts it to the AC power your home uses. During the day solar powers your home first; extra energy can charge batteries (hybrid systems) or, where allowed, feed back to the grid. At night or on dull days you use the battery, then the grid.",
    followUps: ["Grid-tied vs hybrid vs off-grid?", "How many panels do I need?"],
    links: [SOLAR],
  },
  {
    id: "solar-types",
    topic: "solar",
    keywords: ["grid", "tied", "hybrid", "off", "offgrid", "type", "difference", "which"],
    phrases: ["grid tied", "off grid", "hybrid system", "which system"],
    answer:
      "• Grid-tied: no batteries, cheapest, cuts your daytime bill but switches off during load shedding.\n• Hybrid: panels plus batteries plus grid. Backup during outages and the most popular choice in SA.\n• Off-grid: fully independent, needs a large battery bank and careful sizing, usually for remote sites.",
    links: [SOLAR, QUOTE],
  },
  {
    id: "load-shedding",
    topic: "solar",
    keywords: ["load", "shedding", "loadshedding", "backup", "outage", "ups", "eskom", "stage"],
    phrases: ["load shedding", "backup power", "keep the lights on"],
    answer:
      "For load shedding you have three main options: a small inverter and battery (backup only, charges from the grid), a hybrid solar system (backup plus lower bills), or a generator. Most homes start by backing up essentials like lights, Wi-Fi, TV, fridge and the gate motor. Tell us what you want to keep running and we'll size it.",
    followUps: ["What size inverter do I need?", "Lithium or lead-acid?"],
    links: [QUOTE],
  },
  {
    id: "inverter-size",
    topic: "solar",
    keywords: ["inverter", "size", "kva", "kw", "big", "capacity", "sizing"],
    phrases: ["what size inverter", "how big inverter", "5kw inverter"],
    answer:
      "Inverter size (kW) depends on how much you want to run at the same time. Rough guide: essentials only (lights, Wi-Fi, TV, fridge) ≈ 3 kW; most of a family home ≈ 5 kW; homes with pool pumps, ovens or borehole pumps ≈ 8 kW+. Kettles, geysers and ovens draw a lot, so they're often left off the backup circuit. A site assessment gives the right answer.",
    links: [QUOTE],
  },
  {
    id: "battery",
    topic: "solar",
    keywords: ["battery", "batteries", "lithium", "lifepo4", "lead", "acid", "gel", "kwh", "storage", "lifespan"],
    phrases: ["lithium or lead", "how long battery last", "battery lifespan"],
    answer:
      "Lithium (LiFePO4) batteries are the standard now: they last roughly 4,000–6,000 cycles (about 10+ years), can be discharged deeply, and need no maintenance. Lead-acid is cheaper up front but lasts far fewer cycles and shouldn't be drained below about 50%. Battery capacity is in kWh: a 5 kWh battery runs a 500 W load for about 8–9 hours.",
  },
  {
    id: "panels-count",
    topic: "solar",
    keywords: ["many", "panels", "how", "number", "roof", "space"],
    phrases: ["how many panels", "roof space"],
    answer:
      "It depends on your daytime usage and roof. As a rough guide, a typical 5 kW hybrid system uses about 8–12 modern panels (roughly 2 m² each) on a north-facing roof. Check your monthly kWh on your bill or prepaid history, and we'll design around that.",
    links: [QUOTE],
  },
  {
    id: "solar-cost",
    topic: "solar",
    keywords: ["solar", "cost", "price", "expensive", "payback", "save", "saving", "worth", "roi"],
    phrases: ["how much does solar cost", "is solar worth it", "payback period"],
    answer:
      "Cost depends on inverter size, battery capacity and number of panels, so we quote per home. Many South African homes see payback in roughly 4–7 years from bill savings, plus the value of having power during load shedding. Ask about the Section 12B and residential incentives that may apply at the time.",
    links: [QUOTE],
  },
  {
    id: "solar-cloudy",
    topic: "solar",
    keywords: ["cloud", "cloudy", "rain", "winter", "night", "dark", "overcast"],
    phrases: ["cloudy days", "at night", "in winter"],
    answer:
      "Panels still produce power on cloudy days, just less (often 10–40% of a sunny day). At night they produce nothing, so a hybrid system runs from the battery, then the grid. Sizing allows for winter, when days are shorter and the sun is lower.",
  },
  {
    id: "solar-maintenance",
    topic: "solar",
    keywords: ["clean", "cleaning", "maintenance", "maintain", "service", "dust", "dirty"],
    phrases: ["clean solar panels", "solar maintenance"],
    answer:
      "Solar systems need little maintenance. Rinse panels with water a few times a year if they get dusty (no harsh chemicals or pressure washers), keep the inverter area ventilated, and have the system checked periodically for loose connections and battery health. Trite Solar offers maintenance checks.",
    links: [SOLAR],
  },
  {
    id: "solar-registration",
    topic: "solar",
    keywords: ["register", "registration", "municipality", "sseg", "approval", "legal", "feed", "net", "metering", "sell", "back"],
    phrases: ["register solar", "sell power back", "net metering", "do i need approval"],
    answer:
      "Most municipalities require small-scale embedded generation (SSEG) systems to be registered, especially grid-tied and hybrid systems, and you'll need an electrical CoC for the installation. Feed-in tariffs (selling power back) vary by municipality. We handle the paperwork as part of a Trite Solar installation.",
    links: [SOLAR],
  },
  {
    id: "kw-kwh",
    topic: "solar",
    keywords: ["kw", "kwh", "watt", "watts", "difference", "unit", "power", "energy"],
    phrases: ["kw vs kwh", "difference between kw and kwh"],
    answer:
      "kW is power: how much you're using at one moment (like speed). kWh is energy: power used over time (like distance). A 2 kW heater running for 3 hours uses 6 kWh. Inverters are rated in kW, batteries in kWh, and your bill charges per kWh.",
  },

  // ---------- Company ----------
  {
    id: "services",
    topic: "company",
    keywords: ["services", "offer", "do", "provide", "what"],
    phrases: ["what do you do", "what services", "what do you offer"],
    answer:
      "PSG Electrical and Cables handles electrical installations, fault finding, DB boards, Certificates of Compliance, and maintenance for homes, businesses and industrial sites. Our solar division, Trite Solar, installs hybrid solar, inverters and battery backup.",
    links: [{ label: "All services", href: "/services" }, SOLAR],
  },
  {
    id: "quote",
    topic: "company",
    keywords: ["quote", "price", "cost", "charge", "much", "rate", "estimate", "book", "booking"],
    phrases: ["how much", "get a quote", "call out fee", "book an electrician"],
    answer:
      "Every job is different, so we quote per job. It only takes three quick questions: what you need, roughly how big, and where to send it. We'll WhatsApp or text you within one working day.",
    links: [QUOTE],
  },
  {
    id: "contact",
    topic: "company",
    keywords: ["contact", "phone", "call", "number", "email", "whatsapp", "reach", "talk", "human", "person"],
    phrases: ["speak to someone", "phone number", "talk to a person"],
    answer: `Call or WhatsApp us on ${business.phones.map((p) => p.display).join(" or ")}, or email ${business.email}. We're available ${business.hours}, and all our details are on the Contact page.`,
    links: [CONTACT, { label: "Call us", href: `tel:${business.phoneE164}` }],
  },
  {
    id: "hours",
    topic: "company",
    keywords: ["hours", "open", "times", "weekend", "saturday", "sunday", "available", "emergency", "after"],
    phrases: ["opening hours", "after hours", "on weekends"],
    answer: `Office hours are ${business.hours}. For urgent electrical faults we offer 24/7 emergency call-outs. Please phone rather than using the form for emergencies.`,
    links: [CONTACT],
  },
  {
    id: "area",
    topic: "company",
    keywords: ["area", "where", "location", "located", "serve", "come", "region", "travel"],
    phrases: ["where are you", "do you come to", "service area"],
    answer: "We work on residential, commercial and industrial sites across the region. Tell us your suburb when you request a quote and we'll confirm.",
    links: [QUOTE],
  },
  {
    id: "trite",
    topic: "company",
    keywords: ["trite", "who", "about", "company", "psg", "team", "owner"],
    phrases: ["who are you", "what is trite solar", "about psg"],
    answer:
      "PSG Electrical and Cables is an owner-run electrical contractor led by Ricky Govender, with 25+ years of experience. Trite Solar is our solar and backup-power division, led by Keoran Govender.",
    links: [{ label: "About us", href: "/about" }],
  },

  // ---------- Small talk ----------
  {
    id: "greeting",
    topic: "smalltalk",
    keywords: ["hi", "hello", "hey", "howzit", "morning", "afternoon", "evening", "sawubona"],
    answer: "Hi! I'm Sparky ⚡, PSG's assistant. Ask me about electrical problems, compliance certificates, solar or backup power.",
    followUps: ["My breaker keeps tripping", "Do I need a CoC?", "How does solar work?"],
  },
  {
    id: "thanks",
    topic: "smalltalk",
    keywords: ["thanks", "thank", "cheers", "great", "awesome", "helpful", "shot"],
    answer: "Glad I could help! Anything else? If you're ready, a quote takes about 30 seconds.",
    links: [QUOTE],
  },
  {
    id: "bot",
    topic: "smalltalk",
    keywords: ["bot", "robot", "ai", "real", "human", "you"],
    phrases: ["are you a bot", "are you real", "are you human"],
    answer: "I'm a simple rule-based assistant, not a person or an AI. I match your question to answers our team wrote. For anything specific to your property, a real electrician will help.",
    links: [CONTACT],
  },
];

export const STARTERS = [
  "My breaker keeps tripping",
  "Do I need a CoC?",
  "Help with load shedding",
  "Lithium or lead-acid?",
  "Get a quote",
];

export const FALLBACK = {
  answer:
    "Sorry, I don't have an answer for that one yet. I know about tripping breakers, no power, CoCs, DB boards, surge protection, solar, inverters and batteries. For anything else, the team can help directly.",
  links: [CONTACT, QUOTE],
  followUps: ["How does solar work?", "No power at home", "What services do you offer?"],
};
