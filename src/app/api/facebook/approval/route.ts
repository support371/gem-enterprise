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
    if (!workspaceId) {
      throw new TokMetricError(400, "VALIDATION_ERROR", "workspaceId is required.");
    }
    await requireWorkspaceAccess(workspaceId, session);
    const supabase = getLegacyFacebookSupabase();
    const { data: pendingContent, error } = await supabase
      .from("facebook_content_items")
      .select(`
        id,
        content_type,
        category,
        status,
        scheduled_publish_time,
        facebook_content_versions(
          id,
          version_number,
          caption,
          hashtags,
          media_ids,
          approval_status
        )
      `)
      .eq("workspace_id", workspaceId)
      .eq("status", "IN_REVIEW")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        queue: pendingContent || [],
        legacyReadOnly: true,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}

/**
 * The previous route wrote `approved_by: system` and mutated content state
 * without a second authenticated human or exact-version approval binding.
 * Approval writes are now canonical only in the shared TokMetric workflow.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "LEGACY_FACEBOOK_APPROVAL_DISABLED",
        message:
          "Facebook approval must use the shared human approval workflow for the exact active content version.",
      },
      externalActionTaken: false,
    },
    {
      status: 409,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
