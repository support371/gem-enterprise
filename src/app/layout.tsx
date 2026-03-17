import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Playfair_Display, Manrope } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-serif",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans-atr",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://gem-enterprise.com"),
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${manrope.variable}`}>
      <body>
        <Providers>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
