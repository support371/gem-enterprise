import type { CommandCenterSection } from "@/lib/commandCenter";

export interface CommandCenterDestination {
  label: string;
  href: string;
  description: string;
}

export interface CommandCenterWorkspace {
  section: CommandCenterSection;
  audience: string;
  outcome: string;
  destinations: CommandCenterDestination[];
}

export const commandCenterWorkspaces: CommandCenterWorkspace[] = [
  {
    section: "development",
    audience: "Engineering and platform teams",
    outcome: "Move from source and APIs to a controlled release without mixing delivery work into business operations.",
    destinations: [
      { label: "API operations", href: "/app/admin/api", description: "Review API domains, readiness, and approval boundaries." },
      { label: "Integrations", href: "/app/command-center/integrations", description: "Inspect connected services and configuration ownership." },
      { label: "Developer documentation", href: "/developers", description: "Open API, security, and webhook documentation." },
    ],
  },
  {
    section: "marketing",
    audience: "Marketing, content, and communications teams",
    outcome: "Plan, approve, publish, and measure content through focused governed tools.",
    destinations: [
      { label: "Campaigns", href: "/app/admin/campaigns", description: "Create and control outbound campaign delivery." },
      { label: "Social media suite", href: "/app/social-media", description: "Manage content, video, approvals, scheduling, and analytics." },
      { label: "TikTok operations", href: "/app/command-center/tokmetric", description: "Open governed TokMetric accounts, publishing, and compliance controls." },
      { label: "News ingestion", href: "/app/admin/news", description: "Manage trusted sources and automated ingestion runs." },
    ],
  },
  {
    section: "sales",
    audience: "Sales, partnerships, and client-success teams",
    outcome: "Move an opportunity from request to approved service activation with clear ownership.",
    destinations: [
      { label: "Service requests", href: "/app/requests", description: "Review requests, submissions, and delivery status." },
      { label: "Client portfolio", href: "/app/command-center/clients", description: "Review tenant health, adoption, renewals, and demand." },
      { label: "Revenue operations", href: "/app/command-center/revenue", description: "Review products, usage, and activation paths." },
    ],
  },
  {
    section: "monitoring",
    audience: "Operations, security, and leadership",
    outcome: "Inspect live evidence and trends without mixing monitoring with configuration or execution controls.",
    destinations: [
      { label: "Audit evidence", href: "/app/admin/audit", description: "Inspect traceable platform and administrative events." },
      { label: "Security operations", href: "/app/command-center/security", description: "Review incidents, posture, and response work." },
      { label: "Intelligence", href: "/intel", description: "Follow cross-domain news and intelligence signals." },
    ],
  },
  {
    section: "teams",
    audience: "Internal delivery teams and organization members",
    outcome: "Keep assigned project work, collaboration, and weekly reporting in the correct workspace.",
    destinations: [
      { label: "Organization workspace", href: "/app/workspace", description: "Open assigned projects, team members, tools, and updates." },
      { label: "Meetings", href: "/app/meetings", description: "Coordinate consultations and project meetings." },
      { label: "Messages", href: "/app/messages", description: "Continue secure project conversations." },
    ],
  },
  {
    section: "support",
    audience: "Support teams, live agents, and service owners",
    outcome: "Resolve requests through AI-assisted triage and a clear handoff to human support.",
    destinations: [
      { label: "Support workspace", href: "/app/support", description: "Review support channels, requests, and service follow-through." },
      { label: "AI agent operations", href: "/app/command-center/agents", description: "Review assistance quality, errors, and human approvals." },
      { label: "Client requests", href: "/app/requests", description: "Connect active support work to its originating request." },
    ],
  },
];

export const commandCenterRoleDirections = [
  {
    role: "Clients & organization owners",
    startLabel: "Organization workspace",
    startHref: "/app/workspace",
    direction: "Manage only the assigned organization, its projects, team, documents, meetings, requests, and weekly updates.",
  },
  {
    role: "Internal teams",
    startLabel: "Team delivery",
    startHref: "/app/command-center/teams",
    direction: "Open the assigned delivery workspace first, then move to the dedicated functional page for execution.",
  },
  {
    role: "Admins & super admins",
    startLabel: "Enterprise operations",
    startHref: "/app/command-center",
    direction: "Use platform-wide pages for governance, monitoring, access, approvals, evidence, integrations, and oversight.",
  },
] as const;

export function getCommandCenterWorkspace(section: CommandCenterSection) {
  return commandCenterWorkspaces.find((workspace) => workspace.section === section);
}
