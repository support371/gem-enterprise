import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGatewaySessionToken } from "@/lib/auth";
import { requireAdmin } from "@/lib/api/auth-helpers";
import { SECURE_DOCUMENT_UPLOAD_ACTIVE } from "@/lib/kyc/capabilities";
import { evaluatePilotReadiness } from "@/lib/kyc/pilot-readiness";
import {
  adminReadGateway,
  GatewayRequestError,
} from "@/lib/supabase-gateway";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const gatewayToken = await getGatewaySessionToken();
  if (gatewayToken) {
    try {
      return NextResponse.json(
        await adminReadGateway("pilot_readiness", gatewayToken),
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      if (error instanceof GatewayRequestError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode, headers: { "Cache-Control": "no-store" } },
        );
      }
      return NextResponse.json(
        { error: "Pilot readiness could not be evaluated." },
        { status: 500, headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  try {
    const accounts = await db.user.findMany({
      select: {
        id: true,
        role: true,
        status: true,
        isActive: true,
        isEmailVerified: true,
      },
    });

    const report = evaluatePilotReadiness({
      accounts,
      documentUploadActive: SECURE_DOCUMENT_UPLOAD_ACTIVE,
    });

    return NextResponse.json(
      {
        ok: true,
        evaluatedAt: new Date().toISOString(),
        viewerRole: gate.session.role,
        mutatesProductionData: false,
        ...report,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[GET /api/verify/pilot-readiness]", error);
    return NextResponse.json(
      { error: "Pilot readiness could not be evaluated." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
