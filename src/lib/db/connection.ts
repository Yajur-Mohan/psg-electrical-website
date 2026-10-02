import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

// Local SQLite store for the assignment build. The HYDRA design targets
// Azure Database for PostgreSQL; the repositories below keep SQL in one place
// so swapping the driver later does not touch any route handler.

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "hydra.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS quote_request (
  quote_request_id INTEGER PRIMARY KEY AUTOINCREMENT,
  service TEXT NOT NULL,
  size TEXT NOT NULL,
  phone TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  source_page TEXT NOT NULL DEFAULT '/',
  user_agent TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'New',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_query (
  query_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New'
    CHECK (status IN ('New', 'In Progress', 'Converted to Job', 'Closed')),
  assigned_admin_id INTEGER REFERENCES admin(admin_id),
  submitted_date TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin (
  admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin'
);

CREATE INDEX IF NOT EXISTS idx_quote_status ON quote_request(status, created_at);
CREATE INDEX IF NOT EXISTS idx_query_status ON contact_query(status, submitted_date);
`;

const globalForDb = globalThis as unknown as { hydraDb?: DatabaseSync };

export function getDb(): DatabaseSync {
  if (!globalForDb.hydraDb) {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = new DatabaseSync(DB_PATH);
    db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
    db.exec(SCHEMA);
    globalForDb.hydraDb = db;
  }
  return globalForDb.hydraDb;
}
