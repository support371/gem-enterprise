export type KycState =
  | "not_started"
  | "started"
  | "in_progress"
  | "documents_uploaded"
  | "under_review"
  | "manual_review"
  | "approved"
  | "rejected"
  | "expired";

export type UserRole = "client" | "admin";

export interface PlatformUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  sessionExpiresAt: number | null;
  kycState: KycState;
  entitlements: Array<"cyber" | "financial" | "real-estate">;
  assignedPortfolioId?: string;
}

export interface SupportTicket {
  id: string;
  createdAt: string;
  userId: string;
  title: string;
  status: "open" | "in_progress" | "closed";
}

export interface AccessRequest {
  id: string;
  createdAt: string;
  userId: string;
  category: string;
  status: "pending" | "approved" | "rejected";
}

export interface NotificationItem {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface PlatformDb {
  users: PlatformUser[];
  supportTickets: SupportTicket[];
  requests: AccessRequest[];
  notifications: NotificationItem[];
}

const DB_KEY = "gem-enterprise-db";
const SESSION_KEY = "gem-enterprise-session";

const seedDb: PlatformDb = {
  users: [
    {
      id: "u-admin",
      email: "admin@gem-enterprise.com",
      password: "admin123",
      name: "GEM Admin",
      role: "admin",
      sessionExpiresAt: null,
      kycState: "approved",
      entitlements: ["cyber", "financial", "real-estate"],
    },
    {
      id: "u-client",
      email: "client@gem-enterprise.com",
      password: "client123",
      name: "Enterprise Client",
      role: "client",
      sessionExpiresAt: null,
      kycState: "under_review",
      entitlements: ["cyber"],
      assignedPortfolioId: "portfolio-alpha",
    },
  ],
  supportTickets: [],
  requests: [],
  notifications: [],
};

export const publicMenus = {
  Home: ["Overview", "Platform Highlights", "Leadership", "Client Access", "Get Started"],
  Intel: ["Threat Intelligence", "Reports", "Monitoring", "Intel Briefs", "Architecture Specs"],
  Services: ["Cybersecurity", "Financial", "Real Estate", "Assessments", "Consultations"],
  Community: ["Membership", "Newsletters", "Events", "Testimonials", "Partners"],
  Hub: ["Command Center", "Documents", "Support Access", "Requests", "Client Portal"],
  Resources: ["Market Insights", "Templates", "Bots", "News", "FAQ"],
  Company: ["About", "Leadership & Vision", "Executive Board", "Teams", "Partners & Trustees", "Compliance Notice"],
};

export const publicRoutes: Record<string, { title: string; section: keyof typeof publicMenus | "Contact" | "Get Started" | "Legal"; blurb: string }> = {
  "/": { title: "Home", section: "Home", blurb: "Cybersecurity-first enterprise platform with Financial and Real Estate divisions." },
  "/home": { title: "Home", section: "Home", blurb: "Enterprise overview and operational access." },
  "/intel": { title: "Intel", section: "Intel", blurb: "Threat intelligence, monitoring, and actionable briefs." },
  "/services": { title: "Services", section: "Services", blurb: "Cybersecurity primary services with financial and real estate divisions." },
  "/services/cybersecurity": { title: "Cybersecurity Services", section: "Services", blurb: "Incident response, SOC modernization, and resilience design." },
  "/services/financial": { title: "Financial Services", section: "Services", blurb: "Advisory, risk controls, and financial operations governance." },
  "/services/real-estate": { title: "Real Estate Services", section: "Services", blurb: "Asset security intelligence and portfolio-level risk posture." },
  "/community": { title: "Community", section: "Community", blurb: "Membership, partner network, and trusted stakeholder programs." },
  "/hub": { title: "Hub", section: "Hub", blurb: "Command center for documents, support, and requests." },
  "/resources": { title: "Resources", section: "Resources", blurb: "Market insights, templates, bots, and enterprise knowledgebase." },
  "/resources/news": { title: "Resource News", section: "Resources", blurb: "Current updates across operations and controls." },
  "/resources/market-insights": { title: "Market Insights", section: "Resources", blurb: "Cross-division intelligence, macro and operational signals." },
  "/resources/templates": { title: "Templates", section: "Resources", blurb: "Operational templates for onboarding, review, and controls." },
  "/resources/bots": { title: "Bots", section: "Resources", blurb: "Assistive automation for client and internal workflows." },
  "/company": { title: "Company", section: "Company", blurb: "Leadership, governance, teams, and partner ecosystem." },
  "/company/leadership": { title: "Leadership", section: "Company", blurb: "Leadership and strategic direction." },
  "/company/executive-board": { title: "Executive Board", section: "Company", blurb: "Board-level oversight and governance." },
  "/company/teams": { title: "Teams", section: "Company", blurb: "Operational teams and functional units." },
  "/company/partners": { title: "Partners", section: "Company", blurb: "Partners, trustees, and alignment model." },
  "/company/testimonials": { title: "Testimonials", section: "Company", blurb: "Client and partner impact statements." },
  "/about": { title: "About", section: "Company", blurb: "About GEM Enterprise mission and operating model." },
  "/contact": { title: "Contact", section: "Contact", blurb: "Request a consultation or enterprise support." },
  "/get-started": { title: "Get Started", section: "Get Started", blurb: "Eligibility, onboarding, and secure entry path." },
  "/eligibility": { title: "Eligibility", section: "Get Started", blurb: "Program and access eligibility requirements." },
  "/kyc/start": { title: "KYC Start", section: "Get Started", blurb: "Begin KYC registration by entity type." },
  "/kyc/individual": { title: "Individual KYC", section: "Get Started", blurb: "Individual applicant workflow." },
  "/kyc/business": { title: "Business KYC", section: "Get Started", blurb: "Business entity workflow." },
  "/kyc/trust": { title: "Trust KYC", section: "Get Started", blurb: "Trust onboarding workflow." },
  "/kyc/family-office": { title: "Family Office KYC", section: "Get Started", blurb: "Family office onboarding workflow." },
  "/kyc/upload": { title: "KYC Upload", section: "Get Started", blurb: "Document metadata intake and upload completion." },
  "/kyc/review": { title: "KYC Review", section: "Get Started", blurb: "Review and submit KYC package." },
  "/kyc/status": { title: "KYC Status", section: "Get Started", blurb: "Track your lifecycle state and next action." },
  "/decision/pending": { title: "Decision Pending", section: "Get Started", blurb: "Application under active review." },
  "/decision/approved": { title: "Decision Approved", section: "Get Started", blurb: "Application approved and ready for access." },
  "/decision/rejected": { title: "Decision Rejected", section: "Get Started", blurb: "Review outcome and remediation steps." },
  "/decision/manual-review": { title: "Manual Review", section: "Get Started", blurb: "Additional analyst review is required." },
  "/client-login": { title: "Client Login", section: "Get Started", blurb: "Secure access for returning users and admins." },
  "/portal": { title: "Client Portal", section: "Hub", blurb: "Portal overview and access guidance." },
  "/access/continue": { title: "Access Continue", section: "Get Started", blurb: "Session and entitlement bridge into protected application." },
  "/privacy": { title: "Privacy", section: "Legal", blurb: "Privacy policy and data handling terms." },
  "/terms": { title: "Terms", section: "Legal", blurb: "Terms of use and service conditions." },
  "/compliance-notice": { title: "Compliance Notice", section: "Legal", blurb: "Regulatory and compliance disclosures." },
};

export function readDb(): PlatformDb {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    localStorage.setItem(DB_KEY, JSON.stringify(seedDb));
    return structuredClone(seedDb);
  }
  return JSON.parse(raw);
}

