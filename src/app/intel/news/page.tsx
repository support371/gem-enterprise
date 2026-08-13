import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Mail,
  Newspaper,
  Radio,
  ServerCog,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ALLOWED_NEWS_HOSTS = new Set([
  "news.gemcybersecurityassist.com",
  "gemcybersecurityassist.com",
  "www.gemcybersecurityassist.com",
]);

// Public, non-secret production fallback. Vercel may still override this with
// the canonical news.gemcybersecurityassist.com host when that domain is ready.
const VERIFIED_NEWS_FORGE_URL =
  "https://id-preview-9bbada32--3ededa60-a168-4b51-928b-a3310f00bcbd.lovable.app";

function resolveNewsForgeUrl() {
  const raw =
    process.env.NEXT_PUBLIC_NEWS_FORGE_URL?.trim() || VERIFIED_NEWS_FORGE_URL;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") return null;

    const allowed =
      ALLOWED_NEWS_HOSTS.has(parsed.hostname) ||
      parsed.hostname.endsWith(".vercel.app") ||
      parsed.hostname.endsWith(".lovable.app");

    if (!allowed) return null;

    parsed.pathname = parsed.pathname.replace(/\/$/, "");
    parsed.search = "";
    parsed.hash = "";
    return parsed;
  } catch {
    return null;
  }
}

const NEWS_FORGE_URL = resolveNewsForgeUrl();
const NEWS_FORGE_EMBED_URL = NEWS_FORGE_URL
  ? new URL("/?embed=gem", NEWS_FORGE_URL).toString()
  : null;

export const metadata: Metadata = {
  title: "GEM News Channel | Live Intelligence Feed",
  description:
    "GEM's News Forge channel for cybersecurity, markets, business, technology, world affairs, and operational intelligence.",
  alternates: { canonical: "/intel/news" },
};

export default function IntelNewsPage() {
  if (NEWS_FORGE_URL) {
    redirect(NEWS_FORGE_URL.toString());
  }

  const connected = Boolean(NEWS_FORGE_EMBED_URL);

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
                  <Badge
                    className={
                      connected
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/10"
                        : "border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/10"
                    }
                  >
                    {connected ? (
                      <><Radio className="mr-1.5 h-3 w-3" /> CONNECTED CHANNEL</>
                    ) : (
                      <><ServerCog className="mr-1.5 h-3 w-3" /> HOST CONFIGURATION REQUIRED</>
                    )}
                  </Badge>
                  <Badge className="border-white/15 bg-white/5 text-slate-300 hover:bg-white/5">
                    <ShieldCheck className="mr-1.5 h-3 w-3 text-sky-300" /> GEM PLATFORM CHANNEL
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  GEM News <span className="text-[#FFBF00]">Forge</span>
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                  The complete News Forge experience inside the main GEM platform. Live feed,
                  story pages, saved items, preferences, authentication, and editorial functions
                  remain part of the connected news application.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href="/intel">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Intelligence Center
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#FFBF00]/30 bg-[#FFBF00]/5 text-[#FFBF00] hover:bg-[#FFBF00]/10 hover:text-[#ffd04d]">
                <Link href="/newsletter">
                  <Mail className="mr-2 h-4 w-4" /> News newsletter
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-sky-400/25 bg-sky-400/[0.06] text-sky-200 hover:bg-sky-400/10 hover:text-white">
                <Link href="/api/intel/news-forge/status">
                  <Activity className="mr-2 h-4 w-4" /> Channel status
                </Link>
              </Button>
              {NEWS_FORGE_URL ? (
                <Button asChild className="bg-[#FFBF00] font-semibold text-[#001F3F] hover:bg-[#ffd04d]">
                  <a href={NEWS_FORGE_URL.toString()} target="_blank" rel="noopener noreferrer">
                    Open full channel <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button disabled className="bg-slate-700 text-slate-300">
                  Channel host pending
                </Button>
              )}
            </div>
          </div>

          <nav aria-label="News channel routes" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
            <span>Canonical route: /intel/news</span>
            <Link href="/news" className="transition hover:text-[#FFBF00]">Quick route: /news</Link>
            <Link href="/news/newsletter" className="transition hover:text-[#FFBF00]">Newsletter route: /news/newsletter</Link>
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-[1800px] px-2 py-2 sm:px-4 sm:py-4">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#020817] shadow-2xl shadow-black/30 sm:rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#07152c] px-4 py-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span
                className={
                  connected
                    ? "h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                    : "h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.55)]"
                }
              />
              {connected ? "News Forge connected through GEM" : "News Forge host awaiting production configuration"}
            </div>
            <span className="hidden font-mono sm:inline">
              {NEWS_FORGE_URL?.host || "NEXT_PUBLIC_NEWS_FORGE_URL"}
            </span>
          </div>

          {NEWS_FORGE_EMBED_URL ? (
            <iframe
              src={NEWS_FORGE_EMBED_URL}
              title="GEM News Forge live channel"
              className="h-[calc(100vh-13rem)] min-h-[720px] w-full bg-[#020817]"
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="clipboard-read; clipboard-write; fullscreen; autoplay"
            />
          ) : (
            <div className="flex min-h-[620px] items-center justify-center px-6 py-16">
              <div className="max-w-2xl rounded-3xl border border-amber-400/20 bg-amber-400/[0.06] p-8 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 text-amber-300" aria-hidden="true" />
                <h2 className="mt-5 text-2xl font-bold">News Forge deployment connection pending</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  The platform integration is installed, but GEM will not load an unverified,
                  malformed, non-HTTPS, or unresolved external hostname. Connect the News Forge
                  deployment to <strong className="text-white">news.gemcybersecurityassist.com</strong> and set
                  <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5 text-amber-200">NEXT_PUBLIC_NEWS_FORGE_URL</code>
                  on the canonical GEM Vercel project.
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="px-3 py-4 text-center text-xs leading-5 text-slate-500">
          News content is informational and may change rapidly. Verify material claims with the
          original publisher before making security, financial, legal, or operational decisions.
        </p>
      </section>
    </main>
  );
}
