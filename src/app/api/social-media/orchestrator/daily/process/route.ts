import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { orchestrateDailyContent } from "@/lib/social-media/orchestration/orchestrator";
import {
  socialMediaProviderIds,
  type SocialMediaProviderId,
} from "@/lib/social-media/providers";

function configuredSecret() {
  return (
    process.env.CONTENT_ORCHESTRATOR_CRON_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim()
  );
}

function authorized(request: NextRequest) {
  const configured = configuredSecret();
  const header = request.headers.get("authorization")?.trim();
  if (!configured || !header?.startsWith("Bearer ")) return false;
  const supplied = header.slice("Bearer ".length);
  const expectedBuffer = Buffer.from(configured);
  const suppliedBuffer = Buffer.from(supplied);
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
}

const defaultProviders: SocialMediaProviderId[] = [
  "TIKTOK",
  "FACEBOOK_PAGE",
  "INSTAGRAM_PROFESSIONAL",
  "X",
  "NEXTDOOR",
];

function configuredProviders(): SocialMediaProviderId[] {
  const configured = process.env.CONTENT_ORCHESTRATOR_PROVIDERS
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!configured?.length) return defaultProviders;
  const valid = [...new Set(configured)].filter(
    (candidate): candidate is SocialMediaProviderId =>
      socialMediaProviderIds.includes(candidate as SocialMediaProviderId),
  );
  return valid.length ? valid : defaultProviders;
}

function boundedInteger(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = value ? Number.parseInt(value, 10) : fallback;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

async function run(request: NextRequest) {
  const secret = configuredSecret();
  const workspaceId = process.env.CONTENT_ORCHESTRATOR_WORKSPACE_ID?.trim();
  const actorId = process.env.CONTENT_ORCHESTRATOR_ACTOR_ID?.trim();
  if (!secret || !workspaceId || !actorId) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CONTENT_ORCHESTRATOR_NOT_CONFIGURED",
          message:
            "Scheduled content orchestration requires a cron secret, workspace ID, and service actor ID.",
        },
      },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
  if (!authorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Content orchestrator authentication failed.",
        },
      },
      { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  try {
    const planDate = new Date();
    const result = await orchestrateDailyContent({
      workspaceId,
      actorId,
      correlationId: `content-orchestrator:${planDate.toISOString()}:${crypto.randomUUID()}`,
      planDate,
      enabledProviders: configuredProviders(),
      useGemCatalog: true,
      localContext:
        process.env.CONTENT_ORCHESTRATOR_NEXTDOOR_LOCAL_CONTEXT?.trim(),
      minimumTikTokItems: boundedInteger(
        process.env.CONTENT_ORCHESTRATOR_MINIMUM_TIKTOK_ITEMS,
        20,
        20,
        100,
      ),
      maxItemsPerOtherProvider: boundedInteger(
        process.env.CONTENT_ORCHESTRATOR_OTHER_PROVIDER_ITEMS,
        3,
        1,
        20,
      ),
      freshnessWindowDays: null,
      requestApprovals: true,
      forceRegenerate: false,
    });
    return NextResponse.json(
      {
        ok: true,
        campaignId: result.campaignId,
        reusedExistingPlan: result.reusedExistingPlan,
        generated: result.materialized.length,
        rejectedReasons: result.plan.rejectedReasons,
        externalActionTaken: false,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CONTENT_ORCHESTRATOR_RUN_FAILED",
          message: "The governed daily content run could not be completed.",
        },
      },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}
