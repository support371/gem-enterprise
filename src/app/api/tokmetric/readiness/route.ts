import { NextRequest, NextResponse } from "next/server";
import { correlationId, emitTokMetricAudit, requireTokMetricSession, tokMetricErrorResponse } from "@/lib/tokmetric/security";
import { getTokMetricReadiness } from "@/lib/tokmetric/readiness";

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const readiness = await getTokMetricReadiness();
    await emitTokMetricAudit({ actorId: session.userId, action: "tokmetric.readiness.read", entityType: "system", correlationId: cid, outcome: "success", sourceChannel: "website" });
    return NextResponse.json({ ok: true, correlationId: cid, readiness });
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
