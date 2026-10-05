-- HYDRA public-website tables (see src/lib/db for the repositories)
CREATE TABLE IF NOT EXISTS admin (
  admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin'
);

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

CREATE INDEX IF NOT EXISTS idx_quote_status ON quote_request(status, created_at);
CREATE INDEX IF NOT EXISTS idx_query_status ON contact_query(status, submitted_date);
