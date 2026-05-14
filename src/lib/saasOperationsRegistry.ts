export type OperationsDomain =
  | "agent"
  | "admin"
  | "enterpriseProjects"
  | "development"
  | "production"
  | "automation"
  | "marketing"
  | "sales"
  | "billing"
  | "support"
  | "analytics"
  | "security"
  | "integrations"
  | "notifications";

export type OperationMode = "ready" | "partial" | "planned" | "external";

export interface OperationRoute {
  domain: OperationsDomain;
  label: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  mode: OperationMode;
  risk: "safe" | "approval_required" | "destructive";
  existingGemRoute?: string;
  description: string;
}

export const agentOperatingInstructions = [
  "Use admin operations only for organization-wide governance, users, roles, permissions, access, and enterprise controls.",
  "Use enterprise project operations for planning, tasks, milestones, risks, approvals, and executive reporting.",
  "Use development operations for repositories, branches, builds, releases, deployments, and environment delivery workflows.",
  "Use production operations for live health, incidents, feature flags, uptime, rollbacks, and monitoring.",
  "Use automation operations for workflows, schedules, triggers, job runs, approvals, and background business processes.",
  "Use marketing operations for campaigns, contacts, segments, lifecycle messaging, and attribution.",
  "Use sales operations for deals, pipeline, accounts, opportunities, and revenue workflows.",
  "Use billing operations for plans, customers, subscriptions, invoices, payments, usage, and entitlements.",
  "Use support operations for tickets, knowledge base, customer issues, SLAs, and escalations.",
  "Use analytics operations for dashboards, reports, events, metrics, KPIs, and business intelligence.",
  "Use security operations for API keys, audit logs, SSO, access reviews, compliance checks, and policy enforcement.",
  "Use integration operations for external tools, webhooks, and event notifications.",
  "Never delete, cancel, revoke, archive, send campaigns, roll back, or deploy to production unless explicitly requested.",
] as const;

