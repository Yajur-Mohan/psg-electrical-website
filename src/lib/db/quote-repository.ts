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
  async create(q: NewQuote): Promise<number> {
    const res = await getDb()
      .prepare(
        `INSERT INTO quote_request (service, size, phone, name, source_page, user_agent)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(q.service, q.size, q.phone, q.name, q.source_page, q.user_agent)
      .run();
    return Number(res.meta.last_row_id);
  },

  async addNote(id: number, note: string): Promise<boolean> {
    const res = await getDb()
      .prepare(`UPDATE quote_request SET note = ? WHERE quote_request_id = ? AND note = '' AND created_at > datetime('now', '-30 minutes')`)
      .bind(note, id)
      .run();
    return res.meta.changes > 0;
  },

  async list(): Promise<QuoteRequest[]> {
    const { results } = await getDb()
      .prepare(`SELECT * FROM quote_request ORDER BY created_at DESC, quote_request_id DESC`)
      .all<QuoteRequest>();
    return results;
  },

  async setStatus(id: number, status: QueryStatus): Promise<boolean> {
    const res = await getDb()
      .prepare(`UPDATE quote_request SET status = ? WHERE quote_request_id = ?`)
      .bind(status, id)
      .run();
    return res.meta.changes > 0;
  },
};
