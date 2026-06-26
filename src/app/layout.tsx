import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/components/I18nProvider";
import { getDictionary } from "@/i18n/get-dictionary";
import { getDirection } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/server";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://gemcybersecurityassist.com"),
  title: {
    default: "GEM Enterprise | Defend. Protect. Prevail.",
    template: "%s | GEM Enterprise",
  },
  description: "GEM Enterprise integrated digital protection platform.",
  keywords: ["GEM Enterprise", "cybersecurity", "enterprise platform", "threat intelligence"],
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
    { media: "(prefers-color-scheme: dark)", color: "#0d121b" },
    { media: "(prefers-color-scheme: light)", color: "#f9f7f4" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [headersList, locale] = await Promise.all([headers(), getRequestLocale()]);
  const isPortal = headersList.get("x-is-portal") === "1";
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale} dir={getDirection(locale)} suppressHydrationWarning data-scroll-behavior="smooth" className="bg-[#0d121b]">
      <body className="bg-[#0d121b] text-white antialiased">
        <I18nProvider locale={locale} dictionary={dictionary}>
          <Providers>
            {!isPortal && (
              <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-cyan-300 focus:px-4 focus:py-2 focus:font-bold focus:text-[#071019]">
                Skip to main content
              </a>
            )}
            {!isPortal && <Navigation />}
            <main id="main-content" className={isPortal ? undefined : "min-h-screen"}>{children}</main>
            {!isPortal && <Footer />}
          </Providers>
        </I18nProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
