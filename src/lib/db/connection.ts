import "server-only";
import { env } from "cloudflare:workers";

// Cloudflare D1 (serverless SQLite) bound as `DB` in wrangler.jsonc.
// The schema lives in migrations/ and is applied with `npm run db:migrate`.
// The HYDRA design targets Azure PostgreSQL; the repositories keep SQL in one
// place so swapping the driver later does not touch any route handler.

export function getDb(): D1Database {
  return env.DB;
}
