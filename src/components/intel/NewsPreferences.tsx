"use client";

import { useEffect, useState } from "react";
import { NEWS_CATEGORIES } from "@/lib/news/catalog";
const KEY = "gem.news.preferences.v1";

export function NewsPreferences() {
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => { try { setSelected(JSON.parse(localStorage.getItem(KEY) || "[]") as string[]); } catch { setSelected([]); } }, []);
  const toggle = (slug: string) => setSelected((value) => { const next = value.includes(slug) ? value.filter((item) => item !== slug) : [...value, slug]; localStorage.setItem(KEY, JSON.stringify(next)); return next; });
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{NEWS_CATEGORIES.map((category) => <button key={category.slug} type="button" onClick={() => toggle(category.slug)} className={`rounded-2xl border p-5 text-left transition ${selected.includes(category.slug) ? "border-cyan-400 bg-cyan-400/10 text-cyan-100" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25"}`}><span className="text-lg font-semibold">{category.label}</span><span className="mt-1 block text-xs opacity-70">{selected.includes(category.slug) ? "Following" : "Tap to follow"}</span></button>)}</div>;
}
