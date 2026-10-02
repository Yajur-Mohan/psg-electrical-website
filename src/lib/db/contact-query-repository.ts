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
  create(q: Pick<ContactQuery, "name" | "contact" | "message">): number {
    const res = getDb()
      .prepare(`INSERT INTO contact_query (name, contact, message) VALUES (?, ?, ?)`)
      .run(q.name, q.contact, q.message);
    return Number(res.lastInsertRowid);
  },

  list(): ContactQuery[] {
    return getDb()
      .prepare(`SELECT * FROM contact_query ORDER BY submitted_date DESC, query_id DESC`)
      .all() as ContactQuery[];
  },

  setStatus(id: number, status: QueryStatus, adminId: number): boolean {
    const res = getDb()
      .prepare(`UPDATE contact_query SET status = ?, assigned_admin_id = ? WHERE query_id = ?`)
      .run(status, adminId, id);
    return res.changes > 0;
  },
};
