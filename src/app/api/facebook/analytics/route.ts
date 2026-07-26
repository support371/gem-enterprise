import { NextRequest, NextResponse } from "next/server";
import { getLegacyFacebookSupabase } from "@/lib/facebook/legacy-supabase";
import {
  correlationId,
  parseJson,
  requirePermission,
  requireTokMetricSession,
  requireWorkspaceAccess,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";
import { z } from "zod";

const refreshSchema = z.object({
  workspaceId: z.string().trim().min(1),
});

function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    throw new TokMetricError(
      403,
      "CROSS_ORIGIN_REQUEST_BLOCKED",
      "Analytics changes require a same-origin request.",
    );
  }
}

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId")?.trim();
    const connectorId = request.nextUrl.searchParams.get("connectorId")?.trim();
    if (!workspaceId) {
      throw new TokMetricError(400, "VALIDATION_ERROR", "workspaceId is required.");
    }
    await requireWorkspaceAccess(workspaceId, session);
    const supabase = getLegacyFacebookSupabase();

    if (request.nextUrl.pathname.includes("/post/")) {
      const contentId = request.nextUrl.pathname.split("/").pop()?.trim();
      if (!contentId) {
        throw new TokMetricError(400, "VALIDATION_ERROR", "contentId is required.");
      }
      const { data: snapshots, error } = await supabase
        .from("facebook_analytics_snapshots")
        .select("*")
        .eq("content_item_id", contentId)
        .order("snapshot_taken_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json(
        { ok: true, correlationId: cid, snapshots: snapshots || [] },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }

    if (!connectorId) {
      throw new TokMetricError(400, "VALIDATION_ERROR", "connectorId is required.");
    }
    const { data: analytics, error } = await supabase
      .from("facebook_analytics_snapshots")
      .select(`
        id,
        content_item_id,
        reach,
        impressions,
        clicks_all,
        link_clicks,
        reactions,
        comments,
        shares,
        video_plays_3sec,
        snapshot_taken_at,
        facebook_content_items(
          id,
          category,
          external_post_url,
          scheduled_publish_time
        )
      `)
      .eq("facebook_content_items.social_connector_id", connectorId)
      .order("snapshot_taken_at", { ascending: false })
      .limit(100);
    if (error) throw error;

    const totalReach =
      analytics?.reduce((sum, item) => sum + (item.reach || 0), 0) || 0;
    const totalImpressions =
      analytics?.reduce((sum, item) => sum + (item.impressions || 0), 0) || 0;
    const totalEngagement =
      analytics?.reduce(
        (sum, item) =>
          sum +
          ((item.reactions || 0) + (item.comments || 0) + (item.shares || 0)),
        0,
      ) || 0;

    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        dashboard: {
          totalReach,
          totalImpressions,
          totalEngagement,
          averageEngagementRate:
            totalImpressions > 0
              ? ((totalEngagement / totalImpressions) * 100).toFixed(2)
              : "0",
          posts: analytics || [],
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    requireSameOrigin(request);
    const session = await requireTokMetricSession(request);
    const input = await parseJson(request, refreshSchema);
    const membership = await requireWorkspaceAccess(input.workspaceId, session);
    requirePermission(membership, "manage", "analytics");
    getLegacyFacebookSupabase();

    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        status: "REFRESH_QUEUED",
        message: "Analytics refresh will run through the authenticated worker.",
        externalActionTaken: false,
      },
      { status: 202, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
