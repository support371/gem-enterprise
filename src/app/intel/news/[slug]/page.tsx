import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { GemVideoPlayer } from "@/components/video/GemVideoPlayer";
import { newsGateway } from "@/lib/supabase-gateway";

type Story = { item: { slug: string; title: string; summary: string | null; aiSummary: string | null; externalUrl: string; category: string; author: string | null; mediaType: "none" | "image" | "video"; imageUrl: string | null; imageAlt: string | null; videoUrl: string | null; videoThumbnail: string | null; videoProvider: string | null; publishedAt: string; source: { name: string; siteUrl: string | null } | null } };
async function load(slug: string) { try { return await newsGateway<Story>("story", { slug }); } catch { return null; } }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const data = await load(slug); return { title: data?.item.title || "GEM News", description: data?.item.aiSummary || data?.item.summary || "GEM News story" }; }
export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const data = await load(slug); if (!data) notFound(); const story = data.item;
  return <article className="min-h-screen bg-[#020817] px-4 py-10 text-white"><div className="mx-auto max-w-4xl"><Link href="/intel/news" className="text-sm text-cyan-300"><ArrowLeft className="mr-2 inline h-4 w-4" />Back to GEM News</Link>
    <div className="mt-8 text-xs font-semibold uppercase tracking-widest text-[#FFBF00]">{story.category.replace("_", " ")} · {story.source?.name}</div><h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{story.title}</h1><p className="mt-4 text-sm text-slate-500">{new Date(story.publishedAt).toLocaleString()} {story.author ? `· ${story.author}` : ""}</p>
    {story.mediaType === "video" && story.videoUrl ? <GemVideoPlayer
      src={story.videoUrl}
      title={story.title}
      description={`${story.aiSummary || story.summary || "Publisher video briefing."} Source: ${story.source?.name || "original publisher"}.`}
      poster={story.videoThumbnail || story.imageUrl}
      providerHint={story.videoProvider}
      externalUrl={story.externalUrl}
      showDescription
      className="mt-8 rounded-3xl"
    /> : story.imageUrl ? <div className="relative mt-8 overflow-hidden rounded-3xl border border-white/10">
      {/* Publisher media URLs are dynamic and intentionally retain source referrer isolation. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={story.imageUrl} alt={story.imageAlt || story.title} className="aspect-video w-full object-cover" referrerPolicy="no-referrer" />
    </div> : null}
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-lg leading-8 text-slate-200"><p>{story.aiSummary || story.summary || "Open the original publisher to read this report."}</p></div>
    <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-5"><p className="text-sm leading-6 text-slate-300">GEM presents a concise attributed briefing and does not republish the publisher&apos;s full work.</p><a href={story.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-[#04121f]">Read at {story.source?.name || "original source"}<ExternalLink className="ml-2 h-4 w-4" /></a></div>
  </div></article>;
}
