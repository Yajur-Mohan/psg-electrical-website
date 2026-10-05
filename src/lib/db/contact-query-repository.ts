import "server-only";
import { getDb } from "./connection";
import type { QueryStatus } from "../validation";

export type ContactQuery = {
  query_id: number;
  name: string;
  contact: string;
  message: string;
  status: QueryStatus;
  assigned_admin_id: number | null;
  submitted_date: string;
};

// Repository for CONTACT_QUERY (HYDRA ERD §4.4, user stories 19 and 24).
export const contactQueryRepository = {
  async create(q: Pick<ContactQuery, "name" | "contact" | "message">): Promise<number> {
    const res = await getDb()
      .prepare(`INSERT INTO contact_query (name, contact, message) VALUES (?, ?, ?)`)
      .bind(q.name, q.contact, q.message)
      .run();
    return Number(res.meta.last_row_id);
  },

  async list(): Promise<ContactQuery[]> {
    const { results } = await getDb()
      .prepare(`SELECT * FROM contact_query ORDER BY submitted_date DESC, query_id DESC`)
      .all<ContactQuery>();
    return results;
  },

  async setStatus(id: number, status: QueryStatus, adminId: number): Promise<boolean> {
    const res = await getDb()
      .prepare(`UPDATE contact_query SET status = ?, assigned_admin_id = ? WHERE query_id = ?`)
      .bind(status, adminId, id)
      .run();
    return res.meta.changes > 0;
  },
};
