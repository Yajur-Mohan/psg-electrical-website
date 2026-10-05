import "server-only";
import bcrypt from "bcryptjs";
import { getDb } from "./connection";

export type Admin = { admin_id: number; username: string; password_hash: string; role: string };

// Cost 10 keeps hashing within a Worker's CPU budget while staying well above bcrypt's minimum
export const BCRYPT_COST = 10;

export const adminRepository = {
  async findByUsername(username: string): Promise<Admin | null> {
    return getDb().prepare(`SELECT * FROM admin WHERE username = ?`).bind(username).first<Admin>();
  },

  // Seeds the first admin from env on first use, so no credentials live in git.
  async ensureSeeded(): Promise<void> {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    if (!username || !password) return;
    const db = getDb();
    const exists = await db.prepare(`SELECT 1 FROM admin WHERE username = ?`).bind(username).first();
    if (exists) return;
    await db
      .prepare(`INSERT INTO admin (username, password_hash) VALUES (?, ?)`)
      .bind(username, await bcrypt.hash(password, BCRYPT_COST))
      .run();
  },
};
