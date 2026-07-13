export type PlanWorkspaceId = "basic" | "professional" | "enterprise";

export interface PlanWorkspacePersona {
  id: string;
  label: string;
  perspective: string;
  summary: string;
  primaryActions: string[];
  visibleAreas: string[];
  restrictedAreas: string[];
}

export interface PlanWorkspaceMetric {
  label: string;
  value: string;
  context: string;
  tone: "cyan" | "emerald" | "amber" | "violet";
}

export interface PlanWorkspaceQueueItem {
  id: string;
  title: string;
  area: string;
  status: "Ready" | "Needs review" | "Waiting" | "Draft";
  owner: string;
}

export interface PlanWorkspaceDefinition {
  id: PlanWorkspaceId;
  name: string;
  audience: string;
  summary: string;
  commercialStatus: string;
  accent: "cyan" | "emerald" | "violet";
  modules: string[];
  limits: string[];
  metrics: PlanWorkspaceMetric[];
  queue: PlanWorkspaceQueueItem[];
  personas: PlanWorkspacePersona[];
}

const clientUser: PlanWorkspacePersona = {
  id: "client-user",
  label: "Client User",
  perspective: "Daily participant",
  summary: "A simplified view for assigned work, documents, messages, findings, and approvals marked client-visible.",
  primaryActions: ["Complete assigned tasks", "Upload requested evidence", "Review client-visible reports"],
  visibleAreas: ["Dashboard", "Projects", "Assigned tasks", "Documents", "Messages", "Support"],
  restrictedAreas: ["Internal notes", "Staff workload", "Agent configuration", "Other organizations"],
};

const clientAdmin: PlanWorkspacePersona = {
  id: "client-admin",
  label: "Client Administrator",
  perspective: "Organization administrator",
  summary: "Organization-scoped administration for users, approvals, services, reports, and client-visible risk activity.",
  primaryActions: ["Manage organization users", "Review approvals", "Track remediation commitments"],
  visibleAreas: ["Organization overview", "Users", "Services", "Projects", "Reports", "Approvals"],
  restrictedAreas: ["GEM internal notes", "Platform administration", "Hidden evidence", "Other organizations"],
};

const projectManager: PlanWorkspacePersona = {
  id: "project-manager",
  label: "Project Manager",
  perspective: "Delivery operations",
  summary: "A controlled delivery view for milestones, dependencies, approvals, risks, deliverables, and client review.",
  primaryActions: ["Coordinate milestones", "Assign delivery work", "Prepare client review"],
  visibleAreas: ["Projects", "Tasks", "Milestones", "Dependencies", "Approvals", "Deliverables"],
  restrictedAreas: ["Permission administration", "Billing commitments", "Cross-tenant exports", "System secrets"],
};

const complianceReviewer: PlanWorkspacePersona = {
  id: "compliance-reviewer",
  label: "Compliance Reviewer",
  perspective: "Independent review",
  summary: "A review-focused experience for frameworks, controls, evidence, exceptions, and human determinations.",
  primaryActions: ["Review control evidence", "Record effectiveness", "Escalate remediation gaps"],
  visibleAreas: ["Frameworks", "Controls", "Evidence", "Exceptions", "Calendar", "Reports"],
  restrictedAreas: ["AI-only certification", "Unapproved deletion", "Financial commitments", "Credential changes"],
};

const platformOwner: PlanWorkspacePersona = {
  id: "platform-owner",
  label: "Platform Owner",
  perspective: "Enterprise oversight",
  summary: "The complete governance view for organizations, operations, approvals, integrations, agents, audit, and health.",
  primaryActions: ["Review enterprise posture", "Inspect approval queues", "Coordinate platform operations"],
  visibleAreas: ["Command Center", "All modules", "Audit logs", "System status", "Integrations", "Administration"],
  restrictedAreas: ["Autonomous high-impact execution", "Unapproved production changes", "Secret values in browser"],
};

