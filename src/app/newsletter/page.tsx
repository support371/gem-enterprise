import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Newspaper,
  ShieldCheck,
} from "lucide-react";
import NewsletterSignupForm from "./NewsletterSignupForm";

export const metadata: Metadata = {
  title: "GEM News & Security Intelligence Newsletter",
  description:
    "Subscribe to the GEM News companion newsletter for cybersecurity awareness, threat-intelligence summaries, service updates, and operational-risk guidance.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/newsletter" },
};

const topics = [
  "Cybersecurity awareness and practical risk reduction",
  "Threat-intelligence and exposure-review summaries",
  "GEM service, platform, and operational updates",
  "Compliance and business-risk guidance with appropriate disclaimers",
];

export default function NewsletterPage() {
  return (
    <main className="min-h-screen bg-[#0d121b] text-white">
      <section className="border-b border-white/10 bg-[#101824]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to GEM Enterprise
          </Link>
          <Link
            href="/intel/news"
            className="inline-flex items-center gap-2 rounded-full border border-[#FFBF00]/30 bg-[#FFBF00]/10 px-4 py-2 text-sm font-semibold text-[#FFBF00] transition hover:bg-[#FFBF00]/15"
          >
            <Newspaper className="h-4 w-4" aria-hidden="true" />
            Open live GEM News
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[#FFBF00]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              GEM News companion channel
            </div>

            <h1 className="mt-7 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              GEM News & Security Intelligence Updates
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
              Read the live channel inside GEM at <Link href="/intel/news" className="font-semibold text-[#FFBF00] hover:underline">GEM News</Link>, then opt in here for carefully reviewed summaries and platform updates delivered by email. Public messages remain informational and do not replace a scoped engagement, incident-response plan, legal advice, or regulatory determination.
            </p>

            <div className="mt-9 space-y-4">
              {topics.map((topic) => (
                <div key={topic} className="flex items-start gap-3 text-white/70">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300"
                    aria-hidden="true"
                  />
                  <span className="leading-7">{topic}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-[#FFBF00]/20 bg-[#FFBF00]/[0.06] p-5 text-sm leading-6 text-amber-50/80">
              Subscription requires email confirmation. GEM does not add purchased,
              scraped, or third-party lists, and unconfirmed addresses are not part
              of the active mailing audience.
            </div>
          </div>

          <NewsletterSignupForm />
        </div>
      </section>
    </main>
  );
}
