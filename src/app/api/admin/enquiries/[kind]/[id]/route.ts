import { getSession } from "@/lib/auth";
import { statusSchema } from "@/lib/validation";
import { contactQueryRepository } from "@/lib/db/contact-query-repository";
import { quoteRepository } from "@/lib/db/quote-repository";

// PATCH /api/admin/enquiries/:kind/:id: admin triage (user story 19).
export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/enquiries/[kind]/[id]">) {
  const session = await getSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });

  const { kind, id } = await ctx.params;
  const numericId = Number(id);
  const parsed = statusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !Number.isInteger(numericId)) {
    return Response.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  let ok = false;
  if (kind === "contact") ok = await contactQueryRepository.setStatus(numericId, parsed.data.status, session.adminId);
  else if (kind === "quote") ok = await quoteRepository.setStatus(numericId, parsed.data.status);
  else return Response.json({ ok: false }, { status: 404 });

  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
