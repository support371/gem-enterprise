import { NextResponse } from "next/server";
import { ATR_OPERATIONAL_CONFIG } from "@/lib/atrOperationalConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      product: ATR_OPERATIONAL_CONFIG.product,
      division: ATR_OPERATIONAL_CONFIG.division,
      operationalOwner: ATR_OPERATIONAL_CONFIG.operationalOwner,
      operationalStatus: ATR_OPERATIONAL_CONFIG.operationalStatus,
      ownershipMode: ATR_OPERATIONAL_CONFIG.ownershipMode,
      primaryPath: ATR_OPERATIONAL_CONFIG.primaryPath,
      publicOrigin: ATR_OPERATIONAL_CONFIG.publicOrigin,
      managedHost: ATR_OPERATIONAL_CONFIG.managedHost,
      domain: {
        name: ATR_OPERATIONAL_CONFIG.disputedDomain,
        status: ATR_OPERATIONAL_CONFIG.domainStatus,
        usePolicy: ATR_OPERATIONAL_CONFIG.domainUsePolicy,
      },
      fallback: {
        standaloneDeployment: ATR_OPERATIONAL_CONFIG.standaloneDeployment,
        policy: ATR_OPERATIONAL_CONFIG.fallbackPolicy,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
