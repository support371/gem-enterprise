"use client";

import { useEffect, useState } from "react";
import { BookmarkX } from "lucide-react";
import { NewsArticleCard, type NewsArticleCardData } from "./NewsArticleCard";

const KEY = "gem.news.saved.v1";

export function SavedNewsLibrary() {
  const [items, setItems] = useState<NewsArticleCardData[]>([]);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || "[]") as NewsArticleCardData[]); } catch { setItems([]); }
  }, []);
  if (!items.length) return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center text-slate-400"><BookmarkX className="mx-auto mb-4 h-9 w-9" /><p>Save stories from GEM News and they will appear here on this device.</p></div>;
  return <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => <NewsArticleCard key={item.id} article={item} />)}</div>;
}
