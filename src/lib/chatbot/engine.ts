import { FALLBACK, INTENTS, type Intent, type Link } from "./knowledge.ts";

export type BotReply = {
  intentId: string | null;
  answer: string;
  links: Link[];
  followUps: string[];
};

const STOP = new Set(["a", "an", "the", "is", "are", "my", "i", "it", "to", "of", "and", "or", "in", "on", "for", "me", "can", "do", "does", "with", "what", "how", "should"]);

// Map common follow-up chip text straight to an intent
const DIRECT: Record<string, string> = {
  "what is an earth leakage?": "earth-leakage",
  "book fault finding": "quote",
  "how long does a coc take?": "coc-time",
  "get a quote for a coc": "quote",
  "prepaid meter issues": "prepaid",
  "grid-tied vs hybrid vs off-grid?": "solar-types",
  "what size inverter do i need?": "inverter-size",
  "lithium or lead-acid?": "battery",
};

export function normalise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));
}

// Score: +1 per keyword stem found in a word, +3 per exact phrase, then weight
// by priority so safety intents win whenever they're triggered at all.
export function score(intent: Intent, words: string[], raw: string): number {
  let s = 0;
  for (const k of intent.keywords) {
    if (words.some((w) => w === k || (k.length >= 3 && w.startsWith(k)))) s += 1;
  }
  for (const p of intent.phrases ?? []) if (raw.includes(p)) s += 3;
  if (s === 0) return 0;
  return s + (intent.priority ?? 0) * 2;
}

export function reply(input: string): BotReply {
  const raw = input.toLowerCase().trim();
  const direct = DIRECT[raw];
  const pick = (i: Intent): BotReply => ({
    intentId: i.id,
    answer: i.answer,
    links: i.links ?? [],
    followUps: i.followUps ?? [],
  });
  if (direct) {
    const intent = INTENTS.find((i) => i.id === direct);
    if (intent) return pick(intent);
  }

  const words = normalise(raw);
  let best: Intent | null = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const s = score(intent, words, raw);
    if (s > bestScore) {
      best = intent;
      bestScore = s;
    }
  }

  // Single weak keyword on a non-safety intent is too thin to trust
  if (!best || (bestScore < 2 && best.topic !== "smalltalk" && words.length > 2)) {
    return { intentId: null, ...FALLBACK };
  }
  return pick(best);
}