export const operationsRegistry: OperationRoute[] = [
  {
    domain: "agent",
    label: "Agent Instructions",
    method: "GET",
    path: "/api/agent/instructions",
    mode: "ready",
    risk: "safe",
    description: "Returns the operational instructions that govern the SaaS agent.",
  },
  {
    domain: "security",
    label: "Audit Logs",
    method: "GET",
    path: "/api/admin/audit",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/admin/audit",
    description: "Lists audit evidence for admin/security review.",
  },
  {
    domain: "admin",
    label: "Admin Stats",
    method: "GET",
    path: "/api/admin/stats",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/admin/stats",
    description: "Returns aggregate operational stats for the admin dashboard.",
  },
  {
    domain: "admin",
    label: "Admin KYC Queue",
    method: "GET",
    path: "/api/admin/kyc",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/admin/kyc",
    description: "Lists KYC submissions for admin review.",
  },
  {
    domain: "admin",
    label: "Admin KYC Decision",
    method: "PATCH",
    path: "/api/admin/kyc",
    mode: "ready",
    risk: "approval_required",
    existingGemRoute: "/api/admin/kyc",
    description: "Approves, rejects, or flags KYC submissions. Requires explicit operator intent.",
  },
  {
    domain: "admin",
    label: "Admin Users",
    method: "GET",
    path: "/api/admin/users",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/admin/users",
    description: "Lists platform users for admin review.",
  },
  {
    domain: "marketing",
    label: "Admin Campaigns",
    method: "GET",
    path: "/api/admin/campaigns",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/admin/campaigns",
    description: "Lists email campaigns.",
  },
  {
    domain: "marketing",
    label: "Send Campaign",
    method: "POST",
    path: "/api/admin/campaigns/{id}/send",
    mode: "ready",
    risk: "approval_required",
    existingGemRoute: "/api/admin/campaigns/[id]/send",
    description: "Sends an email campaign. Must only run after explicit user approval.",
  },
  {
    domain: "support",
    label: "Support Tickets",
    method: "GET",
    path: "/api/ticket",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/ticket",
    description: "Lists support tickets for the authenticated user.",
  },
  {
    domain: "support",
    label: "Create Support Ticket",
    method: "POST",
    path: "/api/ticket/create",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/ticket/create",
    description: "Creates a support ticket through the existing support workflow.",
  },
  {
    domain: "support",
    label: "Start Support Session",
    method: "POST",
    path: "/api/support/session/start",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/support/session/start",
    description: "Starts a support session for AI-assisted support.",
  },
  {
    domain: "support",
    label: "Escalate Support",
    method: "POST",
    path: "/api/support/escalate",
    mode: "ready",
    risk: "approval_required",
    existingGemRoute: "/api/support/escalate",
    description: "Escalates a support session to a human queue.",
  },
  {
    domain: "agent",
    label: "AI Session",
    method: "POST",
    path: "/api/assistant/session",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/assistant/session",
    description: "Creates an AI run/session record.",
  },
  {
    domain: "agent",
    label: "AI Message",
    method: "POST",
    path: "/api/assistant/message",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/assistant/message",
    description: "Sends a governed AI assistant message.",
  },
  {
    domain: "enterpriseProjects",
    label: "Service Requests",
    method: "GET",
    path: "/api/requests",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/requests",
    description: "Lists operational service requests.",
  },
  {
    domain: "enterpriseProjects",
    label: "Create Service Request",
    method: "POST",
    path: "/api/requests",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/requests",
    description: "Creates an operational service request.",
  },
  {
    domain: "enterpriseProjects",
    label: "Meetings",
    method: "GET",
    path: "/api/meetings",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/meetings",
    description: "Lists meeting requests.",
  },
  {
    domain: "enterpriseProjects",
    label: "Create Meeting Request",
    method: "POST",
    path: "/api/meetings",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/meetings",
    description: "Creates a meeting request.",
  },
  {
    domain: "billing",
    label: "Entitlements",
    method: "GET",
    path: "/api/dashboard/summary",
    mode: "partial",
    risk: "safe",
    existingGemRoute: "/api/dashboard/summary",
    description: "Uses dashboard summary to expose entitlement status until a dedicated billing API is introduced.",
  },
  {
    domain: "analytics",
    label: "Dashboard Summary",
    method: "GET",
    path: "/api/dashboard/summary",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/dashboard/summary",
    description: "Returns dashboard KPIs and account status.",
  },
  {
    domain: "integrations",
    label: "Developer API Keys",
    method: "GET",
    path: "/api/developers/keys",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/developers/keys",
    description: "Lists developer API keys.",
  },
  {
    domain: "integrations",
    label: "Create Developer API Key",
    method: "POST",
    path: "/api/developers/keys",
    mode: "ready",
    risk: "approval_required",
    existingGemRoute: "/api/developers/keys",
    description: "Creates an API key. Key creation requires explicit user approval.",
  },
  {
    domain: "integrations",
    label: "Revoke Developer API Key",
    method: "DELETE",
    path: "/api/developers/keys/{id}",
    mode: "ready",
    risk: "destructive",
    existingGemRoute: "/api/developers/keys/[id]",
    description: "Revokes an API key. Destructive and requires explicit user instruction.",
  },
  {
    domain: "production",
    label: "Production Health",
    method: "GET",
    path: "/api/health",
    mode: "ready",
    risk: "safe",
    existingGemRoute: "/api/health",
    description: "Returns public health status for the application.",
  },
  {
    domain: "development",
    label: "GitHub Repository Operations",
    method: "GET",
    path: "connected:github",
    mode: "external",
    risk: "approval_required",
    description: "Use the connected GitHub app for branches, commits, pull requests, issues, and repository operations.",
  },
  {
    domain: "production",
    label: "Vercel Deployment Operations",
    method: "GET",
    path: "connected:vercel",
    mode: "external",
    risk: "approval_required",
    description: "Use the connected Vercel app for deployment, environment, build log, and domain operations.",
  },
  {
    domain: "analytics",
    label: "Amplitude Analytics Operations",
    method: "GET",
    path: "connected:amplitude",
    mode: "external",
    risk: "safe",
    description: "Use connected Amplitude for analytics dashboards, charts, events, experiments, and metrics.",
  },
  {
    domain: "automation",
    label: "Linear Project Operations",
    method: "GET",
    path: "connected:linear",
    mode: "external",
    risk: "approval_required",
    description: "Use connected Linear for issues, projects, roadmaps, and operational execution tracking.",
  }
];

export function getOperationsByDomain(domain: OperationsDomain) {
  return operationsRegistry.filter((operation) => operation.domain === domain);
}

export function getReadyOperations() {
  return operationsRegistry.filter((operation) => operation.mode === "ready");
}

export function getApprovalRequiredOperations() {
  return operationsRegistry.filter((operation) => operation.risk !== "safe");
}
