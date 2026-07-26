import { NextRequest, NextResponse } from "next/server";
import { getLegacyFacebookSupabase } from "@/lib/facebook/legacy-supabase";
import {
  correlationId,
  requireTokMetricSession,
  requireWorkspaceAccess,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId")?.trim();
    const connectorId = request.nextUrl.searchParams.get("connectorId")?.trim();
    if (!workspaceId || !connectorId) {
      throw new TokMetricError(
        400,
        "VALIDATION_ERROR",
        "workspaceId and connectorId are required.",
      );
    }
    await requireWorkspaceAccess(workspaceId, session);
    const supabase = getLegacyFacebookSupabase();
    const today = new Date();
    const thirtyDaysLater = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    const { data: content, error } = await supabase
      .from("facebook_content_items")
      .select(`
        id,
        content_type,
        category,
        status,
        scheduled_publish_time,
        current_version_id
      `)
      .eq("workspace_id", workspaceId)
      .eq("social_connector_id", connectorId)
      .gte("scheduled_publish_time", today.toISOString())
      .lte("scheduled_publish_time", thirtyDaysLater.toISOString())
      .order("scheduled_publish_time", { ascending: true });
    if (error) throw error;
    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        calendar: content || [],
        period: {
          start: today.toISOString(),
          end: thirtyDaysLater.toISOString(),
        },
        legacyReadOnly: true,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}

/**
 * New content must be created and versioned in the shared TokMetric content
 * workflow so compliance and exact-version approvals can be bound to it.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "LEGACY_FACEBOOK_CONTENT_AUTHORING_DISABLED",
        message:
          "Create Facebook content through the shared Content Studio and approval workflow.",
      },
      externalActionTaken: false,
    },
    {
      status: 409,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
