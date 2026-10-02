import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid-lines grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="container-site">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-5 text-5xl font-extrabold uppercase">
          Circuit <span className="text-gradient">not found</span>
        </h1>
        <p className="mt-4 text-muted">The page you&apos;re looking for has tripped. Let&apos;s get you back on.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-12 items-center rounded bg-brand px-6 font-extrabold">Back to home</Link>
          <Link href="/quote" className="inline-flex min-h-12 items-center rounded border border-[#59606c] px-6 font-extrabold">Get a quote</Link>
        </div>
      </div>
    </section>
  );
}
