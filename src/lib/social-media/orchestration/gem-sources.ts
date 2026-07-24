import { storeProducts } from "@/lib/storeCatalog";
import type { ApprovedSourceMaterial } from "../planning/daily-flow";

const canonicalStoreOrigin = "https://www.gemcybersecurityassist.com";

export function getGemApprovedSourceMaterial(input?: {
  approvedAt?: Date;
  productSlugs?: readonly string[];
}): ApprovedSourceMaterial[] {
  const allowedSlugs = input?.productSlugs?.length
    ? new Set(input.productSlugs)
    : null;
  const approvedAt = input?.approvedAt ?? new Date();

  return storeProducts
    .filter((product) => !allowedSlugs || allowedSlugs.has(product.slug))
    .map((product) => ({
      id: `gem-catalog:${product.slug}`,
      title: product.name,
      summary: [
        product.shortDescription,
        product.complianceNote,
      ]
        .filter(Boolean)
        .join(" "),
      callToAction: `${product.primaryCtaLabel}: ${canonicalStoreOrigin}/store/${product.slug}`,
      sourceReference: `${canonicalStoreOrigin}/store/${product.slug}`,
      approvedAt,
      approved: true,
      providers: [
        "TIKTOK",
        "FACEBOOK_PAGE",
        "INSTAGRAM_PROFESSIONAL",
        "X",
        "NEXTDOOR",
        "LINKEDIN_COMPANY",
        "YOUTUBE",
      ],
    }));
}
