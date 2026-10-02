// End-to-end smoke test against a running server: `npm run dev` then `npm run smoke`.
// Uses only Node built-ins. Exits non-zero on the first failed check.

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
let failed = 0;

async function check(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}\n    ${err.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const post = (path, body, method = "POST") =>
  fetch(BASE + path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

console.log(`Smoke testing ${BASE}`);

for (const page of ["/", "/about", "/services", "/projects", "/trite-solar", "/partners", "/faq", "/contact", "/quote", "/privacy", "/accessibility"]) {
  await check(`GET ${page} → 200`, async () => {
    const res = await fetch(BASE + page);
    assert(res.status === 200, `got ${res.status}`);
  });
}

await check("unknown page → 404", async () => {
  assert((await fetch(BASE + "/does-not-exist")).status === 404, "expected 404");
});

await check("quote rejects an invalid phone", async () => {
  const res = await post("/api/quote", { service: "fault", size: "small", phone: "123" });
  assert(res.status === 400, `got ${res.status}`);
});

await check("quote accepts a valid request", async () => {
  const res = await post("/api/quote", { service: "db-board", size: "large", phone: "+27 82 000 1111", sourcePage: "/smoke" });
  const json = await res.json();
  assert(res.ok && json.ok && json.id > 0, JSON.stringify(json));
});

await check("contact rejects empty fields", async () => {
  const res = await post("/api/contact", { name: "", contact: "", message: "" });
  const json = await res.json();
  assert(res.status === 400 && json.fieldErrors?.name, JSON.stringify(json));
});

await check("admin triage requires login", async () => {
  const res = await post("/api/admin/enquiries/quote/1", { status: "Closed" }, "PATCH");
  assert(res.status === 401, `got ${res.status}`);
});

await check("admin page redirects to login when signed out", async () => {
  const res = await fetch(BASE + "/admin", { redirect: "manual" });
  assert([307, 308, 303].includes(res.status) || (await res.text()).includes("/admin/login"), `got ${res.status}`);
});

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll checks passed");
