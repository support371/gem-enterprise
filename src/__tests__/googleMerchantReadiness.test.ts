import { describe, expect, it } from "vitest";
import type { StorefrontProduct } from "@/lib/storefrontCatalog";
import {
  evaluateGoogleMerchantReadiness,
  isPublicHttpsUrl,
} from "@/lib/googleMerchantReadiness";

function makeProduct(overrides: Partial<StorefrontProduct> = {}): StorefrontProduct {
  return {
    id: "physical-product-1",
    sku: "PHYS-001",
    name: "Physical Security Starter Kit",
    shortDescription: "A boxed physical security starter kit shipped to the customer.",
    category: "Home Security",
    price: 49.99,
    deliveryType: "Physical",
    stockLabel: "In Stock",
    storefronts: ["main", "google"],
    accent: "cyan",
    image: "https://example.com/product.jpg",
    checkoutUrl: "https://example.com/checkout/physical-product-1",
    ...overrides,
  };
}

describe("Google Merchant phase 3 readiness", () => {
  it("accepts a complete physical Google storefront product", () => {
    const report = evaluateGoogleMerchantReadiness([makeProduct()]);

    expect(report.googleCandidateProducts).toBe(1);
    expect(report.eligibleProducts).toBe(1);
    expect(report.excludedProducts).toBe(0);
    expect(report.readyForSubmission).toBe(true);
  });

  it("excludes services and digital products", () => {
    const report = evaluateGoogleMerchantReadiness([
      makeProduct({ id: "service-1", sku: "SRV-001", deliveryType: "Service" }),
      makeProduct({ id: "digital-1", sku: "DIG-001", deliveryType: "Digital" }),
    ]);

    expect(report.eligibleProducts).toBe(0);
    expect(report.exclusionSummary.not_physical_product).toBe(2);
  });

  it("detects duplicate IDs and SKUs without silently overwriting products", () => {
    const report = evaluateGoogleMerchantReadiness([
      makeProduct(),
      makeProduct({ name: "Second product" }),
    ]);

    expect(report.duplicateIds).toEqual(["physical-product-1"]);
    expect(report.duplicateSkus).toEqual(["PHYS-001"]);
    expect(report.exclusionSummary.duplicate_id).toBe(2);
    expect(report.exclusionSummary.duplicate_sku).toBe(2);
    expect(report.eligibleProducts).toBe(0);
  });

  it("requires an image and direct checkout URL", () => {
    const report = evaluateGoogleMerchantReadiness([
      makeProduct({ image: undefined, checkoutUrl: undefined }),
    ]);

    expect(report.exclusionSummary.missing_image).toBe(1);
    expect(report.exclusionSummary.missing_checkout).toBe(1);
    expect(report.eligibleProducts).toBe(0);
  });

  it("rejects invalid prices", () => {
    const report = evaluateGoogleMerchantReadiness([
      makeProduct({ price: 0 }),
      makeProduct({ id: "negative", sku: "NEG-001", price: -1 }),
      makeProduct({ id: "nan", sku: "NAN-001", price: Number.NaN }),
    ]);

    expect(report.exclusionSummary.invalid_price).toBe(3);
    expect(report.eligibleProducts).toBe(0);
  });

  it("separates non-Google products from Google candidates", () => {
    const report = evaluateGoogleMerchantReadiness([
      makeProduct({ storefronts: ["main"] }),
    ]);

    expect(report.totalCatalogProducts).toBe(1);
    expect(report.googleCandidateProducts).toBe(0);
    expect(report.excludedProducts).toBe(0);
    expect(report.exclusionSummary.not_google_candidate).toBe(1);
  });

  it("accepts only public HTTPS URLs", () => {
    expect(isPublicHttpsUrl("https://example.com/product.jpg")).toBe(true);
    expect(isPublicHttpsUrl("http://example.com/product.jpg")).toBe(false);
    expect(isPublicHttpsUrl("https://localhost/product.jpg")).toBe(false);
    expect(isPublicHttpsUrl("https://service.internal/product.jpg")).toBe(false);
    expect(isPublicHttpsUrl("javascript:alert(1)")).toBe(false);
    expect(isPublicHttpsUrl(undefined)).toBe(false);
  });
});
