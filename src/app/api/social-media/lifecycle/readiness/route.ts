import { NextRequest, NextResponse } from "next/server";
import {
  correlationId,
  requireTokMetricSession,
  requireWorkspaceAccess,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";
import { socialOAuthProviders } from "@/lib/social-media/oauth/config";
import {
  socialConnectorLifecycleVersion,
} from "@/lib/social-media/oauth/lifecycle";
import { listRegisteredSocialLifecycleProviders } from "@/lib/social-media/oauth/lifecycle-registry";

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId")?.trim();
    if (!workspaceId) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "workspaceId is required",
            correlationId: cid,
          },
        },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    await requireWorkspaceAccess(workspaceId, session);
    const registeredProviders = listRegisteredSocialLifecycleProviders();

    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        workspaceId,
        version: socialConnectorLifecycleVersion,
        supportedProviders: socialOAuthProviders,
        registeredProviders,
        operations: {
          accountDiscovery: registeredProviders.length > 0,
          tokenRefresh: registeredProviders.length > 0,
          healthChecks: registeredProviders.length > 0,
          externalRevocation: registeredProviders.length > 0,
          externalPublishing: false,
        },
        externalActionTaken: false,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
