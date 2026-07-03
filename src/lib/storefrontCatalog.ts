export type StorefrontSlug =
  | "main"
  | "campaign-hub"
  | "tiktok"
  | "shopify"
  | "google"
  | "wix";

export type StorefrontProduct = {
  id: string;
  sku: string;
  name: string;
  shortDescription: string;
  category: string;
  price: number;
  originalPrice?: number;
  deliveryType: "Physical" | "Digital" | "Service";
  stockLabel: "In Stock" | "Available" | "Request access";
  storefronts: StorefrontSlug[];
  accent: "cyan" | "green" | "purple" | "orange" | "pink";
  checkoutUrl?: string;
};

export type StorefrontDefinition = {
  slug: StorefrontSlug;
  name: string;
  shortName: string;
  eyebrow: string;
  title: string;
  description: string;
  status: "Live" | "Connected" | "Prepared" | "Pending connection";
  externalUrl?: string;
  externalLabel?: string;
  categories: string[];
};

export const storefrontDefinitions: StorefrontDefinition[] = [
  {
    slug: "main",
    name: "GEM Main Store",
    shortName: "Main Store",
    eyebrow: "Primary product catalog",
    title: "The complete GEM Enterprise product store",
    description:
      "Browse the main catalog of security products, client gifts, property-care tools, office essentials, digital resources, and enterprise software.",
    status: "Live",
    categories: [
      "All",
      "Cybersecurity",
      "Client Gifts",
      "Property Care",
      "Home Safety",
      "Office Essentials",
      "Digital Software",
    ],
  },
  {
    slug: "campaign-hub",
    name: "TikTok Campaign Hub",
    shortName: "Campaign Hub",
    eyebrow: "Campaign products and tools",
    title: "Campaign-ready products, services, and digital offers",
    description:
      "A dedicated page for campaign destinations, promoted products, creative offers, awareness tools, and lead-generation services.",
    status: "Connected",
    categories: ["All", "Campaign Services", "Security Awareness", "Digital Software", "Lead Generation"],
  },
  {
    slug: "tiktok",
    name: "TikTok Shop",
    shortName: "TikTok Shop",
    eyebrow: "Social-commerce catalog",
    title: "Products prepared for the GEM TikTok Shop",
    description:
      "Showcase consumer-friendly and campaign-ready products inside the GEM website before opening the approved external TikTok Shop destination.",
    status: "Pending connection",
    categories: ["All", "Client Gifts", "Home Safety", "Office Essentials", "Lifestyle"],
  },
  {
    slug: "shopify",
    name: "Shopify Store",
    shortName: "Shopify",
    eyebrow: "Connected checkout",
    title: "GEM products available through Shopify",
    description:
      "Review the GEM product information first, then continue to the approved Shopify checkout where a live destination exists.",
    status: "Connected",
    externalUrl: "https://my-store-8c2jeowo.myshopify.com/products/24-7-threat-monitoring-service",
    externalLabel: "Open Shopify checkout",
    categories: ["All", "Monitoring", "Consultations", "Security Services"],
  },
  {
    slug: "google",
    name: "Google Merchant Store",
    shortName: "Google Store",
    eyebrow: "Merchant feed catalog",
    title: "Google-ready product listings and destinations",
    description:
      "A dedicated catalog view for products prepared for Google Merchant Center, product feeds, and shopping visibility.",
    status: "Prepared",
    categories: ["All", "Physical Products", "Digital Software", "Security Services"],
  },
  {
    slug: "wix",
    name: "Wix Store Sync",
    shortName: "Wix Store",
    eyebrow: "Synchronized catalog",
    title: "Wix-origin products mapped into GEM Enterprise",
    description:
      "A controlled synchronization page for Wix-origin products, duplicate prevention, and canonical GEM product routing.",
    status: "Pending connection",
    categories: ["All", "Imported Products", "Client Gifts", "Office Essentials", "Home Safety"],
  },
];

