import { NextResponse } from "next/server";
import { getGatewaySessionToken } from "@/lib/auth";
import {
  evidenceGateway,
  GatewayRequestError,
} from "@/lib/supabase-gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GatewayStatus = {
  ok: boolean;
  service: string;
  backend: string;
  bucket: {
    name: string;
    private: boolean;
  };
  settings: {
    operationallyApproved: boolean;
    operationallyApprovedByDifferentUserRequired: boolean;
    uploadActive: boolean;
    activationSeparationSatisfied: boolean;
  };
  retention: {
    activePolicies: number;
  };
  counts: {
    evidenceItems: number;
    storedObjects: number;
  };
  scanner: {
    engine: string;
    assurance: string;
    antivirusEquivalent: boolean;
    biometricAnalysis: boolean;
  };
  readyForUpload: boolean;
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET() {
  const token = await getGatewaySessionToken();
  if (!token) {
    return json(
      {
        error: "Unauthorized",
        code: "GATEWAY_SESSION_REQUIRED",
        failClosed: true,
      },
      401,
    );
  }

  try {
    const result = await evidenceGateway<GatewayStatus>("status", token);
    return json({
      ...result,
      vault: {
        name: "GEM Verify Secure Evidence Vault",
        bucket: result.bucket.name,
        private: result.bucket.private,
        readyForUpload: result.readyForUpload,
        failClosed: true,
      },
      counts: {
        ...result.counts,
        activeRetentionPolicies: result.retention.activePolicies,
        scanJobs: 0,
      },
    });
  } catch (error) {
    if (error instanceof GatewayRequestError) {
      return json(
        {
          error: error.message,
          code: error.code,
          failClosed: true,
        },
        error.statusCode,
      );
    }

    console.error("[GET /api/verify/evidence/status]", error);
    return json(
      {
        error: "Secure evidence status is unavailable.",
        code: "EVIDENCE_GATEWAY_UNAVAILABLE",
        failClosed: true,
      },
      503,
    );
  }
}