export const planWorkspaceCatalog: PlanWorkspaceDefinition[] = [
  {
    id: "basic",
    name: "Basic",
    audience: "Small teams beginning controlled client operations",
    summary: "Core client service workspace for projects, tasks, documents, messages, reports, and support.",
    commercialStatus: "Preview configuration — billing and activation remain disabled",
    accent: "cyan",
    modules: ["Client dashboard", "Projects", "Tasks", "Documents", "Messages", "Reports", "Support"],
    limits: ["Single organization template", "Core reporting", "Manual approvals", "Standard support routing"],
    metrics: [
      { label: "Active projects", value: "3", context: "Preview workload", tone: "cyan" },
      { label: "Client actions", value: "5", context: "Two due this week", tone: "amber" },
      { label: "Documents", value: "18", context: "Three awaiting review", tone: "violet" },
      { label: "Service health", value: "Good", context: "Template status", tone: "emerald" },
    ],
    queue: [
      { id: "BAS-101", title: "Approve onboarding scope", area: "Projects", status: "Needs review", owner: "Client Admin" },
      { id: "BAS-102", title: "Upload network inventory", area: "Documents", status: "Waiting", owner: "Client User" },
      { id: "BAS-103", title: "Review monthly service report", area: "Reports", status: "Ready", owner: "Client Admin" },
    ],
    personas: [clientAdmin, clientUser],
  },
  {
    id: "professional",
    name: "Professional",
    audience: "Growing organizations coordinating delivery, security, and compliance",
    summary: "Expanded operations with security findings, control evidence, incidents, campaigns, and managed project delivery.",
    commercialStatus: "Preview configuration — pricing and entitlements require owner approval",
    accent: "emerald",
    modules: ["Everything in Basic", "Security findings", "Compliance controls", "Evidence", "Incidents", "Marketing", "Analytics"],
    limits: ["Multiple project templates", "Role-aware review queues", "Scheduled reports", "Human-reviewed AI drafts"],
    metrics: [
      { label: "Security findings", value: "12", context: "Three high priority", tone: "amber" },
      { label: "Control readiness", value: "78%", context: "Preview framework", tone: "emerald" },
      { label: "Open projects", value: "7", context: "One at risk", tone: "cyan" },
      { label: "Pending approvals", value: "6", context: "Human action required", tone: "violet" },
    ],
    queue: [
      { id: "PRO-201", title: "Validate remediation evidence", area: "Security", status: "Needs review", owner: "Compliance Reviewer" },
      { id: "PRO-202", title: "Approve assessment milestone", area: "Projects", status: "Ready", owner: "Project Manager" },
      { id: "PRO-203", title: "Confirm policy review date", area: "Compliance", status: "Waiting", owner: "Client Admin" },
      { id: "PRO-204", title: "Review campaign content draft", area: "Marketing", status: "Draft", owner: "Project Manager" },
    ],
    personas: [clientAdmin, clientUser, projectManager, complianceReviewer],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    audience: "Multi-team organizations requiring governance and operational oversight",
    summary: "Complete command center across clients, delivery, security, compliance, content, agents, integrations, audit, and system health.",
    commercialStatus: "Preview configuration — contract, deployment, and service commitments are not active",
    accent: "violet",
    modules: ["Everything in Professional", "Multi-organization command", "AI Agent Center", "Integrations", "Audit governance", "System status"],
    limits: ["Organization-scoped access", "Advanced approval policy", "Saved analytics views", "Controlled automation workflows"],
    metrics: [
      { label: "Organizations", value: "4", context: "Preview portfolio", tone: "cyan" },
      { label: "Risk posture", value: "82", context: "Template health score", tone: "emerald" },
      { label: "Agent reviews", value: "9", context: "Execution remains blocked", tone: "violet" },
      { label: "System exceptions", value: "2", context: "Owner attention", tone: "amber" },
    ],
    queue: [
      { id: "ENT-301", title: "Review production deployment request", area: "Approvals", status: "Needs review", owner: "Platform Owner" },
      { id: "ENT-302", title: "Investigate degraded integration", area: "Integrations", status: "Waiting", owner: "Platform Owner" },
      { id: "ENT-303", title: "Approve executive report delivery", area: "Reports", status: "Ready", owner: "Compliance Reviewer" },
      { id: "ENT-304", title: "Review agent recommendation", area: "AI Agents", status: "Draft", owner: "Platform Owner" },
    ],
    personas: [platformOwner, clientAdmin, projectManager, complianceReviewer, clientUser],
  },
];

export function getPlanWorkspace(planId: string): PlanWorkspaceDefinition | undefined {
  return planWorkspaceCatalog.find((plan) => plan.id === planId);
}
