import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { quoteRepository } from "@/lib/db/quote-repository";
import { contactQueryRepository } from "@/lib/db/contact-query-repository";
import { SERVICE_OPTIONS, SIZE_OPTIONS, labelFor } from "@/lib/quote-steps";
import StatusSelect from "./StatusSelect";
import LogoutButton from "./LogoutButton";

export const metadata: Metadata = { title: "Enquiries", robots: { index: false } };

const waLink = (phone: string, name: string, service: string) => {
  const intl = phone.startsWith("0") ? `27${phone.slice(1)}` : phone.replace("+", "");
  const text = `Hi${name ? ` ${name}` : ""}, this is PSG Electrical about your ${service.toLowerCase()} quote request.`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
};

// Admin enquiries screen (HYDRA user story 19).
export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [quotes, queries] = await Promise.all([quoteRepository.list(), contactQueryRepository.list()]);
  const fresh = quotes.filter((q) => q.status === "New").length + queries.filter((q) => q.status === "New").length;

  return (
    <div className="container-site py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Website enquiries</h1>
          <p className="text-muted">Signed in as {session.username} · {fresh} new</p>
        </div>
        <LogoutButton />
      </div>

      <section className="mt-10" aria-labelledby="quotes-h">
        <h2 id="quotes-h" className="text-xl font-bold">Quote requests ({quotes.length})</h2>
        {quotes.length === 0 ? (
          <p className="mt-3 text-muted">No quote requests yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-card text-xs tracking-wider text-muted uppercase">
                <tr>
                  <th scope="col" className="p-3">Received</th>
                  <th scope="col" className="p-3">Service</th>
                  <th scope="col" className="p-3">Size</th>
                  <th scope="col" className="p-3">Contact</th>
                  <th scope="col" className="p-3">Note</th>
                  <th scope="col" className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => {
                  const service = labelFor(SERVICE_OPTIONS, q.service);
                  return (
                    <tr key={q.quote_request_id} className="border-t border-line align-top">
                      <td className="p-3 whitespace-nowrap">{q.created_at}</td>
                      <td className="p-3">{service}</td>
                      <td className="p-3">{labelFor(SIZE_OPTIONS, q.size)}</td>
                      <td className="p-3">
                        {q.name && <span className="block font-semibold">{q.name}</span>}
                        <a href={`tel:${q.phone}`} className="underline">{q.phone}</a>
                        <a href={waLink(q.phone, q.name, service)} className="mt-1 block text-success underline">
                          Reply on WhatsApp<span className="sr-only"> to {q.name || q.phone}</span>
                        </a>
                      </td>
                      <td className="max-w-xs p-3 text-muted">{q.note || "—"}</td>
                      <td className="p-3">
                        <StatusSelect kind="quote" id={q.quote_request_id} initial={q.status} label={`Status for quote ${q.quote_request_id}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-12" aria-labelledby="queries-h">
        <h2 id="queries-h" className="text-xl font-bold">Contact queries ({queries.length})</h2>
        {queries.length === 0 ? (
          <p className="mt-3 text-muted">No contact queries yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {queries.map((q) => (
              <li key={q.query_id} className="rounded-xl border border-line bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{q.name}</p>
                    <p className="text-sm text-muted">{q.contact} · {q.submitted_date}</p>
                  </div>
                  <StatusSelect kind="contact" id={q.query_id} initial={q.status} label={`Status for query from ${q.name}`} />
                </div>
                <p className="mt-3 whitespace-pre-line text-[#c3c9d3]">{q.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
