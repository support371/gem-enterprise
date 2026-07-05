import { NextResponse } from "next/server";
import { storefrontProducts } from "@/lib/storefrontCatalog";
import {
  evaluateGoogleMerchantReadiness,
  GOOGLE_MERCHANT_ACCOUNT_ID,
  GOOGLE_MERCHANT_DATASOURCE_ID,
  resolveGoogleMerchantFeedUrl,
} from "@/lib/googleMerchantReadiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = evaluateGoogleMerchantReadiness(storefrontProducts);

  return NextResponse.json(
    {
      ok: true,
      phase: 3,
      phaseName: "Google Merchant operational readiness",
      generatedAt: new Date().toISOString(),
      integrationMode: "hosted_xml_feed",
      merchantCenterAccountId:
        process.env.GOOGLE_MERCHANT_ACCOUNT_ID || GOOGLE_MERCHANT_ACCOUNT_ID,
      configuredApiDataSourceId:
        process.env.GOOGLE_MERCHANT_DATASOURCE_ID || GOOGLE_MERCHANT_DATASOURCE_ID,
      feedUrl: resolveGoogleMerchantFeedUrl(),
      phase2Dependency: {
        required: true,
        description:
          "The hosted XML feed endpoint must be deployed by phase 2 before Merchant Center can fetch products.",
      },
      ...report,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
