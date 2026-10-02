"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { STEPS } from "@/lib/quote-steps";
import { SA_PHONE, normalisePhone } from "@/lib/validation";
import { track } from "@/lib/analytics";
import { business } from "@/lib/site";

type Status = "idle" | "sending" | "done" | "failed";

// One question at a time (MASTER-IMPLEMENTATION Phase 1).
// Accessibility: focus moves to the new question on step change (not on first
// load), progress is announced politely, errors are linked via aria-describedby.
export default function QuoteFlow({ sourcePage = "/" }: { sourcePage?: string }) {
  const uid = useId();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [quoteId, setQuoteId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [noteSent, setNoteSent] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, status]);

  useEffect(() => {
    track("quote_step_view", { step: step + 1 });
  }, [step]);

  const current = STEPS[step];
  const ids = {
    q: `${uid}-q`,
    phone: `${uid}-phone`,
    phoneErr: `${uid}-phone-err`,
    privacy: `${uid}-privacy`,
    name: `${uid}-name`,
    company: `${uid}-company`,
    note: `${uid}-note`,
  };

  function choose(id: string, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalised = normalisePhone(phone);
    if (!SA_PHONE.test(normalised)) {
      setError("Please enter a valid phone number, e.g. 082 123 4567");
      return;
    }
    setError("");
    setStatus("sending");
    const honeypot = (e.currentTarget.elements.namedItem("company") as HTMLInputElement | null)?.value ?? "";
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, phone: normalised, name, company: honeypot, sourcePage }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(String(res.status));
      setQuoteId(data.id ?? null);
      track("quote_submitted", { service: answers.service ?? "", size: answers.size ?? "" });
      setStatus("done");
    } catch {
      setStatus("failed");
    }
  }

  async function sendNote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!quoteId || !note.trim()) return;
    const res = await fetch("/api/quote", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: quoteId, note }),
    }).catch(() => null);
    if (res?.ok) setNoteSent(true);
  }

  if (status === "done") {
    return (
      <section className="quote-card text-center" aria-labelledby={`${uid}-done`}>
        <div aria-hidden="true" className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#1f9d6b] text-3xl text-white">
          ✓
        </div>
        <h2 id={`${uid}-done`} ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold">
          Done, your quote is on its way
        </h2>
        <p className="mt-2 text-slate-600">
          We&apos;ll WhatsApp or text you {business.responseTime}.
        </p>

        {quoteId && !noteSent && (
          <form onSubmit={sendNote} className="mx-auto mt-6 max-w-md text-left">
            <label htmlFor={ids.note} className="block text-sm font-bold text-slate-800">
              Anything else we should know? <span className="font-normal text-slate-600">(optional)</span>
            </label>
            <textarea
              id={ids.note}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-slate-900"
            />
            <button type="submit" className="quote-secondary mt-2">
              Add note
            </button>
          </form>
        )}
        {noteSent && (
          <p role="status" className="mt-4 text-sm font-semibold text-[#14734d]">
            Thanks, we&apos;ve added that to your request.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="quote-card" aria-labelledby={ids.q}>
      <p className="text-center text-xs font-extrabold tracking-[0.2em] text-slate-600 uppercase">
        One question at a time
      </p>

      <div className="mt-3 flex items-center justify-center gap-3">
        <p aria-live="polite" className="text-sm text-slate-600">
          Step {step + 1} of {STEPS.length}
        </p>
        <ol className="flex gap-1.5" aria-hidden="true">
          {STEPS.map((s, i) => (
            <li key={s.id} className={`size-2.5 rounded-full ${i <= step ? "bg-brand" : "bg-slate-300"}`} />
          ))}
        </ol>
      </div>

      <h2
        id={ids.q}
        ref={headingRef}
        tabIndex={-1}
        className="mt-4 text-center text-2xl font-extrabold text-slate-900 sm:text-3xl"
      >
        {current.question}
      </h2>

      <div key={step} className="quote-step">
        {current.kind === "choice" ? (
          <div role="group" aria-labelledby={ids.q} className="mt-6 grid gap-3 sm:grid-cols-2">
            {current.options.map((o) => {
              const selected = answers[current.id] === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => choose(current.id, o.value)}
                  className={`quote-option ${selected ? "is-selected" : ""}`}
                >
                  <span className="block font-bold">{o.label}</span>
                  {o.hint && <span className="block text-sm opacity-80">{o.hint}</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mx-auto mt-6 grid max-w-md gap-4">
            <div>
              <label htmlFor={ids.phone} className="block text-sm font-bold text-slate-800">
                Mobile number (WhatsApp or SMS)
              </label>
              <input
                id={ids.phone}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? `${ids.phoneErr} ${ids.privacy}` : ids.privacy}
                className="quote-input"
                placeholder="082 123 4567"
              />
              {error && (
                <p id={ids.phoneErr} role="alert" className="mt-2 text-sm font-semibold text-[#b4233a]">
                  {error}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={ids.name} className="block text-sm font-bold text-slate-800">
                First name <span className="font-normal text-slate-600">(optional)</span>
              </label>
              <input
                id={ids.name}
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="quote-input"
              />
            </div>

            {/* Honeypot: hidden from people, bots fill it in */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
              <label htmlFor={ids.company}>Company</label>
              <input id={ids.company} name="company" tabIndex={-1} autoComplete="off" />
            </div>

            <p id={ids.privacy} className="text-sm text-slate-600">
              We&apos;ll only use your number to send this quote.{" "}
              <Link href="/privacy" className="font-semibold text-[#1d4fd8] underline">
                Privacy policy
              </Link>
            </p>

            <button type="submit" disabled={status === "sending"} className="quote-submit">
              {status === "sending" ? "Sending…" : "Get my quote"}
            </button>

            {status === "failed" && (
              <p role="alert" className="text-sm font-semibold text-[#b4233a]">
                Something went wrong. Please call or WhatsApp us directly on{" "}
                <a href={`tel:${business.phoneE164}`} className="underline">
                  {business.phoneDisplay}
                </a>
                .
              </p>
            )}
          </form>
        )}
      </div>

      {step > 0 && (
        <button type="button" className="quote-back" onClick={() => setStep((s) => s - 1)}>
          ← Back
        </button>
      )}
    </section>
  );
}
