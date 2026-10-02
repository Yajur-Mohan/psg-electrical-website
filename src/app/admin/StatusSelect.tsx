"use client";

import { useState } from "react";
import { QUERY_STATUSES, type QueryStatus } from "@/lib/validation";

export default function StatusSelect({
  kind,
  id,
  initial,
  label,
}: {
  kind: "quote" | "contact";
  id: number;
  initial: QueryStatus;
  label: string;
}) {
  const [status, setStatus] = useState(initial);
  const [msg, setMsg] = useState("");

  async function change(next: QueryStatus) {
    const prev = status;
    setStatus(next);
    setMsg("Saving…");
    const res = await fetch(`/api/admin/enquiries/${kind}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => null);
    if (res?.ok) setMsg("Saved");
    else {
      setStatus(prev);
      setMsg("Could not save");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor={`${kind}-${id}-status`}>{label}</label>
      <select
        id={`${kind}-${id}-status`}
        value={status}
        onChange={(e) => change(e.target.value as QueryStatus)}
        className="min-h-11 rounded border border-[#56606e] bg-[#171b21] px-2 text-sm"
      >
        {QUERY_STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <span role="status" className="text-xs text-muted">{msg}</span>
    </div>
  );
}
