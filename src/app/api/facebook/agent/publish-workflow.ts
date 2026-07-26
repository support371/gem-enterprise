import { NextRequest, NextResponse } from "next/server";

/**
 * The legacy full-workflow agent is disabled because it generated unsupported
 * claims, auto-approved its own output, wrote to a provider-specific queue, and
 * bypassed shared connector and publishing governance.
 *
 * Draft generation, compliance review, second-human approval, queueing, and
 * publishing must now happen through the shared Content Studio and governed
 * social publishing endpoints.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "LEGACY_AUTONOMOUS_PUBLISH_WORKFLOW_DISABLED",
        message:
          "Use the shared content, compliance, approval, and social publishing workflow.",
      },
      contentEndpoint: "/api/tokmetric/content",
      publishingEndpoint: "/api/social-media/publishing/jobs",
      externalActionTaken: false,
    },
    {
      status: 409,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
