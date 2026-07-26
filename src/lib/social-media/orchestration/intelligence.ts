import { db } from "@/lib/db";
import type {
  MarketSignal,
  RecentPublishedContent,
} from "../planning/daily-flow";
import type { SocialMediaProviderId } from "../providers";

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function provider(value: unknown): SocialMediaProviderId | undefined {
  const candidate = text(value);
  return candidate &&
    [
      "TIKTOK",
      "FACEBOOK_PAGE",
      "INSTAGRAM_PROFESSIONAL",
      "X",
      "NEXTDOOR",
      "INDEED_EMPLOYER",
      "LINKEDIN_COMPANY",
      "YOUTUBE",
    ].includes(candidate)
    ? (candidate as SocialMediaProviderId)
    : undefined;
}

function clamp(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export async function loadCurrentMarketSignals(input: {
  planDate: Date;
  lookbackHours?: number;
  limit?: number;
}): Promise<MarketSignal[]> {
  const lookbackHours = Math.max(1, input.lookbackHours ?? 72);
  const since = new Date(input.planDate.getTime() - lookbackHours * 60 * 60 * 1000);
  const articles = await db.newsArticle.findMany({
    where: {
      status: "published",
      publishedAt: { gte: since, lte: input.planDate },
      category: { in: ["cybersecurity", "policy", "markets"] },
    },
    orderBy: [{ relevanceScore: "desc" }, { publishedAt: "desc" }],
    take: Math.max(1, Math.min(100, input.limit ?? 30)),
  });

  return articles.map((article) => {
    const ageHours = Math.max(
      0,
      (input.planDate.getTime() - article.publishedAt.getTime()) / (60 * 60 * 1000),
    );
    const freshness = clamp(1 - ageHours / lookbackHours);
    return {
      id: `news:${article.id}`,
      topic: article.title,
      summary:
        article.aiSummary?.trim() ||
        article.summary?.trim() ||
        "Current cybersecurity market development requiring editorial review.",
      relevance: clamp(article.relevanceScore / 100),
      momentum: freshness,
      observedAt: article.publishedAt,
      sourceReference: article.externalUrl,
    };
  });
}

export async function loadGeneratedContentHistory(input: {
  workspaceId: string;
  planDate: Date;
}): Promise<RecentPublishedContent[]> {
  const versions = await db.contentVersion.findMany({
    where: {
      createdAt: { lte: input.planDate },
      content: { workspaceId: input.workspaceId },
    },
    select: { settings: true, createdAt: true },
  });

  return versions.flatMap((version) => {
    const settings = object(version.settings);
    const orchestrator = object(settings.orchestrator);
    const fingerprint = text(orchestrator.fingerprint);
    const contentProvider = provider(orchestrator.provider);
    return fingerprint && contentProvider
      ? [
          {
            fingerprint,
            provider: contentProvider,
            publishedAt: version.createdAt,
          },
        ]
      : [];
  });
}

const metricWeights: Record<string, number> = {
  views: 0.25,
  impressions: 0.2,
  likes: 0.75,
  reactions: 0.75,
  comments: 1.5,
  shares: 2,
  saves: 1.75,
  clicks: 1.25,
  watch_time_seconds: 0.1,
};

export async function applyEngagementLearning(input: {
  workspaceId: string;
  planDate: Date;
  signals: readonly MarketSignal[];
  lookbackDays?: number;
}): Promise<MarketSignal[]> {
  const since = new Date(
    input.planDate.getTime() - Math.max(1, input.lookbackDays ?? 14) * 24 * 60 * 60 * 1000,
  );
  const snapshots = await db.analyticsSnapshot.findMany({
    where: {
      workspaceId: input.workspaceId,
      capturedAt: { gte: since, lte: input.planDate },
      metric: { in: Object.keys(metricWeights) },
    },
    orderBy: { capturedAt: "desc" },
    take: 2000,
  });

  const scoreBySignal = new Map<string, number>();
  for (const snapshot of snapshots) {
    const dimensions = object(snapshot.dimensions);
    const signalId = text(dimensions.signalId);
    if (!signalId) continue;
    const numericValue = Number(snapshot.value.toString());
    if (!Number.isFinite(numericValue) || numericValue <= 0) continue;
    const contribution =
      Math.log10(1 + numericValue) * (metricWeights[snapshot.metric] ?? 0);
    scoreBySignal.set(signalId, (scoreBySignal.get(signalId) ?? 0) + contribution);
  }

  return input.signals.map((signal) => {
    const learned = scoreBySignal.get(signal.id) ?? 0;
    const boost = Math.min(0.2, learned / 50);
    return {
      ...signal,
      relevance: clamp(signal.relevance + boost),
      momentum: clamp(signal.momentum + boost / 2),
    };
  });
}

export function mergeMarketSignals(
  primary: readonly MarketSignal[],
  secondary: readonly MarketSignal[],
) {
  const merged = new Map<string, MarketSignal>();
  for (const signal of [...primary, ...secondary]) {
    const key = `${signal.id}|${signal.topic.trim().toLowerCase()}`;
    const existing = merged.get(key);
    if (!existing || signal.observedAt > existing.observedAt) merged.set(key, signal);
  }
  return [...merged.values()];
}
