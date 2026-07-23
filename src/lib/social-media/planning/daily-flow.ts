import { createHash } from "node:crypto";
import type { SocialContentType } from "../policy";
import type { SocialMediaProviderId } from "../providers";

export interface MarketSignal {
  id: string;
  topic: string;
  summary: string;
  relevance: number;
  momentum: number;
  observedAt: Date;
  sourceReference: string;
  providers?: readonly SocialMediaProviderId[];
}

export interface ApprovedSourceMaterial {
  id: string;
  title: string;
  summary: string;
  callToAction: string;
  sourceReference: string;
  approvedAt: Date;
  approved: boolean;
  providers?: readonly SocialMediaProviderId[];
}

export interface RecentPublishedContent {
  fingerprint: string;
  provider: SocialMediaProviderId;
  publishedAt: Date;
}

export interface DailyContentPlanningInput {
  planDate: Date;
  marketSignals: readonly MarketSignal[];
  approvedSources: readonly ApprovedSourceMaterial[];
  recentPublishedContent: readonly RecentPublishedContent[];
  enabledProviders: readonly SocialMediaProviderId[];
  minimumTikTokItems?: number;
  maxItemsPerOtherProvider?: number;
  freshnessWindowDays?: number;
}

export interface DailyContentDraft {
  sequence: number;
  provider: SocialMediaProviderId;
  contentType: SocialContentType;
  topic: string;
  angle: string;
  sourceMaterialId: string;
  sourceReference: string;
  signalId: string;
  fingerprint: string;
  approvalRequired: true;
  complianceReviewRequired: true;
  externalActionTaken: false;
  humanInteraction: {
    required: true;
    responseMode: "REAL_TIME";
    livePerformanceReviewRequired: true;
  };
}

export interface DailyContentPlan {
  planDate: string;
  drafts: DailyContentDraft[];
  rejectedReasons: string[];
  externalActionTaken: false;
}

