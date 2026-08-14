import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, Newspaper, PlayCircle, Settings2, Sparkles } from "lucide-react";
import { CuratedNewsFeed } from "@/components/intel/CuratedNewsFeed";
import { NEWS_CATEGORIES } from "@/lib/news/catalog";

export const metadata: Metadata = { title: "GEM News | Live Intelligence", description: "GEM's native, continuously refreshed intelligence briefing.", alternates: { canonical: "/intel/news" } };
export default function IntelNewsPage() {
  return <div className="min-h-screen bg-[#020817] text-white">
    <header className="border-b border-white/10 bg-[#071426]"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200"><Sparkles className="h-3.5 w-3.5" /> Native GEM intelligence</div>
        <div className="flex items-center gap-3"><Newspaper className="h-9 w-9 text-[#FFBF00]" /><h1 className="text-4xl font-black tracking-tight sm:text-5xl">GEM News</h1></div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">One clear, continuously refreshed view of the stories shaping digital security, business, markets, policy, property and global operations.</p>
      </div><nav aria-label="News tools" className="flex flex-wrap gap-2">
        <Link className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:border-cyan-400/40" href="/intel/news/videos"><PlayCircle className="mr-2 inline h-4 w-4" />Videos</Link>
        <Link className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:border-cyan-400/40" href="/intel/news/saved"><Bookmark className="mr-2 inline h-4 w-4" />Saved</Link>
        <Link className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:border-cyan-400/40" href="/intel/news/preferences"><Settings2 className="mr-2 inline h-4 w-4" />Preferences</Link>
      </nav></div>
    </div></header>
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><CuratedNewsFeed categories={[...NEWS_CATEGORIES]} />
      <p className="mt-10 border-t border-white/10 pt-5 text-center text-xs leading-5 text-slate-500">Headlines and summaries are attributed to their publishers. Verify consequential claims with the original source.</p>
    </section>
  </div>;
}
