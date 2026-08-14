import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
export const metadata: Metadata = { title: "Native News Automation | GEM Enterprise Command Center", description: "GEM's built-in news ingestion and discovery system." };
export default function NativeNewsIntegrationPage() { return <section className="rounded-2xl border border-cyan-500/20 bg-card/80 p-7"><Newspaper className="h-8 w-8 text-cyan-300" /><h1 className="mt-5 text-3xl font-bold text-white">Native News Automation</h1><p className="mt-3 max-w-3xl leading-7 text-slate-400">GEM News is rendered by the main platform. Curated publisher feeds are deduplicated and refreshed by the secured Supabase scheduler every two hours; no external site, frame, or branding dependency is used.</p><Link href="/intel/news" className="mt-6 inline-flex rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-[#04121f]">Open GEM News</Link></section>; }
