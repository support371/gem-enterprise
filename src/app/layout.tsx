import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://gemcybersecurityassist.com"),
  title: {
    default: "GEM Enterprise | Cybersecurity-First Enterprise Platform",
    template: "%s | GEM Enterprise",
  },
  description:
    "GEM Enterprise delivers institutional-grade cybersecurity, financial security, and real estate protection for qualified clients. Threat intelligence, asset protection, and client operations.",
  keywords: [
    "GEM Enterprise",
    "cybersecurity",
    "enterprise security",
    "threat intelligence",
    "financial security",
    "asset protection",
    "SOC",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "GEM Enterprise",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#131a26" },
    { media: "(prefers-color-scheme: light)", color: "#f9f7f4" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware injects x-is-portal for authenticated /app/* and /access/* routes.
  // Suppress the marketing Navigation + Footer so the portal sidebar layout
  // renders without a colliding top nav bar.
  const headersList = await headers();
  const isPortal = headersList.get("x-is-portal") === "1";

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className="bg-background">
      <body>
        <Providers>
          {!isPortal && <Navigation />}
          <main className={isPortal ? undefined : "min-h-screen"}>{children}</main>
          {!isPortal && <Footer />}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
