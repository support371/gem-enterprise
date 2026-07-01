export type StoreProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: "Monitoring" | "Assessments" | "Compliance" | "Consultations";
  delivery: string;
  onboarding: string;
  priceLabel: string;
  checkoutUrl?: string;
  image: string;
  featured?: boolean;
  commerceChannels: string[];
  integrationTargets: string[];
  includes: string[];
  suitableFor: string[];
};

export type CommerceChannel = {
  slug: string;
  name: string;
  status: "Live" | "Connected" | "Pending configuration" | "Planned";
  summary: string;
  purpose: string;
  ownerPage: string;
  actions: string[];
  canonicalUrl?: string;
  agentNotes: string;
};

export const commerceChannels: CommerceChannel[] = [
  {
    slug: "gem-security-services",
    name: "GEM Security Services",
    status: "Live",
    summary:
      "The main GEM-owned service catalog for cybersecurity, compliance, monitoring, and advisory offerings.",
    purpose:
      "Use this section for services sold directly through GEM Enterprise and routed through the official GEM product pages.",
    ownerPage: "/store#gem-security-services",
    canonicalUrl: "https://www.gemcybersecurityassist.com/store",
    actions: [
      "Display official GEM services",
      "Route users to canonical GEM product-detail pages",
      "Keep service language aligned with compliance and onboarding requirements",
    ],
    agentNotes:
      "This is the authoritative parent catalog. Other commerce channels should reference or synchronize against it rather than replacing it.",
  },
  {
    slug: "shopify-store",
    name: "Shopify Store",
    status: "Connected",
    summary:
      "Shopify supports checkout, product records, and paid-campaign destinations for selected GEM products.",
    purpose:
      "Use this section for Shopify product pages, checkout URLs, order capture, and payment-enabled product destinations.",
    ownerPage: "/store#shopify-store",
    canonicalUrl:
      "https://my-store-8c2jeowo.myshopify.com/products/24-7-threat-monitoring-service",
    actions: [
      "Map GEM products to Shopify checkout links",
      "Preserve product titles and service descriptions",
      "Keep checkout destinations separate from editorial GEM product pages",
    ],
    agentNotes:
      "Do not treat Shopify as the only store. It is one checkout and product-management channel inside the unified commerce hub.",
  },
  {
    slug: "tiktok-shop",
    name: "TikTok Shop",
    status: "Pending configuration",
    summary:
      "TikTok Shop is reserved for social-commerce product showcase, store-page visibility, and product synchronization.",
    purpose:
      "Use this section for TikTok Shop catalogs, product links, showcase routing, and store/profile commerce references.",
    ownerPage: "/store#tiktok-shop",
    actions: [
      "Connect TikTok Shop product URLs when available",
      "Keep TikTok profile and TikTok Shop links separate from website ownership verification",
      "Support product-card routing from TikTok campaigns to canonical GEM pages",
    ],
    agentNotes:
      "TikTok Shop URLs are TikTok-owned destinations. Do not use them as verified website properties; link them from GEM-owned pages.",
  },
  {
    slug: "google-merchant-store",
    name: "Google Store / Google Merchant",
    status: "Planned",
    summary:
      "Google Merchant support is reserved for product feeds, shopping visibility, and discoverability across Google surfaces.",
    purpose:
      "Use this section for Google Merchant Center catalog fields, product feeds, shopping attributes, and destination checks.",
    ownerPage: "/store#google-merchant-store",
    actions: [
      "Prepare product data for Google Merchant feeds",
      "Maintain canonical URLs and image URLs",
      "Keep service eligibility and checkout messaging consistent",
    ],
    agentNotes:
      "Base44 and future agents should map product feed fields here, not inside the TikTok or Shopify sections.",
  },
  {
    slug: "tiktok-campaign-hub",
    name: "TikTok Campaign Hub",
    status: "Connected",
    summary:
      "The campaign hub organizes TikTok Smart+, campaign destinations, creative assets, and ads reporting references.",
    purpose:
      "Use this section for ad campaigns, creative text, video assets, campaign destinations, pixels, and reporting workflows.",
    ownerPage: "/store#tiktok-campaign-hub",
    actions: [
      "Map campaign destinations to GEM product pages",
      "Track TikTok Smart+ campaign products and creative requirements",
      "Keep ads management separate from TikTok Shop catalog ownership",
    ],
    agentNotes:
      "This is for campaign management and ad routing. It is not the same as TikTok Shop product synchronization.",
  },
  {
    slug: "wix-store-sync",
    name: "Wix Store Sync",
    status: "Pending configuration",
    summary:
      "Wix Store synchronization is reserved for catalog migration, product sync, and external storefront alignment.",
    purpose:
      "Use this section for Wix catalog references, synchronization status, duplicated product checks, and source mapping.",
    ownerPage: "/store#wix-store-sync",
    actions: [
      "Identify products originating from Wix",
      "Prevent duplicate product creation during sync",
      "Map Wix items to canonical GEM product pages and checkout destinations",
    ],
    agentNotes:
      "This section exists so future agents can connect Wix without confusing it with Shopify, TikTok Shop, or Google Merchant.",
  },
  {
    slug: "unified-orders-inventory",
    name: "Unified Orders & Inventory",
    status: "Planned",
    summary:
      "The operational layer for cross-channel orders, shared product status, inventory references, and synchronization health.",
    purpose:
      "Use this section for order routing, inventory sync status, customer handoff, duplicate prevention, and channel health.",
    ownerPage: "/store#unified-orders-inventory",
    actions: [
      "Track order source by channel",
      "Show synchronization status across Shopify, TikTok, Google, and Wix",
      "Preserve one canonical GEM product record per service",
    ],
    agentNotes:
      "This is the coordination layer. Do not store channel-specific implementation details only here; link back to each channel section.",
  },
];

