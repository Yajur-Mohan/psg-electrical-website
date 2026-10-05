import { quoteSchema, quoteNoteSchema } from "@/lib/validation";
import { quoteRepository } from "@/lib/db/quote-repository";
import { clientIp, maskPhone, rateLimit } from "@/lib/rate-limit";

// POST /api/quote: the three-step quote flow submits here (MASTER-IMPLEMENTATION §1.4).
export async function POST(req: Request) {
  if (!rateLimit(`quote:${clientIp(req)}`)) {
    return Response.json({ ok: false, error: "Too many requests. Please call us instead." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    // A filled honeypot looks like success to the bot but is never stored
    if (body && typeof body === "object" && "company" in body && body.company) {
      return Response.json({ ok: true });
    }
    return Response.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  const { service, size, phone, name, sourcePage } = parsed.data;
  const id = await quoteRepository.create({
    service,
    size,
    phone,
    name,
    source_page: sourcePage,
    user_agent: (req.headers.get("user-agent") ?? "").slice(0, 200),
  });

  console.info(`[quote] #${id} ${service}/${size} from ${maskPhone(phone)}`);
  return Response.json({ ok: true, id });
}

// PATCH /api/quote: optional "Anything else?" note, only offered after submission.
export async function PATCH(req: Request) {
  if (!rateLimit(`quote-note:${clientIp(req)}`)) {
    return Response.json({ ok: false }, { status: 429 });
  }
  const parsed = quoteNoteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const ok = await quoteRepository.addNote(parsed.data.id, parsed.data.note);
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
