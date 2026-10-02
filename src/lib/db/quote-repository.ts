import "server-only";
import { getDb } from "./connection";
import type { QueryStatus } from "../validation";

export type QuoteRequest = {
  quote_request_id: number;
  service: string;
  size: string;
  phone: string;
  name: string;
  note: string;
  source_page: string;
  user_agent: string;
  status: QueryStatus;
  created_at: string;
};

export type NewQuote = Pick<QuoteRequest, "service" | "size" | "phone" | "name" | "source_page" | "user_agent">;

// Repository: every SQL statement for quote_request lives here (HYDRA §5.1).
export const quoteRepository = {
  create(q: NewQuote): number {
    const res = getDb()
      .prepare(
        `INSERT INTO quote_request (service, size, phone, name, source_page, user_agent)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(q.service, q.size, q.phone, q.name, q.source_page, q.user_agent);
    return Number(res.lastInsertRowid);
  },

  addNote(id: number, note: string): boolean {
    const res = getDb()
      .prepare(`UPDATE quote_request SET note = ? WHERE quote_request_id = ? AND note = '' AND created_at > datetime('now', '-30 minutes')`)
      .run(note, id);
    return res.changes > 0;
  },

  list(): QuoteRequest[] {
    return getDb()
      .prepare(`SELECT * FROM quote_request ORDER BY created_at DESC, quote_request_id DESC`)
      .all() as QuoteRequest[];
  },

  setStatus(id: number, status: QueryStatus): boolean {
    const res = getDb()
      .prepare(`UPDATE quote_request SET status = ? WHERE quote_request_id = ?`)
      .run(status, id);
    return res.changes > 0;
  },
};
