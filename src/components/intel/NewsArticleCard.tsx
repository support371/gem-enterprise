"use client";

// GEM Intel — media-rich article card. Handles image, video thumbnail, and
// text-only variants. Designed to read equally well in a 1-up hero row or a
// 3-up grid.

import Link from "next/link";
import { ExternalLink, PlayCircle, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export type NewsArticleCardData = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  aiSummary?: string | null;
  externalUrl: string;
  category: string;
  tags: string[];
  author: string | null;
  mediaType: "none" | "image" | "video";
  imageUrl: string | null;
  imageAlt: string | null;
  videoUrl: string | null;
  videoThumbnail: string | null;
  videoProvider: string | null;
  isFeatured: boolean;
  isEditorsPick: boolean;
  publishedAt: string; // ISO
  source: {
    id: string;
    name: string;
    slug: string;
    siteUrl: string | null;
  } | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  crypto: "Crypto",
  cybersecurity: "Cybersecurity",
  markets: "Markets",
  geopolitics: "Geopolitics",
  policy: "Policy",
  real_estate: "Real Estate",
  alternatives: "Alternatives",
  general: "General",
};

function timeAgo(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function NewsArticleCard({
  article,
  variant = "default",
}: {
  article: NewsArticleCardData;
  variant?: "default" | "hero" | "compact";
}) {
  const isHero = variant === "hero";
  const isCompact = variant === "compact";
  const hasMedia = article.mediaType !== "none" && !!article.imageUrl;
  const categoryLabel =
    CATEGORY_LABEL[article.category] ?? article.category;
  const summary = article.aiSummary ?? article.summary;

  return (
    <Card
      className={`glass-panel bento-card border-border/50 overflow-hidden group transition-all hover:border-primary/40 ${
        isHero ? "md:flex md:flex-row" : "flex flex-col"
      }`}
    >
      {hasMedia && (
        <div
          className={`relative overflow-hidden bg-muted ${
            isHero
              ? "md:w-1/2 aspect-[16/10] md:aspect-auto"
              : isCompact
                ? "aspect-[16/9]"
                : "aspect-[16/9]"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.imageUrl ?? "/placeholder.svg"}
            alt={article.imageAlt ?? article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {article.mediaType === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="rounded-full bg-background/80 backdrop-blur-sm p-3 border border-border/50 group-hover:scale-110 transition-transform">
                <PlayCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-border/60 text-xs font-mono uppercase tracking-wider">
              {categoryLabel}
            </Badge>
            {article.isEditorsPick && (
              <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs gap-1">
                <Star className="h-3 w-3 fill-current" /> Editor&apos;s Pick
              </Badge>
            )}
          </div>
        </div>
      )}

      <CardContent
        className={`flex flex-col ${hasMedia && isHero ? "md:w-1/2" : ""} ${
          isCompact ? "p-4" : "p-5 md:p-6"
        } gap-3 flex-1`}
      >
        {!hasMedia && (
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/30 text-xs font-mono uppercase tracking-wider">
              {categoryLabel}
            </Badge>
            {article.isEditorsPick && (
              <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs gap-1">
                <Star className="h-3 w-3 fill-current" /> Editor&apos;s Pick
              </Badge>
            )}
            {article.aiSummary && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs gap-1">
                <Sparkles className="h-3 w-3" /> AI brief
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          {article.source?.name && <span>{article.source.name}</span>}
          {article.source?.name && <span aria-hidden>·</span>}
          <span>{timeAgo(article.publishedAt)}</span>
          {article.isFeatured && (
            <>
              <span aria-hidden>·</span>
              <span className="text-primary">Featured</span>
            </>
          )}
        </div>

        <h3
          className={`font-semibold text-foreground text-balance leading-tight group-hover:text-primary transition-colors ${
            isHero
              ? "text-2xl md:text-3xl"
              : isCompact
                ? "text-base"
                : "text-lg"
          }`}
        >
          <Link
            href={article.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0"
          >
            {article.title}
          </Link>
        </h3>

        {summary && !isCompact && (
          <p
            className={`text-muted-foreground text-pretty leading-relaxed ${
              isHero ? "text-base" : "text-sm"
            } line-clamp-3`}
          >
            {summary}
          </p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">
            {article.author ? `By ${article.author}` : article.source?.name ?? ""}
          </span>
          <span className="inline-flex items-center gap-1 text-primary font-medium relative z-10">
            Read <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function NewsArticleCardSkeleton({ hero = false }: { hero?: boolean }) {
  return (
    <div
      className={`glass-panel bento-card border-border/50 overflow-hidden ${
        hero ? "md:flex md:flex-row" : "flex flex-col"
      }`}
    >
      <div
        className={`bg-muted animate-pulse ${
          hero ? "md:w-1/2 aspect-[16/10] md:aspect-auto" : "aspect-[16/9]"
        }`}
      />
      <div
        className={`p-5 md:p-6 flex flex-col gap-3 flex-1 ${hero ? "md:w-1/2" : ""}`}
      >
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-6 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
