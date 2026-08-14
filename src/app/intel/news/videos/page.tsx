import Link from "next/link";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { CuratedNewsFeed } from "@/components/intel/CuratedNewsFeed";
import { NEWS_CATEGORIES } from "@/lib/news/catalog";
export default function NewsVideosPage() { return <div className="min-h-screen bg-[#020817] px-4 py-10 text-white"><div className="mx-auto max-w-7xl"><Link href="/intel/news" className="text-sm text-cyan-300"><ArrowLeft className="mr-2 inline h-4 w-4" />All news</Link><h1 className="mt-8 flex items-center gap-3 text-4xl font-bold"><PlayCircle className="text-[#FFBF00]" />Video briefings</h1><p className="mb-8 mt-3 text-slate-400">Publisher video coverage and visual explainers, organized inside GEM.</p><CuratedNewsFeed categories={[...NEWS_CATEGORIES]} videoOnly /></div></div>; }
