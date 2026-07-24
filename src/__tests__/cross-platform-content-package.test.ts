import { describe, expect, it } from "vitest";
import { generateCrossPlatformContentPackage } from "@/lib/social-media/orchestration/content-package";
import type {
  ApprovedSourceMaterial,
  DailyContentDraft,
  MarketSignal,
} from "@/lib/social-media/planning/daily-flow";

const source: ApprovedSourceMaterial = {
  id: "gem-catalog:24-7-threat-monitoring",
  title: "24/7 Threat Monitoring Service",
  summary:
    "Continuous security monitoring, prioritized alerts, and structured incident escalation support.",
  callToAction:
    "Review the service at https://www.gemcybersecurityassist.com/store/24-7-threat-monitoring",
  sourceReference:
    "https://www.gemcybersecurityassist.com/store/24-7-threat-monitoring",
  approvedAt: new Date("2026-07-24T00:00:00.000Z"),
  approved: true,
};

const signal: MarketSignal = {
  id: "news:1",
  topic: "account takeover activity",
  summary:
    "Organizations are reviewing identity controls after renewed account takeover activity.",
  relevance: 0.9,
  momentum: 0.8,
  observedAt: new Date("2026-07-24T09:00:00.000Z"),
  sourceReference: "https://example.com/current-signal",
};

function draft(
  provider: DailyContentDraft["provider"],
  contentType: DailyContentDraft["contentType"],
): DailyContentDraft {
  return {
    sequence: 1,
    provider,
    contentType,
    topic: signal.topic,
    angle: "what changed today",
    sourceMaterialId: source.id,
    sourceReference: source.sourceReference,
    signalId: signal.id,
    fingerprint: `${provider.toLowerCase()}-fingerprint`,
    approvalRequired: true,
    complianceReviewRequired: true,
    externalActionTaken: false,
    humanInteraction: {
      required: true,
      responseMode: "REAL_TIME",
      livePerformanceReviewRequired: true,
    },
  };
}

describe("cross-platform content package", () => {
  it("produces renderer-independent video, visual, caption, CTA, and checklist data", () => {
    const result = generateCrossPlatformContentPackage({
      draft: draft("TIKTOK", "SHORT_VIDEO"),
      source,
      signal,
    });

    expect(result.shortVideo.aspectRatio).toBe("9:16");
    expect(result.shortVideo.rendererInput.humanReviewRequired).toBe(true);
    expect(result.shortVideo.scenes.some((scene) => scene.humanPresence === "REQUIRED")).toBe(true);
    expect(result.visualBrief.headline).toContain("account takeover activity");
    expect(result.publication.caption).toContain(source.summary);
    expect(result.publication.callToAction).toContain("gemcybersecurityassist.com");
    expect(result.publishingChecklist.length).toBeGreaterThan(5);
    expect(result.externalActionTaken).toBe(false);
  });

  it("keeps X copy within the configured publication limit", () => {
    const result = generateCrossPlatformContentPackage({
      draft: draft("X", "TEXT"),
      source,
      signal: { ...signal, summary: signal.summary.repeat(20) },
    });

    expect(result.publication.caption.length).toBeLessThanOrEqual(260);
  });

  it("blocks Nextdoor output without documented local context", () => {
    const result = generateCrossPlatformContentPackage({
      draft: draft("NEXTDOOR", "LOCAL_UPDATE"),
      source,
      signal,
    });

    expect(result.riskFlags).toContainEqual(
      expect.objectContaining({
        code: "NEXTDOOR_LOCAL_CONTEXT_REQUIRED",
        severity: "BLOCK",
      }),
    );
    expect(result.publishingChecklist.map((item) => item.code)).toContain(
      "LOCAL_CONTEXT",
    );
  });

  it("flags unsupported, regulatory, and security-sensitive source language", () => {
    const result = generateCrossPlatformContentPackage({
      draft: draft("FACEBOOK_PAGE", "TEXT"),
      source: {
        ...source,
        summary:
          "Our unhackable platform is fully compliant with ISO 27001 and includes an internal IP and API key workflow.",
      },
      signal,
    });
    const categories = result.riskFlags.map((flag) => flag.category);

    expect(categories).toContain("UNSUPPORTED_CLAIM");
    expect(categories).toContain("REGULATORY_CLAIM");
    expect(categories).toContain("SECURITY_SENSITIVE_DETAIL");
  });

  it("always requires exact-version human approval", () => {
    const result = generateCrossPlatformContentPackage({
      draft: draft("INSTAGRAM_PROFESSIONAL", "CAROUSEL"),
      source,
      signal,
    });

    expect(result.approvalRequired).toBe(true);
    expect(result.riskFlags).toContainEqual(
      expect.objectContaining({
        code: "EXACT_VERSION_HUMAN_APPROVAL_REQUIRED",
      }),
    );
  });
});
