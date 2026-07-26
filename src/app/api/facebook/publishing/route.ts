import { NextRequest, NextResponse } from "next/server";
export { GET } from "@/app/api/social-media/publishing/jobs/route";

/**
 * Legacy Facebook publish/schedule compatibility boundary.
 *
 * The previous endpoint accepted a content id and created a provider-specific
 * job without shared compliance, approval, connector, scope, or live-gate
 * evidence. It is intentionally fail-closed. New requests must use the shared
 * governed queue at /api/social-media/publishing/jobs.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "LEGACY_FACEBOOK_PUBLISHING_MIGRATION_REQUIRED",
        message:
          "Facebook publishing now requires the shared content, compliance, approval, connector, and idempotency workflow.",
      },
      canonicalEndpoint: "/api/social-media/publishing/jobs",
      externalActionTaken: false,
    },
    {
      status: 409,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
