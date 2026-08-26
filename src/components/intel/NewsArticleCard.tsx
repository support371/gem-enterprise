"use client";



// GEM Intel — media-rich article card. Handles image, video thumbnail, and

// text-only variants. Designed to read equally well in a 1-up hero row or a

// 3-up grid.



import Link from "next/link";

import { Bookmark, ExternalLink, Sparkles, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";

import { GemVideoPlayer } from "@/components/video/GemVideoPlayer";



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
  
  autoPlayOnScroll = false,
  
}: {
  
  article: NewsArticleCardData;
  
  variant?: "default" | "hero" | "compact";
  
  autoPlayOnScroll?: boolean;
  
}) {
  
  const isHero = variant === "hero";
  
  const isCompact = variant === "compact";
  
  const hasVideo = article.mediaType === "video" && !!article.videoUrl;
  
  const hasMedia = hasVideo || (article.mediaType !== "none" && !!article.imageUrl);
  
  const categoryLabel =
    
    CATEGORY_LABEL[article.category] ?? article.category;
  
  const summary = article.aiSummary ?? article.summary;
  

  
  return (
    
    <Card
      
      className={`glass-panel bento-card relative border-border/50 overflow-hidden group transition-all hover:border-primary/40 ${
        
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
        
          {hasVideo ? (
          
            <GemVideoPlayer
              
              src={article.videoUrl}
              
              title={article.title}
              
              description={article.aiSummary ?? article.summary}
              
              poster={article.videoThumbnail ?? article.imageUrl}
              
              providerHint={article.videoProvider}
              
              externalUrl={article.externalUrl}
              
              autoPlayOnScroll={autoPlayOnScroll}
              
              className="relative z-20 h-full rounded-none border-0"
              
            />
          
          ) : (
          
            // eslint-disable-next-line @next/next/no-img-element
          
            <img
              
              src={article.imageUrl ?? "/placeholder.svg"}
              
              alt={article.imageAlt ?? article.title}
              
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              
              loading="lazy"
              
              referrerPolicy="no-referrer"
              
            />
          
          )}
        
          <div className="pointer-events-none absolute top-3 left-3 z-30 flex items-center gap-2">
          
            <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-border/60 text-xs</Card>





































































