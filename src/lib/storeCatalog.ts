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
  includes: string[];
  suitableFor: string[];
};

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
    priceLabel: "Available through the GEM-ATR Shopify store",
    checkoutUrl:
      "https://my-store-8c2jeowo.myshopify.com/products/24-7-threat-monitoring-service",
    image:
      "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/5c6e6baaf_generated_image.png",
    featured: true,
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
    priceLabel: "Request a scoped quote",
    image:
      "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/b42c69a20_generated_image.png",
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
    priceLabel: "Request a scoped quote",
    image:
      "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/9b9d1f784_generated_image.png",
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
    priceLabel: "Book an advisory session",
    image:
      "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/1756905aa_generated_image.png",
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
] as const;

export function getStoreProduct(slug: string) {
  return storeProducts.find((product) => product.slug === slug);
}
