import "server-only";

// Fixed-window in-memory limiter. Fine for a single Node instance; a multi-instance
// deployment (HYDRA §5.3) would move this to Redis or Azure Front Door rules.

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

// Never write full phone numbers to logs (POPIA).
export const maskPhone = (phone: string) => phone.slice(0, 3) + "****" + phone.slice(-2);
