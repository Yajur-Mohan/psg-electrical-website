// Run with: npm test  (Node's built-in test runner with native TypeScript)
import { test } from "node:test";
import assert from "node:assert/strict";
import { reply } from "./engine.ts";

const cases: [string, string | null][] = [
  ["my breaker keeps tripping", "tripping"],
  ["the earth leakage trips when it rains", "tripping"],
  ["water is leaking near my db board", "emergency-water"],
  ["there is a burning smell from the plug", "emergency-burning"],
  ["I got shocked by the kettle", "emergency-shock"],
  ["do I need a certificate of compliance to sell my house?", "coc"],
  ["what size inverter do I need", "inverter-size"],
  ["lithium or lead acid battery?", "battery"],
  ["how does solar work", "solar-basics"],
  ["help with load shedding", "load-shedding"],
  ["how much does solar cost", "solar-cost"],
  ["what's the difference between kw and kwh", "kw-kwh"],
  ["hello", "greeting"],
  ["can I wire a plug point myself?", "diy"],
  ["what are your opening hours", "hours"],
  ["tell me a joke about pirates please", null],
];

for (const [question, expected] of cases) {
  test(`"${question}" → ${expected ?? "fallback"}`, () => {
    assert.equal(reply(question).intentId, expected);
  });
}

test("safety answers always include a way to call", () => {
  const r = reply("sparks coming out of the socket");
  assert.equal(r.intentId, "emergency-burning");
  assert.ok(r.links.some((l) => l.href.startsWith("tel:")));
});

test("fallback offers contact and follow-ups", () => {
  const r = reply("zxqv blorp");
  assert.equal(r.intentId, null);
  assert.ok(r.links.length > 0 && r.followUps.length > 0);
});
