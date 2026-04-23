"use client";

// GEM Intel — curated feed client.
// Fetches /api/intel/news with category filter and cursor-based pagination.
// Renders a hero + grid layout of NewsArticleCard components.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NewsArticleCard,
  NewsArticleCardSkeleton,
  type NewsArticleCardData,
} from "./NewsArticleCard";

export type CuratedCategory = {
  label: string;
  slug: string; // matches API accepted slug
};

type FetchState = {
  items: NewsArticleCardData[];
  nextCursor: string | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
};

const INITIAL_STATE: FetchState = {
  items: [],
  nextCursor: null,
  loading: true,
  loadingMore: false,
  error: null,
};

export function CuratedNewsFeed({
  categories,
  initialCategory,
}: {
  categories: CuratedCategory[];
  initialCategory?: string;
}) {
  const [activeSlug, setActiveSlug] = useState<string>(
    initialCategory ?? "all",
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [state, setState] = useState<FetchState>(INITIAL_STATE);

  // Debounce search to avoid hammering the API.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadInitial = useCallback(async () => {
    setState({ ...INITIAL_STATE, loading: true });
    try {
      const params = new URLSearchParams();
      if (activeSlug !== "all") params.set("category", activeSlug);
      if (debouncedSearch) params.set("q", debouncedSearch);
      params.set("limit", "18");

      const res = await fetch(`/api/intel/news?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Feed returned ${res.status}`);
      const data = (await res.json()) as {
        items: NewsArticleCardData[];
        nextCursor: string | null;
      };
      setState({
        items: data.items,
        nextCursor: data.nextCursor,
        loading: false,
        loadingMore: false,
        error: null,
      });
    } catch (err) {
      setState({
        items: [],
        nextCursor: null,
        loading: false,
        loadingMore: false,
        error: err instanceof Error ? err.message : "Failed to load feed",
      });
    }
  }, [activeSlug, debouncedSearch]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (!state.nextCursor || state.loadingMore) return;
    setState((s) => ({ ...s, loadingMore: true }));
    try {
      const params = new URLSearchParams();
      if (activeSlug !== "all") params.set("category", activeSlug);
      if (debouncedSearch) params.set("q", debouncedSearch);
      params.set("limit", "18");
      params.set("cursor", state.nextCursor);

      const res = await fetch(`/api/intel/news?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Feed returned ${res.status}`);
      const data = (await res.json()) as {
        items: NewsArticleCardData[];
        nextCursor: string | null;
      };
      setState((s) => ({
        items: [...s.items, ...data.items],
        nextCursor: data.nextCursor,
        loading: false,
        loadingMore: false,
        error: null,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loadingMore: false,
        error: err instanceof Error ? err.message : "Failed to load more",
      }));
    }
  }, [activeSlug, debouncedSearch, state.nextCursor, state.loadingMore]);

  // Infinite scroll trigger
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !state.nextCursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, state.nextCursor]);

  const heroArticle = state.items[0];
  const gridArticles = useMemo(() => state.items.slice(1), [state.items]);

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
          <button
            onClick={() => setActiveSlug("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
              activeSlug === "all"
                ? "bg-primary/10 text-primary border-primary/40"
                : "bg-transparent text-muted-foreground border-border/60 hover:border-primary/30 hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => {
            const isActive = cat.slug === activeSlug;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveSlug(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary/40"
                    : "bg-transparent text-muted-foreground border-border/60 hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories"
              className="pl-9 w-64 h-9 bg-card/50 border-border/60 text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadInitial()}
            className="border-border/60 gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* States */}
      {state.error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3 text-sm">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-destructive">
              Couldn&apos;t load the feed
            </p>
            <p className="text-muted-foreground">{state.error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => loadInitial()}>
            Retry
          </Button>
        </div>
      )}

      {state.loading && (
        <>
          <NewsArticleCardSkeleton hero />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <NewsArticleCardSkeleton key={i} />
            ))}
          </div>
        </>
      )}

      {!state.loading && !state.error && state.items.length === 0 && (
        <div className="rounded-xl border border-border/60 bg-card/30 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No articles yet for this view. Run an ingestion cycle from the admin
            console or check back after the next cron run.
          </p>
        </div>
      )}

      {!state.loading && state.items.length > 0 && (
        <>
          {heroArticle && <NewsArticleCard article={heroArticle} variant="hero" />}
          {gridArticles.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {gridArticles.map((article) => (
                <NewsArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />

      {state.loadingMore && (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading more stories…
        </div>
      )}

      {!state.loadingMore && state.nextCursor && state.items.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={loadMore} className="border-border/60">
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
