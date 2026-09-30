import { z } from "zod";

const hubLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().url(),
  status: z.enum(["live", "pending"]),
  disclosure: z.string().optional(),
});

export const digitalHubCatalog = {
  version: "2026.09",
  referral: {
    provider: "BTCC",
    code: "7PSOT6",
    href: "https://www.btcc.com/en-US/register?inviteCode=7PSOT6",
    disclosure:
      "GEM may earn a commission when eligible activity is completed through this referral route. Crypto trading can result in loss.",
  },
  connections: [
    {
      label: "BTCC",
      href: "https://www.btcc.com/en-US/register?inviteCode=7PSOT6",
      status: "live",
      disclosure: "Referral and education route; BTCC controls eligibility, verification, and account access.",
    },
    { label: "GEM Enterprise", href: "https://www.gemcybersecurityassist.com", status: "live" },
  ],
  services: [
    {
      id: "cybersecurity",
      title: "Enterprise cybersecurity",
      state: "available",
      description:
        "Security assessment, monitoring, threat-intelligence support, incident-readiness planning, and scoped client advisory work.",
    },
    {
      id: "crypto-market",
      title: "Crypto market intelligence",
      state: "controlled",
      description:
        "Market review, signal interpretation, exchange-readiness workflows, and risk controls. Live execution is never represented as enabled unless its provider gate is actually verified.",
    },
    {
      id: "workspace",
      title: "Unified client workspace",
      state: "controlled",
      description:
        "One client identity, organization, workspace, service record, and governed management surface.",
    },
    {
      id: "social",
      title: "Managed social presence",
      state: "controlled",
      description:
        "Planning, approval, publishing, verification, and analytics across authorized provider accounts.",
    },
    {
      id: "digital-hub",
      title: "Digital hub builds",
      state: "available",
      description:
        "A configurable public hub joining verified offers, referrals, wallet routes, services, communities, and disclosures.",
    },
  ],
} as const;

export type DigitalHubCatalog = typeof digitalHubCatalog;

export function publicDigitalHubCatalog() {
  return {
    ...digitalHubCatalog,
    connections: digitalHubCatalog.connections.map((connection) =>
      hubLinkSchema.parse(connection),
    ),
  };
}
