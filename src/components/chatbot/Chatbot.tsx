"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { reply, type BotReply } from "@/lib/chatbot/engine";
import { STARTERS } from "@/lib/chatbot/knowledge";
import { track } from "@/lib/analytics";

type Message = { id: number; from: "bot" | "user"; text: string; links?: BotReply["links"]; followUps?: string[] };

const WELCOME: Message = {
  id: 0,
  from: "bot",
  text: "Hi! I'm Sparky ⚡, PSG's assistant. Ask me about tripping breakers, compliance certificates, solar or load-shedding backup.",
  followUps: STARTERS,
};

// Rule-based helper: answers come from a fixed knowledge base, nothing is sent
// to a server or stored. Non-modal dialog; Escape closes and focus returns.
export default function Chatbot() {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const pathname = usePathname();

  // Close after navigating via a link in an answer (adjust state during render)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function close() {
    setOpen(false);
    launcher.current?.focus();
  }

  function ask(text: string) {
    const q = text.trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { id: nextId.current++, from: "user", text: q }]);
    setInput("");
    setTyping(true);
    const r = reply(q);
    track("chatbot_question", { intent: r.intentId ?? "fallback" });
    // Short "thinking" pause so replies feel conversational
    const delay = Math.min(1200, 450 + r.answer.length * 3);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: nextId.current++, from: "bot", text: r.answer, links: r.links, followUps: r.followUps }]);
    }, delay);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    ask(input);
  }

  const last = messages[messages.length - 1];

  return (
    <>
      <button
        ref={launcher}
        type="button"
        data-magnetic
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        onClick={() => (open ? close() : setOpen(true))}
        className="chat-launcher fixed right-4 bottom-20 z-[70] grid size-16 place-items-center rounded-full text-white shadow-2xl sm:bottom-6"
      >
        <span aria-hidden="true" className="text-2xl">{open ? "✕" : "⚡"}</span>
        <span className="sr-only">{open ? "Close chat assistant" : "Open chat assistant"}</span>
      </button>

      {open && (
        <div
          id={`${uid}-panel`}
          role="dialog"
          aria-labelledby={`${uid}-title`}
          onKeyDown={(e) => e.key === "Escape" && close()}
          className="chat-panel fixed right-4 bottom-40 z-[70] flex h-[min(600px,calc(100svh-12rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#11141a]/95 shadow-[0_30px_100px_rgba(0,0,0,.6)] backdrop-blur-xl sm:bottom-26"
          data-lenis-prevent
        >
          <header className="relative flex items-center gap-3 border-b border-white/10 p-4">
            <span aria-hidden="true" className="chat-avatar grid size-10 place-items-center rounded-full text-lg">⚡</span>
            <div className="flex-1">
              <h2 id={`${uid}-title`} className="font-extrabold">Sparky</h2>
              <p className="text-xs text-muted">Electrical &amp; solar questions · instant answers</p>
            </div>
            <button type="button" onClick={close} className="grid size-11 place-items-center rounded-full hover:bg-white/10">
              <span aria-hidden="true">✕</span>
              <span className="sr-only">Close chat</span>
            </button>
            <span aria-hidden="true" className="bg-gradient-brand absolute inset-x-0 bottom-0 h-px" />
          </header>

          <div ref={log} role="log" aria-live="polite" aria-label="Conversation" className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    m.from === "user" ? "rounded-br-sm bg-brand text-white" : "rounded-bl-sm bg-[#1f242d] text-[#e3e7ee]"
                  }`}
                >
                  <span className="sr-only">{m.from === "user" ? "You said: " : "Sparky: "}</span>
                  {m.text}
                  {m.links && m.links.length > 0 && (
                    <span className="mt-3 flex flex-wrap gap-2">
                      {m.links.map((l) =>
                        l.href.startsWith("/") ? (
                          <Link key={l.href} href={l.href} onClick={close} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20">
                            {l.label} →
                          </Link>
                        ) : (
                          <a key={l.href} href={l.href} className="rounded-full bg-[#1f9d6b] px-3 py-1.5 text-xs font-bold text-white">
                            {l.label}
                          </a>
                        ),
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start" aria-label="Sparky is typing">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-[#1f242d] px-4 py-4">
                  <span className="chat-dot" />
                  <span className="chat-dot [animation-delay:.15s]" />
                  <span className="chat-dot [animation-delay:.3s]" />
                </div>
              </div>
            )}
          </div>

          {!typing && last.from === "bot" && last.followUps && last.followUps.length > 0 && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-2" role="group" aria-label="Suggested questions">
              {last.followUps.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => ask(f)}
                  className="min-h-9 shrink-0 rounded-full border border-[#5b8cff]/50 px-3 text-xs font-semibold text-[#a9c1ff] hover:bg-[#5b8cff]/15"
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-white/10 p-3">
            <label htmlFor={`${uid}-input`} className="sr-only">Ask Sparky a question</label>
            <input
              ref={field}
              id={`${uid}-input`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={300}
              autoComplete="off"
              placeholder="e.g. Why does my geyser trip?"
              className="min-h-11 flex-1 rounded-full border border-white/15 bg-[#0b0d11] px-4 text-sm text-white placeholder:text-[#7d8592]"
            />
            <button type="submit" disabled={!input.trim() || typing} className="min-h-11 rounded-full bg-brand px-4 text-sm font-extrabold disabled:opacity-50">
              Send
            </button>
          </form>
          <p className="px-4 pb-3 text-[11px] text-[#8a929f]">
            General guidance only. For emergencies, switch off the main and call us.
          </p>
        </div>
      )}
    </>
  );
}
