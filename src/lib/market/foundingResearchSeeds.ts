export type FoundingResearchSegment = "PROFESSIONAL_SERVICES" | "PROPERTY" | "LOGISTICS";

export interface FoundingResearchSeed {
  company: string;
  website: string;
  location: string;
  segment: FoundingResearchSegment;
  estimatedEmployees: number;
  fitReason: string;
  personalizationAngle: string;
  sourceLabel: string;
  status: "RESEARCH_SEED";
}

export const foundingResearchSeedGeneratedAt = "2026-09-13";

export const foundingResearchSeeds: readonly FoundingResearchSeed[] = [
  {
    company: "Lease & LaBau, Inc.", website: "http://www.leaselabau.com", location: "New York, NY", segment: "PROFESSIONAL_SERVICES", estimatedEmployees: 8,
    fitReason: "Legal recruiting business with candidate/client workflows and a public web presence; a bounded review can focus on identity, access, data handling, and operational continuity without assuming a security defect.",
    personalizationAngle: "Reference its long-running legal recruitment operation and the importance of keeping candidate/client workflows dependable.", sourceLabel: "Clay company research · public company data · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "Lighthouse Legal Search", website: "http://www.lhouselegal.com/", location: "San Francisco, CA", segment: "PROFESSIONAL_SERVICES", estimatedEmployees: 7,
    fitReason: "Executive legal recruiting firm with global client/candidate relationships and a compact team that fits the founding scope.",
    personalizationAngle: "Reference its global legal-search relationships and frame the review around trusted access, communications, and continuity.", sourceLabel: "Public website/LinkedIn verification · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "Kehlenbrink, Lawrence & Pauckner, CPAs", website: "https://klpcpa.com/", location: "Indianapolis, IN", segment: "PROFESSIONAL_SERVICES", estimatedEmployees: 9,
    fitReason: "Long-standing CPA firm serving small businesses with accounting, tax, consulting, payroll, bookkeeping, and technology-enabled workflows.",
    personalizationAngle: "Reference its client-focused accounting model and use of technology to support performance, without making any claim about its current security posture.", sourceLabel: "Public website/LinkedIn verification · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "Blacklock Advisory", website: "https://blacklockadvisory.com/", location: "Austin, TX", segment: "PROFESSIONAL_SERVICES", estimatedEmployees: 5,
    fitReason: "Compact advisory/recruiting operation serving professional-services networks; relevant to trusted communications, shared tools, and third-party relationship controls.",
    personalizationAngle: "Position the review as an independent check of access and operational dependencies across a small advisory team and external professional network.", sourceLabel: "Clay company research · public company data · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "10x Advisory", website: "https://www.10x-advisory.com/", location: "United States", segment: "PROFESSIONAL_SERVICES", estimatedEmployees: 8,
    fitReason: "Transaction, valuation, and CFO advisory work depends on reliable client collaboration, financial information handling, and distributed professional workflows.",
    personalizationAngle: "Reference its flexible advisory model and frame GEM as a bounded outside review of access, operational dependencies, and incident readiness.", sourceLabel: "Clay company research + public website · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "ArcherStanley Group", website: "https://archerstanley.com/", location: "Bethesda, MD", segment: "PROFESSIONAL_SERVICES", estimatedEmployees: 3,
    fitReason: "Accounting/finance executive recruiting firm whose delivery depends on trusted client/candidate communications and a small operating team.",
    personalizationAngle: "Reference its personalized recruiting and vetting process and offer an independent review of the systems and access supporting that service.", sourceLabel: "Clay company research + public website · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "Camuso CPA", website: "https://camusocpa.com/", location: "Charlotte, NC", segment: "PROFESSIONAL_SERVICES", estimatedEmployees: 3,
    fitReason: "Digital-asset tax/accounting firm handling complex client financial workflows; a bounded review is relevant to identity, data handling, public exposure, and incident readiness.",
    personalizationAngle: "Reference its digital-asset accounting focus and frame the review around the operational controls supporting complex client workflows.", sourceLabel: "Clay company research + public website · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "The Killino Firm, P.C.", website: "http://www.killinofirm.com", location: "United States", segment: "PROFESSIONAL_SERVICES", estimatedEmployees: 9,
    fitReason: "Small law practice coordinating client matters and outside expertise; suitable for a review of account access, client-data handling, external dependencies, and incident readiness.",
    personalizationAngle: "Center the message on operational resilience for a small legal team coordinating complex matters and outside experts.", sourceLabel: "Clay company research · public company data · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "East Side Property Management", website: "https://eastsideflorida.com/", location: "Pompano Beach, FL", segment: "PROPERTY", estimatedEmployees: 2,
    fitReason: "Small property-management operator coordinating tenants, owners, maintenance, reporting, and vendor workflows through digital communication channels.",
    personalizationAngle: "Reference its personalized South Florida property-management model and offer a practical review of access and operational dependencies behind day-to-day service.", sourceLabel: "Clay company research + public website/LinkedIn · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "The Ailion Team", website: "https://www.locationlocationlocation.com/", location: "Alpharetta, GA", segment: "PROPERTY", estimatedEmployees: 3,
    fitReason: "Real-estate team using technology across sales, property management, marketing, training, and client transactions; strong fit for a small-team operations/access review.",
    personalizationAngle: "Reference the team's technology-enabled real-estate and property-management workflows and keep the message focused on resilience rather than inferred weakness.", sourceLabel: "Clay company research + public website · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "South Downtown Atlanta", website: "https://www.southdowntownatl.com/", location: "Atlanta, GA", segment: "PROPERTY", estimatedEmployees: 10,
    fitReason: "Small real-estate development operation coordinating a multi-building neighborhood project and external local partners.",
    personalizationAngle: "Reference the multi-property, partner-heavy operating model and frame the review around dependable access, communications, and third-party coordination.", sourceLabel: "Clay company research + public website · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "John Hughes Company", website: "https://jhughesco.com/", location: "Raleigh, NC", segment: "PROPERTY", estimatedEmployees: 6,
    fitReason: "Small real-estate and technology deal-sourcing/executive-search business aligned with the founding scope and dependent on trusted communications.",
    personalizationAngle: "Lead with an outside review of the access and communication controls supporting a small team working across real estate, technology, and executive search.", sourceLabel: "Clay company research + public website · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "McGowan Mortgages", website: "https://www.mcgowanmortgages.com/", location: "Kansas City, MO", segment: "PROPERTY", estimatedEmployees: 8,
    fitReason: "Mortgage operation with online pre-qualification, secure portal/signing, borrower documentation, and regulated customer-information workflows; qualification and scope review are required before any engagement.",
    personalizationAngle: "Reference its digital borrower journey and position GEM as an independent operational/security review rather than a compliance certification.", sourceLabel: "Clay company research + public website · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "Real Estate Financial Modeling", website: "https://www.getrefm.com/", location: "Atlanta, GA", segment: "PROPERTY", estimatedEmployees: 10,
    fitReason: "Web-based commercial real-estate modeling/training business with software, digital courses, consulting, support, and customer-account dependencies.",
    personalizationAngle: "Reference its modeling software and training platform and offer a bounded review of the access and operational dependencies supporting customers.", sourceLabel: "Clay company research + public website · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "TextLocate", website: "https://textlocate.com/", location: "Chattanooga, TN", segment: "LOGISTICS", estimatedEmployees: 10,
    fitReason: "Logistics technology service whose value depends on SMS, location updates, document/image flows, and reliable customer/carrier communication.",
    personalizationAngle: "Reference its communication-centric freight workflow and frame the review around access, third-party dependencies, and service continuity.", sourceLabel: "Clay company research · public company data · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "Blue Bridge Logistics", website: "http://www.bluebridgelogistics.net", location: "Houston, TX", segment: "LOGISTICS", estimatedEmployees: 6,
    fitReason: "Small logistics firm coordinating drayage, rail/port and trucking workflows; close fit with the founding team's size boundary and operational-dependency focus.",
    personalizationAngle: "Reference the compact team coordinating rail, port, and trucking handoffs and position the review as a practical access/resilience check.", sourceLabel: "Clay company research · public company data · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "DOF Ground", website: "https://dofground.com/", location: "Medley, FL", segment: "LOGISTICS", estimatedEmployees: 9,
    fitReason: "Freight-brokerage and logistics operation coordinating carriers, customers, and cross-border/time-sensitive workflows through digital systems.",
    personalizationAngle: "Reference its carrier/customer coordination model and offer a bounded review of access, shared tooling, and operational single points of failure.", sourceLabel: "Clay company research · public company data · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "Arrow 3PL", website: "https://arrow3pl.com/", location: "Syosset, NY", segment: "LOGISTICS", estimatedEmployees: 2,
    fitReason: "Very small freight-brokerage operation with technology-assisted customer/carrier coordination and a strong fit to the founding scope.",
    personalizationAngle: "Keep the approach practical: a small-team review of access, communications, and continuity around daily freight brokerage operations.", sourceLabel: "Clay company research · public company data · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "Rig On Wheels Recruitment Services", website: "https://rigonwheels.com/", location: "Spring, TX", segment: "LOGISTICS", estimatedEmployees: 6,
    fitReason: "Trucking recruitment business connecting drivers and companies through communication- and data-heavy workflows that fit a small-team operations/access review.",
    personalizationAngle: "Reference the driver/company matching workflow and offer a review focused on dependable access, data handling, and communication continuity.", sourceLabel: "Clay company research · public company data · 2026-09-13", status: "RESEARCH_SEED",
  },
  {
    company: "FSN (Freedom Search Network)", website: "https://freedomsearch.com/", location: "Wake Forest, NC", segment: "LOGISTICS", estimatedEmployees: 10,
    fitReason: "Supply-chain recruiting operation handling candidate/client relationships and logistics-industry workflows within the founding team-size limit.",
    personalizationAngle: "Reference its supply-chain talent focus and frame the review around trusted communications, access, and continuity across candidate/client operations.", sourceLabel: "Clay company research · public company data · 2026-09-13", status: "RESEARCH_SEED",
  },
];
