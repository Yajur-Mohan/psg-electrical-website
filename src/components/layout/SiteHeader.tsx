"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#252a33] bg-bg/95 backdrop-blur">
      <div className="container-site flex h-[74px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 font-extrabold tracking-wide">
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand to-[#1c4fd7] text-xl">
            ⚡
          </span>
          <span className="leading-tight">
            PSG ELECTRICAL
            <small className="block text-[10px] tracking-[0.15em] text-muted">AND CABLES · TRITE SOLAR</small>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-sm">
            {nav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`py-3 hover:text-white ${active ? "font-bold text-white" : "text-[#d4d8e0]"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/quote" className="hidden min-h-11 items-center rounded bg-brand px-5 text-sm font-extrabold tracking-wide sm:inline-flex">
            GET A QUOTE
          </Link>
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-md border border-line px-3 text-lg lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden="true">{open ? "✕" : "☰"}</span>
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-bg lg:hidden">
          <ul className="container-site grid py-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-3 text-[#d4d8e0] hover:text-white" aria-current={pathname === item.href ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/quote" className="mt-2 block rounded bg-brand py-3 text-center font-extrabold">
                GET A QUOTE
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
