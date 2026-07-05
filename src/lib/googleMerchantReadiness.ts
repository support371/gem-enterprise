import type { StorefrontProduct } from "@/lib/storefrontCatalog";

export const GOOGLE_MERCHANT_ACCOUNT_ID = "5615278561";
export const GOOGLE_MERCHANT_DATASOURCE_ID = "10681982230";
export const DEFAULT_GOOGLE_MERCHANT_FEED_URL =
  "https://superagent-17ea9ea1.base44.app/functions/googleMerchantFeed.xml";

export type GoogleMerchantExclusionReason =
  | "not_google_candidate"
  | "not_physical_product"
  | "duplicate_id"
  | "duplicate_sku"
  | "missing_id"
  | "missing_sku"
  | "missing_title"
  | "missing_description"
  | "invalid_price"
  | "missing_image"
  | "unsafe_image_url"
  | "missing_checkout"
  | "unsafe_checkout_url"
  | "unsupported_stock_status";

export type GoogleMerchantProductReadiness = {
  id: string;
  sku: string;
  name: string;
  eligible: boolean;
  reasons: GoogleMerchantExclusionReason[];
};

export type GoogleMerchantReadinessReport = {
  totalCatalogProducts: number;
  googleCandidateProducts: number;
  eligibleProducts: number;
  excludedProducts: number;
  readyForSubmission: boolean;
  duplicateIds: string[];
  duplicateSkus: string[];
  exclusionSummary: Record<GoogleMerchantExclusionReason, number>;
  products: GoogleMerchantProductReadiness[];
};

const ALL_REASONS: GoogleMerchantExclusionReason[] = [
  "not_google_candidate",
  "not_physical_product",
  "duplicate_id",
  "duplicate_sku",
  "missing_id",
  "missing_sku",
  "missing_title",
  "missing_description",
  "invalid_price",
  "missing_image",
  "unsafe_image_url",
  "missing_checkout",
  "unsafe_checkout_url",
  "unsupported_stock_status",
];

function normalize(value: string | undefined): string {
  return value?.trim() ?? "";
}

function duplicateValues(values: string[]): string[] {
  const counts = new Map<string, number>();

  for (const rawValue of values) {
    const value = normalize(rawValue);
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value)
    .sort((a, b) => a.localeCompare(b));
}

export function isPublicHttpsUrl(value: string | undefined): boolean {
  const rawValue = normalize(value);
  if (!rawValue) return false;

  try {
    const url = new URL(rawValue);
    const hostname = url.hostname.toLowerCase();

    if (url.protocol !== "https:") return false;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function evaluateProduct(
  product: StorefrontProduct,
  duplicateIds: Set<string>,
  duplicateSkus: Set<string>,
): GoogleMerchantProductReadiness {
  const id = normalize(product.id);
  const sku = normalize(product.sku);
  const name = normalize(product.name);
  const description = normalize(product.shortDescription);
  const image = normalize(product.image);
  const checkoutUrl = normalize(product.checkoutUrl);
  const reasons: GoogleMerchantExclusionReason[] = [];

  if (!product.storefronts.includes("google")) reasons.push("not_google_candidate");
  if (product.deliveryType !== "Physical") reasons.push("not_physical_product");
  if (!id) reasons.push("missing_id");
  if (!sku) reasons.push("missing_sku");
  if (id && duplicateIds.has(id)) reasons.push("duplicate_id");
  if (sku && duplicateSkus.has(sku)) reasons.push("duplicate_sku");
  if (!name) reasons.push("missing_title");
  if (!description) reasons.push("missing_description");
  if (!Number.isFinite(product.price) || product.price <= 0) reasons.push("invalid_price");
  if (!image) reasons.push("missing_image");
  else if (!isPublicHttpsUrl(image)) reasons.push("unsafe_image_url");
  if (!checkoutUrl) reasons.push("missing_checkout");
  else if (!isPublicHttpsUrl(checkoutUrl)) reasons.push("unsafe_checkout_url");
  if (!(["In Stock", "Available", "Request access"] as const).includes(product.stockLabel)) {
    reasons.push("unsupported_stock_status");
  }

  return {
    id,
    sku,
    name,
    eligible: reasons.length === 0,
    reasons,
  };
}

export function evaluateGoogleMerchantReadiness(
  products: StorefrontProduct[],
): GoogleMerchantReadinessReport {
  const duplicateIds = duplicateValues(products.map((product) => product.id));
  const duplicateSkus = duplicateValues(products.map((product) => product.sku));
  const duplicateIdSet = new Set(duplicateIds);
  const duplicateSkuSet = new Set(duplicateSkus);
  const evaluatedProducts = products.map((product) =>
    evaluateProduct(product, duplicateIdSet, duplicateSkuSet),
  );
  const googleCandidates = evaluatedProducts.filter(
    (product) => !product.reasons.includes("not_google_candidate"),
  );
  const eligibleProducts = googleCandidates.filter((product) => product.eligible).length;
  const exclusionSummary = Object.fromEntries(
    ALL_REASONS.map((reason) => [
      reason,
      evaluatedProducts.filter((product) => product.reasons.includes(reason)).length,
    ]),
  ) as Record<GoogleMerchantExclusionReason, number>;

  return {
    totalCatalogProducts: products.length,
    googleCandidateProducts: googleCandidates.length,
    eligibleProducts,
    excludedProducts: googleCandidates.length - eligibleProducts,
    readyForSubmission:
      eligibleProducts > 0 && duplicateIds.length === 0 && duplicateSkus.length === 0,
    duplicateIds,
    duplicateSkus,
    exclusionSummary,
    products: evaluatedProducts,
  };
}

export function resolveGoogleMerchantFeedUrl(): string {
  const configured = normalize(process.env.GOOGLE_MERCHANT_FEED_URL);
  return configured || DEFAULT_GOOGLE_MERCHANT_FEED_URL;
}
