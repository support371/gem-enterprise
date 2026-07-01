export type ChannelStatus = "Live" | "Connected" | "Pending configuration" | "Planned";

type ChannelAvailability = {
  channelSlug: string;
  status: ChannelStatus;
  actionLabel: string;
  actionUrl: string;
  note: string;
};

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
  purchaseMode: "checkout" | "quote" | "booking";
  primaryCtaLabel: string;
  channelAvailability: ChannelAvailability[];
  outcomes: string[];
  processSteps: string[];
  includes: string[];
  suitableFor: string[];
  faqs: { question: string; answer: string }[];
  complianceNote: string;
};

export type CommerceChannel = {
  slug: string;
  name: string;
  status: ChannelStatus;
  summary: string;
  purpose: string;
  ownerPage: string;
  channelPage: string;
  actions: string[];
  publicCtaLabel: string;
  canonicalUrl?: string;
  statusDetails: string;
  setupChecklist: string[];
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
    channelPage: "/store/channels/gem-security-services",
    canonicalUrl: "https://www.gemcybersecurityassist.com/store",
    publicCtaLabel: "Browse GEM services",
    statusDetails:
      "Public visitors can browse official GEM service pages, review scope details, and request service or continue to a checkout destination where available.",
    actions: [
      "Display official GEM services",
      "Route users to canonical GEM product-detail pages",
      "Keep service language aligned with compliance and onboarding requirements",
    ],
    setupChecklist: [
      "Maintain one canonical product page per service",
      "Keep product descriptions, images, and onboarding details current",
      "Route high-risk or customized engagements through contact and scoping",
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
    channelPage: "/store/channels/shopify-store",
    canonicalUrl:
      "https://my-store-8c2jeowo.myshopify.com/products/24-7-threat-monitoring-service",
    publicCtaLabel: "Open Shopify checkout",
    statusDetails:
      "The 24/7 Threat Monitoring Service has an active Shopify destination. Other services can be mapped to Shopify when checkout pricing and fulfillment rules are approved.",
    actions: [
      "Map GEM products to Shopify checkout links",
      "Preserve product titles and service descriptions",
      "Keep checkout destinations separate from editorial GEM product pages",
    ],
    setupChecklist: [
      "Confirm product title and image match the GEM canonical service page",
      "Confirm checkout price, terms, refund language, and fulfillment workflow",
      "Route completed orders into GEM onboarding and customer support",
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
    channelPage: "/store/channels/tiktok-shop",
    publicCtaLabel: "Prepare TikTok Shop mapping",
    statusDetails:
      "Public visitors can understand the TikTok Shop channel path now. Final shop links should be added after TikTok Seller Center product approval and official account linking.",
    actions: [
      "Connect TikTok Shop product URLs when available",
      "Keep TikTok profile and TikTok Shop links separate from website ownership verification",
      "Support product-card routing from TikTok campaigns to canonical GEM pages",
    ],
    setupChecklist: [
      "Link the official TikTok account to TikTok Shop Seller Center",
      "Add or synchronize approved products in TikTok Shop",
      "Copy the TikTok Shop or product URL and map it back to the canonical GEM product page",
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
    channelPage: "/store/channels/google-merchant-store",
    publicCtaLabel: "Prepare Google Merchant feed",
    statusDetails:
      "The website now exposes structured product and channel data through the catalog API. Final Google Merchant feed activation requires Merchant Center account configuration and policy review.",
    actions: [
      "Prepare product data for Google Merchant feeds",
      "Maintain canonical URLs and image URLs",
      "Keep service eligibility and checkout messaging consistent",
    ],
    setupChecklist: [
      "Confirm Google Merchant account and website claim",
      "Map each product to a canonical URL, image URL, description, and availability status",
      "Review product/service policy eligibility before enabling shopping distribution",
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
    channelPage: "/store/channels/tiktok-campaign-hub",
    publicCtaLabel: "View campaign routing",
    statusDetails:
      "Campaign traffic can be routed to the canonical GEM product pages or to checkout destinations where those URLs are approved for the campaign objective.",
    actions: [
      "Map campaign destinations to GEM product pages",
      "Track TikTok Smart+ campaign products and creative requirements",
      "Keep ads management separate from TikTok Shop catalog ownership",
    ],
    setupChecklist: [
      "Use canonical GEM product pages for landing-page quality",
      "Attach Shopify checkout links only where purchase flow is confirmed",
      "Keep TikTok Shop product URLs separate from TikTok ad-management URLs",
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
    channelPage: "/store/channels/wix-store-sync",
    publicCtaLabel: "Prepare Wix synchronization",
    statusDetails:
      "The channel is ready to receive Wix-origin product mapping. Final sync requires the correct Wix or Base44 source app access and product IDs.",
    actions: [
      "Identify products originating from Wix",
      "Prevent duplicate product creation during sync",
      "Map Wix items to canonical GEM product pages and checkout destinations",
    ],
    setupChecklist: [
      "Locate the original Wix or Wix-synced product source",
      "Match products by title, SKU, service slug, and canonical URL",
      "Prevent duplicate product records during synchronization",
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
    channelPage: "/store/channels/unified-orders-inventory",
    publicCtaLabel: "View operations model",
    statusDetails:
      "The public website can describe the order and inventory model. Real order synchronization requires connected channel credentials and approved data flows.",
    actions: [
      "Track order source by channel",
      "Show synchronization status across Shopify, TikTok, Google, and Wix",
      "Preserve one canonical GEM product record per service",
    ],
    setupChecklist: [
      "Maintain a single canonical product slug per service",
      "Record each order source as Shopify, TikTok Shop, Google, Wix, or direct GEM",
      "Route service orders into onboarding, support, and compliance review",
    ],
    agentNotes:
      "This is the coordination layer. Do not store channel-specific implementation details only here; link back to each channel section.",
  },
];

const defaultComplianceNote =
  "Service availability, access requirements, data handling, and delivery scope are confirmed during GEM onboarding. Customized enterprise work may require additional review before acceptance.";

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
    purchaseMode: "checkout",
    primaryCtaLabel: "Continue to Secure Checkout",
    commerceChannels: ["GEM Security Services", "Shopify Store", "TikTok Campaign Hub", "TikTok Shop", "Google Merchant", "Wix Store Sync"],
    integrationTargets: [
      "/store#gem-security-services",
      "/store#shopify-store",
      "/store#tiktok-campaign-hub",
      "/store#tiktok-shop",
      "/store#google-merchant-store",
      "/store#wix-store-sync",
    ],
    channelAvailability: [
      { channelSlug: "gem-security-services", status: "Live", actionLabel: "View GEM product page", actionUrl: "/store/24-7-threat-monitoring", note: "Canonical product page is live." },
      { channelSlug: "shopify-store", status: "Connected", actionLabel: "Open Shopify checkout", actionUrl: "https://my-store-8c2jeowo.myshopify.com/products/24-7-threat-monitoring-service", note: "Checkout destination is connected." },
      { channelSlug: "tiktok-campaign-hub", status: "Connected", actionLabel: "Use for campaign landing page", actionUrl: "/store/24-7-threat-monitoring", note: "Ready for TikTok ad destination mapping." },
      { channelSlug: "tiktok-shop", status: "Pending configuration", actionLabel: "Prepare TikTok Shop listing", actionUrl: "/store/channels/tiktok-shop", note: "Add Seller Center product URL after approval." },
      { channelSlug: "google-merchant-store", status: "Planned", actionLabel: "Prepare Google feed", actionUrl: "/store/channels/google-merchant-store", note: "Feed mapping is prepared through the catalog API." },
      { channelSlug: "wix-store-sync", status: "Pending configuration", actionLabel: "Prepare Wix sync", actionUrl: "/store/channels/wix-store-sync", note: "Map any Wix-origin item to this canonical service." },
    ],
    outcomes: [
      "Early detection of suspicious security activity",
      "Clear escalation path for prioritized alerts",
      "Operational reporting for leadership review",
      "A structured onboarding path for qualified business environments",
    ],
    processSteps: [
      "Review the service scope and checkout or request support",
      "Confirm organization, contact, and environment details",
      "Complete access and monitoring intake",
      "Begin monitoring, alert review, and scheduled reporting",
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
    faqs: [
      { question: "Does this replace my internal IT team?", answer: "No. It adds a structured external monitoring and escalation layer that works alongside internal IT or existing service providers." },
      { question: "Can campaign traffic land on this page?", answer: "Yes. This canonical page is designed to support TikTok campaign routing while preserving the official GEM product explanation." },
      { question: "Where is checkout handled?", answer: "The connected checkout destination is Shopify for this product. GEM onboarding follows after purchase or service confirmation." },
    ],
    complianceNote: defaultComplianceNote,
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
    purchaseMode: "quote",
    primaryCtaLabel: "Request Assessment Scope",
    commerceChannels: ["GEM Security Services", "Google Merchant", "Wix Store Sync"],
    integrationTargets: [
      "/store#gem-security-services",
      "/store#google-merchant-store",
      "/store#wix-store-sync",
    ],
    channelAvailability: [
      { channelSlug: "gem-security-services", status: "Live", actionLabel: "View GEM product page", actionUrl: "/store/security-posture-assessment", note: "Canonical service page is live." },
      { channelSlug: "google-merchant-store", status: "Planned", actionLabel: "Prepare Google feed", actionUrl: "/store/channels/google-merchant-store", note: "Product data is ready for approved Merchant mapping." },
      { channelSlug: "wix-store-sync", status: "Pending configuration", actionLabel: "Prepare Wix sync", actionUrl: "/store/channels/wix-store-sync", note: "Map Wix-origin assessment product here if present." },
    ],
    outcomes: [
      "Clear view of current security posture",
      "Prioritized list of risk-reduction actions",
      "Executive-ready documentation for decision makers",
      "A baseline for future monitoring or compliance work",
    ],
    processSteps: [
      "Submit assessment request",
      "Confirm scope, assets, systems, and access limits",
      "Complete structured review and evidence collection",
      "Receive findings, priorities, and next-step roadmap",
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
    faqs: [
      { question: "Is this a penetration test?", answer: "No. This is a structured posture assessment. If deeper testing is needed, GEM can scope that separately." },
      { question: "Can this be sold through other channels?", answer: "Yes, but the recommended flow is request-a-scope first because assessment effort depends on the environment." },
      { question: "What is delivered?", answer: "A findings summary, gap analysis, prioritized recommendations, and review session are included." },
    ],
    complianceNote: defaultComplianceNote,
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
    purchaseMode: "quote",
    primaryCtaLabel: "Request Readiness Review",
    commerceChannels: ["GEM Security Services", "Google Merchant", "Wix Store Sync"],
    integrationTargets: [
      "/store#gem-security-services",
      "/store#google-merchant-store",
      "/store#wix-store-sync",
    ],
    channelAvailability: [
      { channelSlug: "gem-security-services", status: "Live", actionLabel: "View GEM product page", actionUrl: "/store/compliance-readiness-review", note: "Canonical service page is live." },
      { channelSlug: "google-merchant-store", status: "Planned", actionLabel: "Prepare Google feed", actionUrl: "/store/channels/google-merchant-store", note: "Merchant mapping should be reviewed for service eligibility." },
      { channelSlug: "wix-store-sync", status: "Pending configuration", actionLabel: "Prepare Wix sync", actionUrl: "/store/channels/wix-store-sync", note: "Wix-origin listing can map back to this page." },
    ],
    outcomes: [
      "Documented view of readiness gaps",
      "Clear evidence and policy improvement roadmap",
      "Better preparation for due diligence or partner review",
      "Organized control and documentation priorities",
    ],
    processSteps: [
      "Submit readiness review request",
      "Provide available policies, workflows, and evidence inventory",
      "Review documentation, controls, and operating procedures",
      "Receive readiness findings and improvement roadmap",
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
    faqs: [
      { question: "Is this legal advice?", answer: "No. It is an operational readiness review. Legal or regulatory determinations should be confirmed with qualified counsel." },
      { question: "Can it be purchased instantly?", answer: "The safer flow is scoped request because readiness reviews depend on the documents, jurisdictions, and frameworks involved." },
      { question: "What happens after the review?", answer: "GEM provides a prioritized improvement roadmap and can support follow-up documentation work if requested." },
    ],
    complianceNote: defaultComplianceNote,
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
    purchaseMode: "booking",
    primaryCtaLabel: "Request Consultation",
    commerceChannels: ["GEM Security Services", "Shopify Store", "TikTok Campaign Hub"],
    integrationTargets: [
      "/store#gem-security-services",
      "/store#shopify-store",
      "/store#tiktok-campaign-hub",
    ],
    channelAvailability: [
      { channelSlug: "gem-security-services", status: "Live", actionLabel: "View GEM product page", actionUrl: "/store/cybersecurity-consultation", note: "Canonical consultation page is live." },
      { channelSlug: "shopify-store", status: "Planned", actionLabel: "Prepare checkout listing", actionUrl: "/store/channels/shopify-store", note: "Checkout listing can be added after session pricing is confirmed." },
      { channelSlug: "tiktok-campaign-hub", status: "Connected", actionLabel: "Use as campaign destination", actionUrl: "/store/cybersecurity-consultation", note: "Ready for lead-generation or consultation campaign routing." },
    ],
    outcomes: [
      "Focused clarity on a defined security concern",
      "Practical next steps for business or technical action",
      "A prioritized path for deeper services if needed",
      "Better alignment between leadership, operations, and security priorities",
    ],
    processSteps: [
      "Submit consultation request",
      "Share the topic, context, and urgency",
      "Attend the remote advisory session",
      "Receive action summary and recommended next steps",
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
    faqs: [
      { question: "Can this cover TikTok, Shopify, Google, or Wix commerce security?", answer: "Yes. The consultation can focus on commerce security, storefront setup, account protection, campaign risk, or integration planning." },
      { question: "Is this a one-time session?", answer: "It can be a one-time advisory session or the start of a broader engagement after scope confirmation." },
      { question: "What should I prepare?", answer: "Prepare the concern, links, screenshots, relevant access limitations, and the business outcome you want to achieve." },
    ],
    complianceNote: defaultComplianceNote,
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
