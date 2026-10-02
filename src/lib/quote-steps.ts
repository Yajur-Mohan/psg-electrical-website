// Steps for the one-question-at-a-time quote flow (MASTER-IMPLEMENTATION Phase 1).
// Services and sizes map to the real PSG / Trite Solar service list.

export type Option = { value: string; label: string; hint?: string };

export type Step =
  | { id: "service" | "size"; kind: "choice"; question: string; options: Option[] }
  | { id: "phone"; kind: "contact"; question: string };

export const SERVICE_OPTIONS: Option[] = [
  { value: "installation", label: "New installation", hint: "Wiring, plugs, lights, fit-outs" },
  { value: "fault", label: "Fault or repair", hint: "Tripping, no power, burning smell" },
  { value: "db-board", label: "DB board", hint: "New, upgrade or replacement" },
  { value: "coc", label: "Compliance (CoC)", hint: "Selling or renting a property" },
  { value: "solar", label: "Solar & backup", hint: "Trite Solar, inverters, batteries" },
  { value: "maintenance", label: "Maintenance", hint: "Planned or recurring work" },
];

export const SIZE_OPTIONS: Option[] = [
  { value: "small", label: "Small", hint: "One room, one fault or one item" },
  { value: "medium", label: "Medium", hint: "A few rooms or a small business" },
  { value: "large", label: "Large", hint: "Whole property or industrial site" },
];

export const STEPS: Step[] = [
  { id: "service", kind: "choice", question: "What do you need done?", options: SERVICE_OPTIONS },
  { id: "size", kind: "choice", question: "How big, roughly?", options: SIZE_OPTIONS },
  { id: "phone", kind: "contact", question: "Where should we send your quote?" },
];

export const labelFor = (options: Option[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;