export const storefrontProducts: StorefrontProduct[] = [
  {
    id: "lease-review",
    sku: "GEM-AT-001",
    name: "Alliance Trust — Lease Agreement Review",
    shortDescription: "Structured review support for lease documents and property-related agreement preparation.",
    category: "Cybersecurity",
    price: 45,
    originalPrice: 52.99,
    deliveryType: "Service",
    stockLabel: "Available",
    storefronts: ["main", "google"],
    accent: "cyan",
  },
  {
    id: "phishing-awareness-report",
    sku: "GEM-GT-002",
    name: "GEM Phishing Test & Awareness Report",
    shortDescription: "A practical security-awareness report for identifying and reducing phishing risk.",
    category: "Security Awareness",
    price: 15,
    originalPrice: 17.65,
    deliveryType: "Digital",
    stockLabel: "Available",
    storefronts: ["main", "campaign-hub", "google"],
    accent: "cyan",
  },
  {
    id: "commercial-property-review",
    sku: "GEM-AT-003",
    name: "Alliance Trust — Commercial Property Review",
    shortDescription: "A structured commercial-property review and preparation service for qualified requests.",
    category: "Cybersecurity",
    price: 130,
    originalPrice: 152.99,
    deliveryType: "Service",
    stockLabel: "Available",
    storefronts: ["main", "google"],
    accent: "cyan",
  },
  {
    id: "threat-alert-sms",
    sku: "GEM-GS-004",
    name: "GEM Basic Threat Alert SMS",
    shortDescription: "Basic SMS security-alert support for defined business and personal monitoring needs.",
    category: "Security Awareness",
    price: 10,
    originalPrice: 11.75,
    deliveryType: "Digital",
    stockLabel: "Available",
    storefronts: ["main", "campaign-hub", "google"],
    accent: "cyan",
  },
  {
    id: "cyber-insurance-readiness",
    sku: "GEM-MC-005",
    name: "Home Cyber Insurance Readiness Report",
    shortDescription: "A documented readiness review to help households understand common cyber-insurance preparation gaps.",
    category: "Cybersecurity",
    price: 49,
    originalPrice: 57.65,
    deliveryType: "Digital",
    stockLabel: "Available",
    storefronts: ["main", "campaign-hub", "google"],
    accent: "cyan",
  },
  {
    id: "financial-identity-shield",
    sku: "GEM-FI-006",
    name: "Financial Identity Shield",
    shortDescription: "An educational identity-protection toolkit focused on safer account and personal-data practices.",
    category: "Cybersecurity",
    price: 39.99,
    originalPrice: 47.05,
    deliveryType: "Digital",
    stockLabel: "Available",
    storefronts: ["main", "campaign-hub", "google"],
    accent: "cyan",
  },
  {
    id: "branded-mouse-pad",
    sku: "GEM-PB-007",
    name: "Practical Branded Mouse Pad",
    shortDescription: "A practical branded desk accessory for home offices, client kits, and campaign packages.",
    category: "Office Essentials",
    price: 13.99,
    originalPrice: 16.45,
    deliveryType: "Physical",
    stockLabel: "In Stock",
    storefronts: ["main", "tiktok", "wix", "google"],
    accent: "purple",
  },
  {
    id: "branded-notebook",
    sku: "GEM-BB-008",
    name: "Durable Branded Notebook",
    shortDescription: "A durable branded notebook for home, office, client welcome kits, and promotional bundles.",
    category: "Office Essentials",
    price: 14.99,
    originalPrice: 17.65,
    deliveryType: "Physical",
    stockLabel: "In Stock",
    storefronts: ["main", "tiktok", "wix", "google"],
    accent: "purple",
  },
  {
    id: "scented-candle-set",
    sku: "GEM-PS-009",
    name: "Premium Scented Candle Gift Set",
    shortDescription: "A premium client-gift set designed for closing packages, welcome bundles, and appreciation campaigns.",
    category: "Client Gifts",
    price: 39.99,
    originalPrice: 47.05,
    deliveryType: "Physical",
    stockLabel: "In Stock",
    storefronts: ["main", "tiktok", "wix", "google"],
    accent: "pink",
  },
  {
    id: "reusable-gift-tote",
    sku: "GEM-SR-010",
    name: "Structured Reusable Gift Tote Bag",
    shortDescription: "A reusable branded tote for client kits, event giveaways, and campaign product bundles.",
    category: "Client Gifts",
    price: 14.99,
    originalPrice: 17.65,
    deliveryType: "Physical",
    stockLabel: "In Stock",
    storefronts: ["main", "tiktok", "wix", "google"],
    accent: "pink",
  },
  {
    id: "open-house-banner",
    sku: "GEM-PO-011",
    name: "Premium Open House Welcome Banner",
    shortDescription: "A professional welcome banner for property events, showings, and branded client experiences.",
    category: "Property Care",
    price: 24.99,
    originalPrice: 29.40,
    deliveryType: "Physical",
    stockLabel: "In Stock",
    storefronts: ["main", "wix", "google"],
    accent: "cyan",
  },
  {
    id: "fire-extinguisher",
    sku: "GEM-CF-012",
    name: "Compact Fire Extinguisher",
    shortDescription: "A compact home-safety product for property kits and emergency-readiness bundles.",
    category: "Home Safety",
    price: 39.99,
    originalPrice: 47.05,
    deliveryType: "Physical",
    stockLabel: "In Stock",
    storefronts: ["main", "tiktok", "wix", "google"],
    accent: "cyan",
  },
  {
    id: "first-aid-kit",
    sku: "GEM-DF-013",
    name: "Durable First Aid Kit for Home and Office",
    shortDescription: "A practical first-aid kit for office, property, and home emergency-readiness packages.",
    category: "Home Safety",
    price: 28.99,
    originalPrice: 34.10,
    deliveryType: "Physical",
    stockLabel: "In Stock",
    storefronts: ["main", "tiktok", "wix", "google"],
    accent: "green",
  },
  {
    id: "open-house-sign-in-book",
    sku: "GEM-PO-014",
    name: "Professional Open House Sign-In Book",
    shortDescription: "A professional visitor sign-in book for real-estate events and client follow-up workflows.",
    category: "Property Care",
    price: 16.99,
    originalPrice: 19.99,
    deliveryType: "Physical",
    stockLabel: "In Stock",
    storefronts: ["main", "wix", "google"],
    accent: "green",
  },
  {
    id: "throw-pillow-cover",
    sku: "GEM-NP-015",
    name: "Professional Natural Throw Pillow Cover",
    shortDescription: "A neutral decorative pillow cover suitable for staging, welcome kits, and lifestyle campaigns.",
    category: "Client Gifts",
    price: 19.99,
    originalPrice: 23.50,
    deliveryType: "Physical",
    stockLabel: "In Stock",
    storefronts: ["main", "tiktok", "wix", "google"],
    accent: "purple",
  },
  {
    id: "scent-diffuser",
    sku: "GEM-SD-016",
    name: "Practical Scent Diffuser Set",
    shortDescription: "A home-fragrance set for staging, client appreciation, and social-commerce product bundles.",
    category: "Client Gifts",
    price: 26.99,
    originalPrice: 31.75,
    deliveryType: "Physical",
    stockLabel: "In Stock",
    storefronts: ["main", "tiktok", "wix", "google"],
    accent: "purple",
  },
  {
    id: "moving-label-stickers",
    sku: "GEM-PR-017",
    name: "Professional Room Label Moving Stickers",
    shortDescription: "Room-label stickers for move organization, property handoff, and client relocation kits.",
    category: "Property Care",
    price: 10.99,
    originalPrice: 12.95,
    deliveryType: "Physical",
    stockLabel: "In Stock",
    storefronts: ["main", "tiktok", "wix", "google"],
    accent: "orange",
  },
  {
    id: "compliance-vault",
    sku: "GEM-CV-018",
    name: "Compliance Vault",
    shortDescription: "A structured digital workspace concept for organizing compliance documents, evidence, and review priorities.",
    category: "Digital Software",
    price: 499,
    deliveryType: "Digital",
    stockLabel: "Request access",
    storefronts: ["main", "campaign-hub", "google"],
    accent: "orange",
  },
  {
    id: "phishing-defense-toolkit",
    sku: "GEM-PD-019",
    name: "Phishing Defense Toolkit",
    shortDescription: "A digital security-awareness toolkit for phishing prevention, staff education, and response preparation.",
    category: "Digital Software",
    price: 199,
    deliveryType: "Digital",
    stockLabel: "Request access",
    storefronts: ["main", "campaign-hub", "google"],
    accent: "green",
  },
  {
    id: "threat-visibility-console",
    sku: "GEM-TV-020",
    name: "Threat Visibility Console",
    shortDescription: "A digital security visibility and reporting concept for qualified organizational environments.",
    category: "Digital Software",
    price: 399,
    deliveryType: "Digital",
    stockLabel: "Request access",
    storefronts: ["main", "campaign-hub", "google"],
    accent: "purple",
  },
];

export function getStorefrontDefinition(slug: StorefrontSlug) {
  return storefrontDefinitions.find((storefront) => storefront.slug === slug);
}

export function getProductsForStorefront(slug: StorefrontSlug) {
  return storefrontProducts.filter((product) => product.storefronts.includes(slug));
}