export function writeDb(db: PlatformDb) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getCurrentUser(): PlatformUser | null {
  const userId = localStorage.getItem(SESSION_KEY);
  if (!userId) return null;
  const user = readDb().users.find((u) => u.id === userId) ?? null;
  return user;
}

export function setCurrentUser(userId: string | null) {
  if (!userId) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, userId);
}

export function evaluateAccessRedirect(user: PlatformUser | null): string {
  if (!user) return "/client-login";
  if (!user.sessionExpiresAt || user.sessionExpiresAt < Date.now()) return "/client-login?reason=session-expired";
  if (user.role === "admin") return "/app/admin";

  if (user.kycState === "not_started") return "/kyc/start";
  if (["started", "in_progress", "documents_uploaded"].includes(user.kycState)) return "/kyc/status";
  if (user.kycState === "under_review") return "/decision/pending";
  if (user.kycState === "manual_review") return "/decision/manual-review";
  if (user.kycState === "rejected") return "/decision/rejected";

  if (user.assignedPortfolioId) return `/app/portfolios/${user.assignedPortfolioId}`;
  if (user.entitlements.includes("cyber")) return "/app/products/cyber";
  if (user.entitlements.includes("financial")) return "/app/products/financial";
  if (user.entitlements.includes("real-estate")) return "/app/products/real-estate";
  return "/portal/dashboard";
}
