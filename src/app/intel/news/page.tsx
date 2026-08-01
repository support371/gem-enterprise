import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Newspaper, Radio, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const NEWS_FORGE_URL =
  process.env.NEXT_PUBLIC_NEWS_FORGE_URL?.replace(/\/$/, "") ||
  "https://news-forge-feed.lovable.app";

export const metadata: Metadata = {
  title: "GEM News Channel | Live Intelligence Feed",
  description:
    "GEM's live News Forge channel for cybersecurity, markets, business, technology, world affairs, and operational intelligence.",
};

export default function IntelNewsPage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#03132b]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,191,0,0.16),transparent_38%),radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_34%)]" />
        <div className="relative mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#FFBF00]/30 bg-[#FFBF00]/10 shadow-[0_0_30px_rgba(255,191,0,0.12)]">
                <Newspaper className="h-6 w-6 text-[#FFBF00]" aria-hidden="true" />
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/10">
                    <Radio className="mr-1.5 h-3 w-3" /> LIVE CHANNEL
                  </Badge>
                  <Badge className="border-white/15 bg-white/5 text-slate-300 hover:bg-white/5">
                    <ShieldCheck className="mr-1.5 h-3 w-3 text-sky-300" /> GEM VERIFIED ACCESS POINT
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  GEM News <span className="text-[#FFBF00]">Forge</span>
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                  The complete GEM intelligence news experience, presented inside the enterprise platform with its live feed, story pages, saved items, preferences, and editorial functions preserved.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href="/intel">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Intelligence Center
                </Link>
              </Button>
              <Button asChild className="bg-[#FFBF00] font-semibold text-[#001F3F] hover:bg-[#ffd04d]">
                <a href={NEWS_FORGE_URL} target="_blank" rel="noopener noreferrer">
                  Open full channel <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1800px] px-2 py-2 sm:px-4 sm:py-4">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#020817] shadow-2xl shadow-black/30 sm:rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#07152c] px-4 py-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              News Forge connected
            </div>
            <span className="hidden font-mono sm:inline">news.gemcybersecurityassist.com</span>
          </div>

          <iframe
            src={NEWS_FORGE_URL}
            title="GEM News Forge live channel"
            className="h-[calc(100vh-13rem)] min-h-[720px] w-full bg-[#020817]"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="clipboard-read; clipboard-write; fullscreen; autoplay"
          />
        </div>

        <p className="px-3 py-4 text-center text-xs leading-5 text-slate-500">
          News content is informational and may change rapidly. Verify material claims with the original publisher before making security, financial, legal, or operational decisions.
        </p>
      </section>
    </main>
  );
}
