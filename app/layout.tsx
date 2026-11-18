import type { Metadata } from "next";
import "./globals.css";
import { Header, MobileBottomNav } from "@/components/Header";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RoomPartner — Find a compatible roommate, broker-free",
    template: "%s · RoomPartner",
  },
  description:
    "Find a compatible room partner and a broker-free room, plus rent daily-needed household items. Chat, Squad Mode, verification, rent-split — ₹0 brokerage.",
  keywords: ["roommate", "flatmate", "broker-free room", "room partner", "rent household items", "Bengaluru"],
  authors: [{ name: "RoomPartner Team" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "RoomPartner",
    title: "RoomPartner — Find a compatible roommate, broker-free",
    description:
      "Compatible roommate matching, broker-free rooms, and household rentals — ₹0 brokerage.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "RoomPartner — Find a compatible roommate, broker-free",
    description: "Compatible roommate matching, broker-free rooms, and household rentals — ₹0 brokerage.",
  },
  icons: { icon: "/favicon.svg" },
  other: { "color-scheme": "light" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RoomPartner",
  url: siteUrl,
  description: "Find a compatible room partner and a broker-free room, plus rent daily-needed household items.",
  inLanguage: "en-IN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-16">{children}</main>
        <MobileBottomNav />
        <footer className="border-t border-zinc-200/70 bg-white pb-24 pt-8 lg:pb-8">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold text-ink-900">RoomPartner <span className="font-medium text-ink-400">· v9</span></p>
                <p className="mt-0.5 text-xs text-ink-500">Compatible roommates, broker-free rooms, household rentals — ₹0 brokerage.</p>
              </div>
              <div className="flex gap-2">
                <a href="/privacy" className="btn-secondary btn-sm">Privacy Policy</a>
                <a href="/terms" className="btn-secondary btn-sm">Terms of Use</a>
                <a href="/login" className="btn-secondary btn-sm">Sign in</a>
              </div>
            </div>
            <p className="mt-4 border-t border-zinc-100 pt-4 text-xs leading-relaxed text-ink-400">Demo mode runs with seed data until Supabase keys are set. Payments are test-mode only — no live Razorpay charge, no real OTP/KYC. Escrow is demo-only.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
