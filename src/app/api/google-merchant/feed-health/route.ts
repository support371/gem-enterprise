import { NextResponse } from "next/server";
import { probeGoogleMerchantFeed } from "@/lib/googleMerchantFeedHealth";
import { resolveGoogleMerchantFeedUrl } from "@/lib/googleMerchantReadiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await probeGoogleMerchantFeed(resolveGoogleMerchantFeedUrl());

  return NextResponse.json(
    {
      phase: 4,
      phaseName: "Hosted feed activation and health verification",
      integrationMode: "hosted_xml_feed",
      ...health,
    },
    {
      status: health.ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
