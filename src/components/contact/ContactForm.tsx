"use client";

import { FormEvent, useRef, useState } from "react";

type Errors = Partial<Record<"name" | "contact" | "message" | "form", string>>;

// Short general enquiry (HYDRA user story 24): name, one contact detail, message.
// Quotes go through the stepped QuoteFlow instead.
export default function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const doneRef = useRef<HTMLHeadingElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fieldErrors?: Errors };
      if (res.ok && json.ok) {
        setErrors({});
        setState("sent");
        form.reset();
        requestAnimationFrame(() => doneRef.current?.focus());
        return;
      }
      setErrors(json.fieldErrors ?? { form: json.error ?? "Something went wrong. Please call us instead." });
    } catch {
      setErrors({ form: "Something went wrong. Please call us instead." });
    }
    setState("idle");
    // Move focus to the first invalid field
    requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
  }

  if (state === "sent") {
    return (
      <div className="rounded-xl border border-success/50 bg-success/10 p-6">
        <h3 ref={doneRef} tabIndex={-1} className="text-xl font-bold">
          Thanks, your message is with the team.
        </h3>
        <p className="mt-2 text-muted">We&apos;ll get back to you within one working day.</p>
        <button type="button" onClick={() => setState("idle")} className="mt-4 min-h-11 underline">
          Send another message
        </button>
      </div>
    );
  }

  const field = (name: "name" | "contact" | "message") => ({
    id: `contact-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `contact-${name}-err` : undefined,
    className:
      "mt-1.5 w-full rounded-md border border-[#56606e] bg-[#171b21] px-3.5 py-3 text-white focus:border-brand-bright aria-[invalid=true]:border-danger",
  });

  const error = (name: keyof Errors) =>
    errors[name] && (
      <p id={`contact-${name}-err`} className="mt-1.5 text-sm font-semibold text-danger">
        {errors[name]}
      </p>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div>
        <label htmlFor="contact-name" className="text-sm font-bold">Your name</label>
        <input {...field("name")} autoComplete="name" required />
        {error("name")}
      </div>
      <div>
        <label htmlFor="contact-contact" className="text-sm font-bold">Phone number or email</label>
        <input {...field("contact")} autoComplete="email" required />
        {error("contact")}
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm font-bold">How can we help?</label>
        <textarea {...field("message")} rows={5} required />
        {error("message")}
      </div>
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="text-sm text-muted">
        We only use these details to reply to you. Please don&apos;t include passwords or banking details.
      </p>
      {errors.form && <p role="alert" className="font-semibold text-danger">{errors.form}</p>}
      <button type="submit" disabled={state === "sending"} className="min-h-12 rounded bg-brand px-6 font-extrabold disabled:opacity-70">
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
