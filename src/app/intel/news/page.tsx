"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Rss,
  Shield,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CuratedNewsFeed,
  type CuratedCategory,
} from "@/components/intel/CuratedNewsFeed";

// Base44-hosted fallback kept while the native feed is warming up.
const GEM_INTEL_FEED_URL =
  "https://gem-intel-copy-769950ea.base44.app/news/category/crypto";

const CATEGORIES: CuratedCategory[] = [
  { label: "Crypto & Digital Assets", slug: "crypto" },
  { label: "Cybersecurity", slug: "cybersecurity" },
  { label: "Markets & Capital", slug: "markets" },
  { label: "Geopolitics", slug: "geopolitics" },
  { label: "Policy & Regulation", slug: "policy" },
  { label: "Real Estate", slug: "real-estate" },
];

export default function IntelNewsPage() {
  const [expanded, setExpanded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState("crypto");

  const iframeSrc = `https://gem-intel-copy-769950ea.base44.app/news/category/${activeCategory}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative border-b border-border cyber-grid">
        <div className="container mx-auto px-6 py-16 md:py-20 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest">
                  <Rss className="h-3 w-3 mr-1.5" /> GEM INTEL · LIVE + CURATED
                </Badge>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                  Updating
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
                GEM Intel{" "}
                <span className="text-gradient-primary">News Feed</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                Continuous intelligence across crypto, cybersecurity, markets,
                geopolitics, policy, and alternatives — ingested every three
                hours and curated by the GEM analyst team.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold gap-2"
                asChild
              >
                <Link href="/community#newsletters">
                  Subscribe to Newsletters <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-border/60 gap-2"
                asChild
              >
                <a
                  href={iframeSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" /> Open Standalone
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TABS: CURATED (native) + LIVE (iframe) ═══════════════════════════ */}
      <section className="container mx-auto px-6 py-10 max-w-6xl">
        <Tabs defaultValue="curated" className="w-full">
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <TabsList className="bg-card/50 border border-border/60">
              <TabsTrigger value="curated" className="gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Curated
              </TabsTrigger>
              <TabsTrigger value="live" className="gap-2">
                <Rss className="h-3.5 w-3.5" />
                Live (Base44)
              </TabsTrigger>
            </TabsList>
            <div className="text-xs text-muted-foreground font-mono">
              Cron: every 3h · 17 sources
            </div>
          </div>

          {/* ── Curated (native DB) ─────────────────────────────────────── */}
          <TabsContent value="curated" className="mt-0">
            <CuratedNewsFeed
              categories={CATEGORIES}
              initialCategory="crypto"
            />
          </TabsContent>

          {/* ── Live (embedded iframe) ──────────────────────────────────── */}
          <TabsContent value="live" className="mt-0">
            {/* Category rail */}
            <div className="mb-6 -mx-1 px-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max">
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mr-2">
                  Categories
                </span>
                {CATEGORIES.map((cat) => {
                  const isActive = cat.slug === activeCategory;
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        setActiveCategory(cat.slug);
                        setIframeKey((k) => k + 1);
                      }}
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
            </div>

            <div
              className={`transition-all duration-500 ${
                expanded ? "fixed inset-0 z-50 bg-background" : ""
              }`}
            >
              <div
                className={`flex items-center justify-between mb-3 ${
                  expanded ? "px-4 pt-4" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    GEM Intel —{" "}
                    {
                      CATEGORIES.find((c) => c.slug === activeCategory)?.label
                    }
                  </span>
                  <Badge className="bg-primary/10 text-primary border-primary/30 text-xs font-mono">
                    Live Feed
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground text-xs gap-1.5"
                    onClick={() => setIframeKey((k) => k + 1)}
                    aria-label="Refresh feed"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground text-xs gap-1.5"
                    asChild
                  >
                    <a
                      href={iframeSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open Standalone
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border/50 text-xs gap-1.5"
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded ? (
                      <>
                        <Minimize2 className="h-3.5 w-3.5" /> Exit Fullscreen
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div
                className={`rounded-xl overflow-hidden border border-border/50 bg-black ${
                  expanded
                    ? "h-[calc(100vh-80px)] mx-4 mb-4"
                    : "h-[700px] md:h-[820px]"
                }`}
              >
                <iframe
                  key={iframeKey}
                  src={iframeSrc}
                  className="w-full h-full"
                  title="GEM Intel — Live News Feed"
                  allow="clipboard-read; clipboard-write"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* ══ CONTEXT STRIP ═════════════════════════════════════════════════════ */}
      <section className="border-t border-border py-16 container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="glass-panel bento-card border-border/50">
            <CardContent className="p-6">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-4">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Analyst-curated
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every headline is filtered, scored, and tagged by the GEM
                research team before it reaches members.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-panel bento-card border-border/50">
            <CardContent className="p-6">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-4">
                <Rss className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Push to Newsletters
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The most signal-dense stories are republished into the GEM
                Threat Wire and Financial Security Monitor each cycle.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-panel bento-card border-border/50">
            <CardContent className="p-6">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Member Briefings
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Community Hub members receive private commentary and context on
                high-impact stories through the{" "}
                <Link
                  href="/community-hub/knowledge"
                  className="text-primary hover:underline"
                >
                  Knowledge
                </Link>{" "}
                channel.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 text-center text-xs text-muted-foreground">
          Managing this feed?{" "}
          <Link
            href="/app/admin/news"
            className="text-primary hover:underline font-medium"
          >
            Open the admin console
          </Link>{" "}
          to trigger ingestion, toggle sources, and review run history.
        </div>
      </section>
    </main>
  );
}

// Silence unused-import warning for fallback URL kept as documentation.
void GEM_INTEL_FEED_URL;
