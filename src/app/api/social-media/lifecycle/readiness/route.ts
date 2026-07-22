import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  correlationId,
  requireTokMetricSession,
  requireWorkspaceAccess,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";
import { socialOAuthProviders } from "@/lib/social-media/oauth/config";
import {
  socialConnectorLifecycleVersion,
} from "@/lib/social-media/oauth/lifecycle";
import { listRegisteredSocialLifecycleProviders } from "@/lib/social-media/oauth/lifecycle-registry";

const querySchema = z.object({
  workspaceId: z.string().trim().min(1),
});

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) {
      throw new TokMetricError(400, "VALIDATION_ERROR", "workspaceId is required.");
    }
    const { workspaceId } = parsed.data;

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
    const response = tokMetricErrorResponse(error, cid);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}
