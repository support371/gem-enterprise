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
    const actionType = request.nextUrl.searchParams.get("actionType")?.trim();
    const requestedLimit = Number.parseInt(
      request.nextUrl.searchParams.get("limit") || "100",
      10,
    );
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 250)
      : 100;
    if (!workspaceId) {
      throw new TokMetricError(400, "VALIDATION_ERROR", "workspaceId is required.");
    }
    await requireWorkspaceAccess(workspaceId, session);
    const supabase = getLegacyFacebookSupabase();

    if (request.nextUrl.pathname.includes("summary")) {
      const { data: logs, error } = await supabase
        .from("facebook_audit_logs")
        .select("action_type")
        .eq("workspace_id", workspaceId)
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        );
      if (error) throw error;
      const summary = (logs || []).reduce<Record<string, number>>(
        (accumulator, log) => {
          const action = String(log.action_type || "UNKNOWN");
          accumulator[action] = (accumulator[action] || 0) + 1;
          return accumulator;
        },
        {},
      );
      return NextResponse.json(
        { ok: true, correlationId: cid, summary, period: "7_days" },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }

    let query = supabase
      .from("facebook_audit_logs")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (actionType) query = query.eq("action_type", actionType);
    const { data: logs, error } = await query;
    if (error) throw error;
    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        logs: logs || [],
        total: logs?.length || 0,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
