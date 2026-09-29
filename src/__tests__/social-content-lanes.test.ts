import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  detectContentSourceKind,
  deriveContentLane,
  evaluateContentLaneDestination,
  readContentLaneMetadata,
} from "@/lib/social-media/orchestration/content-lanes";
import { generateCrossPlatformContentPackage } from "@/lib/social-media/orchestration/content-package";
import type {
  ApprovedSourceMaterial,
  DailyContentDraft,
  MarketSignal,
} from "@/lib/social-media/planning/daily-flow";
import type { SocialContentType } from "@/lib/social-media/policy";
import type { SocialMediaProviderId } from "@/lib/social-media/providers";

const approvedSource: ApprovedSourceMaterial = {
  id: "gem:security-readiness",
  title: "GEM security readiness",
  summary:
    "GEM helps qualified organizations review access, exposure, incident readiness, and practical security controls.",
  callToAction: "Review the GEM security readiness resources.",
  sourceReference: "https://www.gemcybersecurityassist.com/resources",
  approvedAt: new Date("2026-09-29T00:00:00.000Z"),
  approved: true,
};

function signal(sourceReference: string): MarketSignal {
  return {
    id: "signal:1",
    topic: "Fresh cybersecurity development",
    summary:
      "A current public development is receiving attention and needs a concise, verified explanation for business audiences.",
    relevance: 0.9,
    momentum: 0.8,
    observedAt: new Date("2026-09-29T00:00:00.000Z"),
    sourceReference,
  };
}

function draft(
  provider: SocialMediaProviderId,
  contentType: SocialContentType,
): DailyContentDraft {
  return {
    sequence: 1,
    provider,
    contentType,
    topic: "Fresh cybersecurity development",
    angle: "what changed today",
    sourceMaterialId: approvedSource.id,
    sourceReference: approvedSource.sourceReference,
    signalId: "signal:1",
    fingerprint: `fingerprint-${provider}-${contentType}`,
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

describe("social content lane router", () => {
  it("recognizes X and Threads as repurposing sources", () => {
    expect(detectContentSourceKind("https://x.com/source/status/1")).toBe("X");
    expect(
      detectContentSourceKind("https://www.threads.net/@source/post/1"),
    ).toBe("THREADS");
  });

  it("routes fresh X and Threads items into the TikTok viral repurposing lane", () => {
    expect(
      deriveContentLane({
        provider: "TIKTOK",
        contentType: "SHORT_VIDEO",
        signalReference: "https://x.com/source/status/1",
      }),
    ).toBe("TIKTOK_VIRAL_REPURPOSE");

    expect(
      deriveContentLane({
        provider: "TIKTOK",
        contentType: "PHOTO_POST",
        signalReference: "https://www.threads.net/@source/post/1",
      }),
    ).toBe("TIKTOK_VIRAL_REPURPOSE");
  });

  it("keeps YouTube faceless cinematic production as a separate lane", () => {
    expect(
      deriveContentLane({
        provider: "YOUTUBE",
        contentType: "LONG_VIDEO",
        signalReference: "https://example.com/story",
      }),
    ).toBe("FACELESS_CINEMATIC");
  });

  it("blocks content from being routed to the wrong destination", () => {
    const repurposeToYouTube = evaluateContentLaneDestination({
      lane: "TIKTOK_VIRAL_REPURPOSE",
      provider: "YOUTUBE",
      sourceKind: "X",
    });
    expect(repurposeToYouTube.allowed).toBe(false);
    expect(repurposeToYouTube.reasons).toContain(
      "CONTENT_LANE_DESTINATION_MISMATCH",
    );

    const facelessToTikTok = evaluateContentLaneDestination({
      lane: "FACELESS_CINEMATIC",
      provider: "TIKTOK",
      sourceKind: "OTHER",
    });
    expect(facelessToTikTok.allowed).toBe(false);
    expect(facelessToTikTok.reasons).toContain(
      "FACELESS_PRIMARY_DESTINATION_REQUIRED",
    );
  });

  it("builds transformed TikTok packages without copying source presentation", () => {
    const pkg = generateCrossPlatformContentPackage({
      draft: draft("TIKTOK", "SHORT_VIDEO"),
      source: approvedSource,
      signal: signal("https://x.com/source/status/1"),
    });

    expect(pkg.contentLane).toBe("TIKTOK_VIRAL_REPURPOSE");
    expect(pkg.sourceEvidence.sourceKind).toBe("X");
    expect(pkg.sourceEvidence.transformationRequired).toBe(true);
    expect(pkg.sourceEvidence.attributionRequired).toBe(true);
    expect(
      pkg.shortVideo.rendererInput.sourceTransformationRequired,
    ).toBe(true);
    expect(
      pkg.publishingChecklist.some(
        (item) => item.code === "SOURCE_TRANSFORMED",
      ),
    ).toBe(true);
    expect(
      pkg.riskFlags.some(
        (flag) => flag.code === "SOURCE_TRANSFORMATION_REQUIRED",
      ),
    ).toBe(true);
  });

  it("builds faceless cinematic YouTube packages with disclosure metadata", () => {
    const pkg = generateCrossPlatformContentPackage({
      draft: draft("YOUTUBE", "LONG_VIDEO"),
      source: approvedSource,
      signal: signal("https://example.com/original-concept"),
    });

    expect(pkg.contentLane).toBe("FACELESS_CINEMATIC");
    expect(pkg.shortVideo.format).toBe("LANDSCAPE");
    expect(pkg.shortVideo.rendererInput.aigcDisclosureRequired).toBe(true);
    expect(pkg.shortVideo.rendererInput.originalConceptRequired).toBe(true);
    expect(
      pkg.shortVideo.scenes.every(
        (scene) => scene.humanPresence === "OPTIONAL",
      ),
    ).toBe(true);
    expect(
      pkg.publishingChecklist.some(
        (item) => item.code === "AIGC_DISCLOSURE",
      ),
    ).toBe(true);
    expect(
      pkg.riskFlags.some((flag) => flag.code === "AIGC_DISCLOSURE_REQUIRED"),
    ).toBe(true);
  });

  it("treats older content without lane metadata as standard governed content", () => {
    expect(readContentLaneMetadata({})).toEqual(
      expect.objectContaining({
        lane: "STANDARD_GOVERNED",
        sourceKind: "OTHER",
      }),
    );
  });

  it("enforces the lane route guard before shared autopilot queue creation", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "src/lib/social-media/autopilot/service.ts",
      ),
      "utf8",
    );
    expect(source).toContain("evaluateContentLaneDestination");
    expect(source).toContain("CONTENT_LANE_DESTINATION_MISMATCH");
    expect(source).toContain("routingPolicyVersion");
  });
});