export const storeProducts: StoreProduct[] = [
  {
    slug: "24-7-threat-monitoring",
    name: "24/7 Threat Monitoring Service",
    shortDescription:
      "Continuous security monitoring, prioritized alerts, and structured incident escalation support.",
    description:
      "GEM provides an always-on monitoring service designed to help qualified organizations identify suspicious activity, understand emerging risks, and coordinate a structured response when attention is required.",
    category: "Monitoring",
    delivery: "Ongoing managed service",
    onboarding: "1–3 business days after scope confirmation",
    priceLabel: "Available through Shopify and campaign-ready commerce channels",
    checkoutUrl:
      "https://my-store-8c2jeowo.myshopify.com/products/24-7-threat-monitoring-service",
    image:
      "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/5c6e6baaf_generated_image.png",
    featured: true,
    commerceChannels: ["GEM Security Services", "Shopify Store", "TikTok Campaign Hub", "TikTok Shop", "Google Merchant", "Wix Store Sync"],
    integrationTargets: [
      "/store#gem-security-services",
      "/store#shopify-store",
      "/store#tiktok-campaign-hub",
      "/store#tiktok-shop",
      "/store#google-merchant-store",
      "/store#wix-store-sync",
    ],
    includes: [
      "Continuous security-event review",
      "Prioritized threat notifications",
      "Incident escalation guidance",
      "Scheduled security activity summaries",
      "Structured service onboarding",
    ],
    suitableFor: [
      "Small and mid-sized organizations",
      "Professional service firms",
      "Property and financial operations",
      "Teams without a dedicated 24/7 security desk",
    ],
  },
  {
    slug: "security-posture-assessment",
    name: "Security Posture Assessment",
    shortDescription:
      "A structured review of security controls, vulnerabilities, operational exposure, and priority improvements.",
    description:
      "This assessment reviews the organization’s current security posture and produces a practical, prioritized roadmap for reducing risk and strengthening operational resilience.",
    category: "Assessments",
    delivery: "Project-based assessment",
    onboarding: "2–5 business days",
    priceLabel: "Request a scoped quote or map into an approved sales channel",
    image:
      "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/b42c69a20_generated_image.png",
    commerceChannels: ["GEM Security Services", "Google Merchant", "Wix Store Sync"],
    integrationTargets: [
      "/store#gem-security-services",
      "/store#google-merchant-store",
      "/store#wix-store-sync",
    ],
    includes: [
      "Current-state security review",
      "Control and exposure gap identification",
      "Prioritized remediation recommendations",
      "Executive-ready assessment summary",
      "Review session with GEM support",
    ],
    suitableFor: [
      "Organizations preparing for growth",
      "Businesses reviewing third-party risk",
      "Teams modernizing security controls",
      "Operators seeking a documented baseline",
    ],
  },
  {
    slug: "compliance-readiness-review",
    name: "Compliance Readiness Review",
    shortDescription:
      "A focused review of policies, evidence, controls, and documentation needed for stronger compliance readiness.",
    description:
      "GEM reviews the organization’s available policies, control evidence, and operating procedures to identify readiness gaps and create a clear preparation roadmap.",
    category: "Compliance",
    delivery: "Project-based review",
    onboarding: "2–5 business days",
    priceLabel: "Request a scoped quote or prepare channel listing",
    image:
      "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/9b9d1f784_generated_image.png",
    commerceChannels: ["GEM Security Services", "Google Merchant", "Wix Store Sync"],
    integrationTargets: [
      "/store#gem-security-services",
      "/store#google-merchant-store",
      "/store#wix-store-sync",
    ],
    includes: [
      "Policy and documentation review",
      "Control-evidence gap analysis",
      "Readiness findings and priorities",
      "Documentation improvement guidance",
      "Structured readiness roadmap",
    ],
    suitableFor: [
      "Organizations preparing for due diligence",
      "Teams strengthening governance practices",
      "Businesses organizing audit evidence",
      "Operators formalizing compliance workflows",
    ],
  },
  {
    slug: "cybersecurity-consultation",
    name: "Cybersecurity Consultation",
    shortDescription:
      "A focused advisory session for security risks, architecture decisions, incident planning, or business protection.",
    description:
      "Book a structured consultation with GEM to review a defined security challenge, clarify priorities, and leave with practical next steps tailored to the organization’s operating environment.",
    category: "Consultations",
    delivery: "Remote advisory session",
    onboarding: "Scheduled after intake review",
    priceLabel: "Book an advisory session or route through approved storefronts",
    image:
      "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/1756905aa_generated_image.png",
    commerceChannels: ["GEM Security Services", "Shopify Store", "TikTok Campaign Hub"],
    integrationTargets: [
      "/store#gem-security-services",
      "/store#shopify-store",
      "/store#tiktok-campaign-hub",
    ],
    includes: [
      "Pre-session intake review",
      "Focused security advisory session",
      "Priority action summary",
      "Recommended next steps",
      "Optional follow-up service plan",
    ],
    suitableFor: [
      "Business owners and operators",
      "Technical and compliance leaders",
      "Organizations evaluating security services",
      "Teams responding to a defined risk concern",
    ],
  },
];

export const storeCategories = [
  "All Solutions",
  "Monitoring",
  "Assessments",
  "Compliance",
  "Consultations",
  "Shopify",
  "TikTok Shop",
  "Google Merchant",
  "Wix Sync",
  "Campaign Hub",
] as const;

export function getStoreProduct(slug: string) {
  return storeProducts.find((product) => product.slug === slug);
}

export function getCommerceChannel(slug: string) {
  return commerceChannels.find((channel) => channel.slug === slug);
}
