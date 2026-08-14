export interface SupportKnowledgeLink {
  title: string;
  href: string;
  description: string;
}

interface SupportKnowledgeEntry extends SupportKnowledgeLink {
  keywords: readonly string[];
  guidance: string;
}

const SUPPORT_KNOWLEDGE: readonly SupportKnowledgeEntry[] = [
  {
    title: "Account security",
    href: "/app/security",
    description: "Password, access, and account-security controls.",
    keywords: ["password", "login", "sign in", "access", "locked", "security"],
    guidance:
      "Direct authenticated members to Account Security for password and access controls. Never ask for a password, one-time code, recovery code, API key, private key, or session cookie.",
  },
  {
    title: "Organization workspace",
    href: "/app/workspace",
    description: "Organization projects, members, workstreams, and workspace status.",
    keywords: ["workspace", "organization", "organisation", "company", "team", "project", "member"],
    guidance:
      "Use the organization workspace for the member's own projects and team activity. Access remains limited by membership and assigned workspace role.",
  },
  {
    title: "Requests",
    href: "/app/requests",
    description: "Create and track service or operational requests.",
    keywords: ["request", "case", "ticket", "help", "issue", "problem", "follow up"],
    guidance:
      "Use Requests to create a durable service case and track its status. Do not promise a response time unless the signed service scope states one.",
  },
  {
    title: "Human support",
    href: "/app/support",
    description: "Contact GEM support or continue with a human-support case.",
    keywords: ["human", "agent", "advisor", "representative", "live support", "customer service", "support"],
    guidance:
      "A member can request human support at any time. Record the handoff as a durable GEM support case and state truthfully whether an external service desk accepted it.",
  },
  {
    title: "Verification status",
    href: "/app/compliance",
    description: "Review verification and compliance status.",
    keywords: ["kyc", "verify", "verification", "compliance", "identity", "review status"],
    guidance:
      "Explain where the member can review verification status. Never decide identity, fraud, eligibility, or compliance outcomes; route those decisions to an authorized reviewer.",
  },
  {
    title: "Documents",
    href: "/app/documents",
    description: "Review available account and compliance documents.",
    keywords: ["document", "statement", "report", "upload", "file", "certificate"],
    guidance:
      "Direct members to Documents for available records. Sensitive upload remains unavailable unless private storage and malware scanning are verified end to end.",
  },
  {
    title: "Products and services",
    href: "/app/products",
    description: "Review scoped products, services, and entitlements.",
    keywords: ["product", "service", "entitlement", "plan", "coverage", "activate"],
    guidance:
      "Products shown in the portal are subject to eligibility, scope, provider availability, jurisdiction, and contract checks. Display does not itself activate a service.",
  },
  {
    title: "Portfolios",
    href: "/app/portfolios",
    description: "Review assigned portfolio information and access.",
    keywords: ["portfolio", "allocation", "holding", "asset", "exposure"],
    guidance:
      "Direct members to Portfolios for information already assigned to their account. Never recommend an allocation, trade, investment, or financial action.",
  },
  {
    title: "Meetings",
    href: "/app/meetings",
    description: "Request and review meetings with the GEM team.",
    keywords: ["meeting", "appointment", "schedule", "booking", "consultation", "call me"],
    guidance:
      "Use Meetings to request a consultation. A request is not confirmed until an authorized team member confirms it.",
  },
  {
    title: "GEM News",
    href: "/intel/news",
    description: "Read native GEM news, saved stories, and video coverage.",
    keywords: ["news", "newsletter", "article", "video", "digest", "feed"],
    guidance:
      "GEM News is informational and may change rapidly. Encourage members to verify material claims with the original publisher before making security, financial, legal, or operational decisions.",
  },
  {
    title: "Notifications",
    href: "/app/notifications",
    description: "Review account alerts and workflow updates.",
    keywords: ["notification", "alert", "update", "message", "unread"],
    guidance:
      "Direct members to Notifications for account and workflow updates. Do not claim that an email, SMS, or external alert was sent without verified delivery evidence.",
  },
] as const;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function retrieveSupportKnowledge(query: string, limit = 3): SupportKnowledgeEntry[] {
  const normalized = normalize(query);
  if (!normalized) return [];

  return SUPPORT_KNOWLEDGE.map((entry) => ({
    entry,
    score: entry.keywords.reduce((total, keyword) => {
      const normalizedKeyword = normalize(keyword);
      return total + (normalized.includes(normalizedKeyword) ? normalizedKeyword.split(" ").length + 1 : 0);
    }, 0),
  }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title))
    .slice(0, Math.max(0, limit))
    .map(({ entry }) => entry);
}

export function formatSupportKnowledge(entries: readonly SupportKnowledgeEntry[]): string {
  if (entries.length === 0) {
    return "No directly matching verified knowledge entry was found. Ask one concise clarifying question or offer human support.";
  }

  return entries
    .map(
      (entry) =>
        `- ${entry.title} (${entry.href}): ${entry.guidance}`,
    )
    .join("\n");
}

export function toSupportKnowledgeLinks(
  entries: readonly SupportKnowledgeEntry[],
): SupportKnowledgeLink[] {
  return entries.map(({ title, href, description }) => ({ title, href, description }));
}
