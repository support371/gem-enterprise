import type {
  StorefrontDefinition,
  StorefrontProduct,
} from "@/lib/storefrontCatalog";

export function formatCataloguePrice(value: number): string {
  return `USD ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
}

export function publicProductDescription(product: StorefrontProduct): string {
  switch (product.category) {
    case "Monitoring Plans":
      return "Proposed monitoring-service package. Coverage, data sources, staffing, alert delivery, response targets, and activation remain subject to technical review and a signed service scope.";
    case "Financial Protection":
      return "Proposed fraud-awareness, documentation, or risk-support offering. GEM does not access bank accounts, guarantee loss prevention or recovery, or provide regulated financial advice through this catalogue.";
    case "Home Security":
      return "Proposed household security assessment, guidance, or awareness service. Device access, testing authorization, deliverables, and privacy requirements are confirmed before acceptance.";
    case "Real Estate Services":
      return "Proposed property-risk, documentation, or fraud-awareness support. Ownership, authority, records, jurisdiction, provider capability, and legal limitations are reviewed before engagement.";
    case "Cybersecurity Software":
      return "Proposed digital resource, configuration support, or software-related offering. Licensing, compatibility, vendor, support, fulfillment, and security claims must be confirmed before purchase or activation.";
    default:
      return "Catalogue item shown for enquiry and scope review. Availability and final terms must be confirmed by GEM before payment or activation.";
  }
}

export function publicAvailabilityLabel(_product: StorefrontProduct): string {
  return "Request review";
}

export function publicStorefrontStatus(storefront: StorefrontDefinition): string {
  if (storefront.status === "Pending connection") return "Connection pending";
  if (storefront.status === "Prepared") return "Catalogue prepared";
  return "Catalogue page";
}

export const catalogueRelianceNotice =
  "This is a request-only catalogue. Displayed prices are indicative and do not create an order, subscription, service activation, inventory commitment, SLA, or payment obligation. GEM confirms scope, provider availability, licensing, fulfillment, taxes, refund terms, and final price before acceptance.";
