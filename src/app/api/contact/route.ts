import { contactSchema } from "@/lib/validation";
import { contactQueryRepository } from "@/lib/db/contact-query-repository";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// POST /api/contact: creates a CONTACT_QUERY with status "New" (user story 24).
export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`)) {
    return Response.json({ ok: false, error: "Too many requests. Please call us instead." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    if (body && typeof body === "object" && "company" in body && body.company) {
      return Response.json({ ok: true });
    }
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return Response.json({ ok: false, fieldErrors }, { status: 400 });
  }

  const { name, contact, message } = parsed.data;
  const id = await contactQueryRepository.create({ name, contact, message });
  console.info(`[contact] query #${id} received`);
  return Response.json({ ok: true, id });
}
