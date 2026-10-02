import { cookies } from "next/headers";
import { loginSchema } from "@/lib/validation";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions, verifyCredentials } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    return Response.json({ ok: false, error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Enter your username and password." }, { status: 400 });
  }

  const session = await verifyCredentials(parsed.data.username, parsed.data.password);
  if (!session) {
    return Response.json({ ok: false, error: "Incorrect username or password." }, { status: 401 });
  }

  (await cookies()).set(SESSION_COOKIE, await createSessionToken(session), sessionCookieOptions);
  return Response.json({ ok: true });
}
