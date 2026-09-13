import { foundingBusinessReviewOffer } from "@/lib/market/launchOffer";
import { buildBusinessReviewCampaignUrl } from "@/lib/market/gtmActivation";
import { storeProducts } from "@/lib/storeCatalog";
import type { ApprovedSourceMaterial } from "../planning/daily-flow";

const canonicalStoreOrigin = "https://www.gemcybersecurityassist.com";
const socialProviders = [
  "TIKTOK",
  "FACEBOOK_PAGE",
  "INSTAGRAM_PROFESSIONAL",
  "X",
  "NEXTDOOR",
  "LINKEDIN_COMPANY",
  "YOUTUBE",
] as const;

export function getGemApprovedSourceMaterial(input?: {
  approvedAt?: Date;
  productSlugs?: readonly string[];
}): ApprovedSourceMaterial[] {
  const allowedSlugs = input?.productSlugs?.length
    ? new Set(input.productSlugs)
    : null;
  const approvedAt = input?.approvedAt ?? new Date();

  const productSources: ApprovedSourceMaterial[] = storeProducts
    .filter((product) => !allowedSlugs || allowedSlugs.has(product.slug))
    .map((product) => ({
      id: `gem-catalog:${product.slug}`,
      title: product.name,
      summary: [product.shortDescription, product.complianceNote]
        .filter(Boolean)
        .join(" "),
      callToAction: `${product.primaryCtaLabel}: ${canonicalStoreOrigin}/store/${product.slug}`,
      sourceReference: `${canonicalStoreOrigin}/store/${product.slug}`,
      approvedAt,
      approved: true,
      providers: socialProviders,
    }));

  // When the orchestrator is using the full GEM catalog, include the governed founding offer as
  // a first-class marketing source. Explicit productSlug runs remain product-only so operators
  // can still request tightly scoped catalog campaigns.
  if (allowedSlugs) return productSources;

  const reviewPath = buildBusinessReviewCampaignUrl({
    source: "social",
    medium: "organic-social",
    leadSource: "social",
  });
  const businessReviewSource: ApprovedSourceMaterial = {
    id: `gem-market:${foundingBusinessReviewOffer.code}`,
    title: foundingBusinessReviewOffer.name,
    summary: `${foundingBusinessReviewOffer.promise} ${foundingBusinessReviewOffer.priceLabel}.`,
    callToAction: `Request the Business Review: ${canonicalStoreOrigin}${reviewPath}`,
    sourceReference: `${canonicalStoreOrigin}/business-review`,
    approvedAt,
    approved: true,
    providers: socialProviders,
  };

  return [businessReviewSource, ...productSources];
}
