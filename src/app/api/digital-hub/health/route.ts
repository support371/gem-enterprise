import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  bootstrapGatewayStatus,
  shouldUseSupabaseGateway,
} from "@/lib/supabase-gateway";

export const dynamic = "force-dynamic";

export async function GET() {
  const backend = shouldUseSupabaseGateway() ? "supabase_gateway" : "prisma";
  let persistence = "ok";
  let administratorConfigured: boolean | null = null;

  try {
    if (backend === "supabase_gateway") {
      const result = await bootstrapGatewayStatus<{ configured: boolean }>();
      administratorConfigured = result.configured;
    } else {
      await db.$queryRaw`SELECT 1`;
    }
  } catch {
    persistence = "unavailable";
  }

  const healthy = persistence === "ok";
  return NextResponse.json(
    {
      ok: healthy,
      service: "gem-digital-hub",
      version: "2026.09.1",
      backend,
      persistence,
      interactionPersistence: {
        primary: backend === "supabase_gateway" ? "supabase_audit" : "prisma_audit",
        fallback: backend === "supabase_gateway" ? "vercel_analytics" : null,
        failClosedIfAllBackendsFail: true,
      },
      administratorConfigured,
      capabilities: {
        catalog: true,
        referralRouting: true,
        interactionPersistence: healthy,
        browserWalletDiscovery: true,
        walletCustody: false,
        privateKeyCollection: false,
      },
      deployment: {
        environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? null,
        region: process.env.VERCEL_REGION ?? null,
      },
      checkedAt: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
