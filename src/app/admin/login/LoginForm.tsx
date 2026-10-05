"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);
    const json = (await res?.json().catch(() => ({}))) as { ok?: boolean; error?: string } | undefined;
    setBusy(false);
    if (res?.ok && json?.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setError(json?.error ?? "Could not sign in. Please try again.");
    }
  }

  const input = "mt-1.5 w-full rounded-md border border-[#56606e] bg-[#171b21] px-3.5 py-3 text-white";
  return (
    <form onSubmit={onSubmit} className="grid gap-4" aria-describedby={error ? "login-err" : undefined}>
      <div>
        <label htmlFor="username" className="text-sm font-bold">Username</label>
        <input id="username" name="username" autoComplete="username" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-bold">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      {error && <p id="login-err" role="alert" className="font-semibold text-danger">{error}</p>}
      <button type="submit" disabled={busy} className="min-h-12 rounded bg-brand font-extrabold disabled:opacity-70">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
