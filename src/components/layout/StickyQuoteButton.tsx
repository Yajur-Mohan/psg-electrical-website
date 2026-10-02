"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Mobile-only sticky CTA (MASTER-IMPLEMENTATION §1.1). Hidden where the flow is already on screen.
export default function StickyQuoteButton() {
  const pathname = usePathname();
  if (pathname === "/quote" || pathname.startsWith("/admin")) return null;
  return (
    <Link
      href="/quote"
      className="bg-gradient-brand fixed right-4 bottom-4 left-4 z-40 flex min-h-12 items-center justify-center rounded-full font-extrabold shadow-2xl sm:hidden"
    >
      Get a free quote
    </Link>
  );
}
