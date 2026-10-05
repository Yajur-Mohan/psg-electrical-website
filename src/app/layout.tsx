import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import StickyQuoteButton from "@/components/layout/StickyQuoteButton";
import SmoothScroll from "@/components/effects/SmoothScroll";
import Preloader from "@/components/cinematic/Preloader";
import { introScript } from "@/lib/stage";
import PageTransition from "@/components/cinematic/PageTransition";
import CursorFX from "@/components/cinematic/CursorFX";
import ScrollProgress from "@/components/cinematic/ScrollProgress";
import Chatbot from "@/components/chatbot/Chatbot";
import WhatsAppFloat from "@/components/whatsapp/WhatsAppFloat";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "PSG Electrical and Cables | Electrical & Solar Specialists",
    template: "%s | PSG Electrical and Cables",
  },
  description:
    "Electrical installations, fault finding, DB boards, CoC compliance and Trite Solar backup power for homes and businesses. Get a quote in three quick questions.",
  openGraph: {
    type: "website",
    siteName: "PSG Electrical and Cables",
    images: ["/og.svg"],
  },
};

export const viewport: Viewport = { themeColor: "#171a20" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-ZA" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        {/* Runs before hydration: decides whether the intro plays this session */}
        <Script id="intro-gate" strategy="beforeInteractive">
          {introScript}
        </Script>
        <Preloader />
        <a
          href="#main"
          className="sr-only z-[100] rounded bg-white px-4 py-3 font-bold text-black focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <ScrollProgress />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
        <StickyQuoteButton />
        <WhatsAppFloat />
        <Chatbot />
        <PageTransition />
        <CursorFX />
        <div aria-hidden="true" className="film-grain" />
      </body>
    </html>
  );
}
