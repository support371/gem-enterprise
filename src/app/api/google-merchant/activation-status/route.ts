import { NextResponse } from "next/server";
import { storefrontProducts } from "@/lib/storefrontCatalog";
import { probeGoogleMerchantFeed } from "@/lib/googleMerchantFeedHealth";
import {
  evaluateGoogleMerchantReadiness,
  GOOGLE_MERCHANT_ACCOUNT_ID,
  GOOGLE_MERCHANT_DATASOURCE_ID,
  resolveGoogleMerchantFeedUrl,
} from "@/lib/googleMerchantReadiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const feedUrl = resolveGoogleMerchantFeedUrl();
  const [feedHealth, catalogueReadiness] = await Promise.all([
    probeGoogleMerchantFeed(feedUrl),
    Promise.resolve(evaluateGoogleMerchantReadiness(storefrontProducts)),
  ]);
  const activationReady = feedHealth.ok && catalogueReadiness.readyForSubmission;

  return NextResponse.json(
    {
      ok: activationReady,
      phase: 4,
      phaseName: "Hosted feed activation and health verification",
      checkedAt: new Date().toISOString(),
      integrationMode: "hosted_xml_feed",
      merchantCenterAccountId:
        process.env.GOOGLE_MERCHANT_ACCOUNT_ID || GOOGLE_MERCHANT_ACCOUNT_ID,
      configuredApiDataSourceId:
        process.env.GOOGLE_MERCHANT_DATASOURCE_ID || GOOGLE_MERCHANT_DATASOURCE_ID,
      feedUrl,
      activationReady,
      blockers: [
        ...(!feedHealth.ok ? ["hosted_feed_unhealthy"] : []),
        ...(!catalogueReadiness.readyForSubmission ? ["catalogue_not_submission_ready"] : []),
      ],
      feedHealth,
      catalogueReadiness: {
        totalCatalogProducts: catalogueReadiness.totalCatalogProducts,
        googleCandidateProducts: catalogueReadiness.googleCandidateProducts,
        eligibleProducts: catalogueReadiness.eligibleProducts,
        excludedProducts: catalogueReadiness.excludedProducts,
        readyForSubmission: catalogueReadiness.readyForSubmission,
        duplicateIds: catalogueReadiness.duplicateIds,
        duplicateSkus: catalogueReadiness.duplicateSkus,
        exclusionSummary: catalogueReadiness.exclusionSummary,
      },
      merchantCenterHandoff: {
        manualStepRequired: true,
        instruction:
          "Add the deployed XML feed URL as a file/URL product source in Google Merchant Center only after activationReady is true.",
      },
    },
    {
      status: activationReady ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