const providerFormats: Record<SocialMediaProviderId, readonly SocialContentType[]> = {
  TIKTOK: ["SHORT_VIDEO", "PHOTO_POST"],
  FACEBOOK_PAGE: ["TEXT", "IMAGE", "SHORT_VIDEO", "LONG_VIDEO", "LINK"],
  INSTAGRAM_PROFESSIONAL: ["REEL", "IMAGE", "CAROUSEL"],
  X: ["TEXT", "THREAD", "IMAGE", "SHORT_VIDEO"],
  NEXTDOOR: ["LOCAL_UPDATE", "IMAGE", "LINK"],
  INDEED_EMPLOYER: ["JOB_POSTING", "EMPLOYER_UPDATE"],
  LINKEDIN_COMPANY: ["TEXT", "IMAGE", "SHORT_VIDEO", "LONG_VIDEO", "ARTICLE", "JOB_LINK"],
  YOUTUBE: ["SHORT_VIDEO", "LONG_VIDEO"],
};

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function canonical(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function contentFingerprint(input: {
  provider: SocialMediaProviderId;
  topic: string;
  angle: string;
  sourceMaterialId: string;
  contentType: SocialContentType;
}) {
  return createHash("sha256")
    .update(
      [
        input.provider,
        input.contentType,
        canonical(input.topic),
        canonical(input.angle),
        input.sourceMaterialId,
      ].join("|"),
    )
    .digest("hex");
}

function compatible(
  provider: SocialMediaProviderId,
  providers?: readonly SocialMediaProviderId[],
) {
  return !providers?.length || providers.includes(provider);
}

function formatFor(provider: SocialMediaProviderId, sequence: number) {
  const formats = providerFormats[provider];
  return formats[(sequence - 1) % formats.length];
}

function angleFor(sequence: number, signal: MarketSignal, source: ApprovedSourceMaterial) {
  const frames = [
    "what changed today",
    "practical action to take now",
    "common risk and how to avoid it",
    "real-world scenario",
    "fast expert explanation",
    "audience question and direct answer",
    "myth versus reality",
    "behind-the-scenes operational view",
    "three-step checklist",
    "current market implication",
  ];
  const frame = frames[(sequence - 1) % frames.length];
  return `${frame}: ${signal.topic} through ${source.title}`;
}

function dailyTarget(provider: SocialMediaProviderId, input: DailyContentPlanningInput) {
  if (provider === "TIKTOK") return Math.max(20, input.minimumTikTokItems ?? 20);
  return Math.max(1, input.maxItemsPerOtherProvider ?? 3);
}

export function buildAdaptiveDailyContentPlan(
  input: DailyContentPlanningInput,
): DailyContentPlan {
  const rejectedReasons: string[] = [];
  const freshnessWindowDays = Math.max(1, input.freshnessWindowDays ?? 30);
  const cutoff = new Date(input.planDate);
  cutoff.setUTCDate(cutoff.getUTCDate() - freshnessWindowDays);

  const approvedSources = input.approvedSources.filter((source) => source.approved);
  if (!approvedSources.length) rejectedReasons.push("APPROVED_SOURCE_MATERIAL_REQUIRED");

  const rankedSignals = [...input.marketSignals]
    .filter((signal) => signal.observedAt <= input.planDate)
    .sort((a, b) => {
      const scoreA = clampScore(a.relevance) * 0.6 + clampScore(a.momentum) * 0.4;
      const scoreB = clampScore(b.relevance) * 0.6 + clampScore(b.momentum) * 0.4;
      return scoreB - scoreA || b.observedAt.getTime() - a.observedAt.getTime();
    });

  if (!rankedSignals.length) rejectedReasons.push("CURRENT_MARKET_SIGNAL_REQUIRED");

  const blockedFingerprints = new Set(
    input.recentPublishedContent
      .filter((item) => item.publishedAt >= cutoff)
      .map((item) => item.fingerprint),
  );
  const planFingerprints = new Set<string>();
  const drafts: DailyContentDraft[] = [];

  for (const provider of [...new Set(input.enabledProviders)]) {
    if (provider === "INDEED_EMPLOYER") continue;

    const providerSignals = rankedSignals.filter((signal) => compatible(provider, signal.providers));
    const providerSources = approvedSources.filter((source) => compatible(provider, source.providers));
    const target = dailyTarget(provider, input);

    if (!providerSignals.length || !providerSources.length) {
      rejectedReasons.push(`${provider}_PLANNING_INPUTS_UNAVAILABLE`);
      continue;
    }

    let attempts = 0;
    while (drafts.filter((draft) => draft.provider === provider).length < target) {
      attempts += 1;
      if (attempts > target * providerSignals.length * providerSources.length * 4) {
        rejectedReasons.push(`${provider}_UNIQUE_CONTENT_TARGET_NOT_REACHED`);
        break;
      }

      const providerSequence = drafts.filter((draft) => draft.provider === provider).length + 1;
      const signal = providerSignals[(attempts - 1) % providerSignals.length];
      const source = providerSources[
        Math.floor((attempts - 1) / providerSignals.length) % providerSources.length
      ];
      const contentType = formatFor(provider, providerSequence);
      const angle = angleFor(attempts, signal, source);
      const fingerprint = contentFingerprint({
        provider,
        topic: signal.topic,
        angle,
        sourceMaterialId: source.id,
        contentType,
      });

      if (blockedFingerprints.has(fingerprint) || planFingerprints.has(fingerprint)) continue;
      planFingerprints.add(fingerprint);

      drafts.push({
        sequence: providerSequence,
        provider,
        contentType,
        topic: signal.topic,
        angle,
        sourceMaterialId: source.id,
        sourceReference: source.sourceReference,
        signalId: signal.id,
        fingerprint,
        approvalRequired: true,
        complianceReviewRequired: true,
        externalActionTaken: false,
        humanInteraction: {
          required: true,
          responseMode: "REAL_TIME",
          livePerformanceReviewRequired: true,
        },
      });
    }
  }

  return {
    planDate: input.planDate.toISOString().slice(0, 10),
    drafts,
    rejectedReasons: [...new Set(rejectedReasons)],
    externalActionTaken: false,
  };
}
