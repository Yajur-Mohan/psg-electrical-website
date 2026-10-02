import "server-only";
import bcrypt from "bcryptjs";
import { getDb } from "./connection";

export type Admin = { admin_id: number; username: string; password_hash: string; role: string };

export const adminRepository = {
  findByUsername(username: string): Admin | undefined {
    return getDb().prepare(`SELECT * FROM admin WHERE username = ?`).get(username) as Admin | undefined;
  },

  // Seeds the first admin from env on first use, so no credentials live in git.
  ensureSeeded(): void {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    if (!username || !password) return;
    const db = getDb();
    const exists = db.prepare(`SELECT 1 FROM admin WHERE username = ?`).get(username);
    if (exists) return;
    db.prepare(`INSERT INTO admin (username, password_hash) VALUES (?, ?)`).run(
      username,
      bcrypt.hashSync(password, 12),
    );
  },
};
