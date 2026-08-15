export const projectEnvironmentIds = [
  "overview",
  "production",
  "development",
  "marketing",
  "sales",
  "finance",
  "team",
  "client",
  "services",
  "tools",
  "monitoring",
  "admin",
] as const;

export type ProjectEnvironmentId = (typeof projectEnvironmentIds)[number];

export interface ProjectEnvironment {
  id: ProjectEnvironmentId;
  label: string;
  description: string;
  audience: string;
  permission?: { action: string; scope: string };
  destinations: Array<{ label: string; description: string; href: string }>;
}

export const projectEnvironments: ProjectEnvironment[] = [
  { id: "overview", label: "Project home", description: "The project control surface for status, priorities, environments, and recent work.", audience: "Every assigned member", destinations: [] },
  { id: "production", label: "Production", description: "Plan delivery, manage content and video, track approvals, and move work toward release.", audience: "Delivery and production teams", destinations: [
    { label: "Video production", description: "Create, preview, and review governed project video.", href: "/app/social-media/video" },
    { label: "Content operations", description: "Prepare project content and publishing work.", href: "/app/social-media/content" },
    { label: "Approvals", description: "Review controlled publishing decisions.", href: "/app/social-media/approvals" },
  ] },
  { id: "development", label: "Development", description: "Coordinate technical delivery, APIs, integrations, testing, documentation, and release readiness for this project.", audience: "Engineering and technical delivery", destinations: [
    { label: "Developer center", description: "Open project API and integration documentation.", href: "/developers" },
    { label: "API explorer", description: "Inspect supported platform operations and contracts.", href: "/api-explorer" },
    { label: "Technical documentation", description: "Review architecture, authentication, errors, and guides.", href: "/docs" },
    { label: "Integration readiness", description: "Review connected project services and tool health.", href: "/app/command-center/integrations" },
  ] },
  { id: "marketing", label: "Marketing", description: "Run project campaigns, social distribution, news, and audience engagement separately from production.", audience: "Marketing and communications", destinations: [
    { label: "Social media suite", description: "Manage connected channels and governed content.", href: "/app/social-media" },
    { label: "Publishing calendar", description: "Coordinate campaign and content schedules.", href: "/app/social-media/calendar" },
    { label: "News intelligence", description: "Use current intelligence in project communications.", href: "/intel/news" },
  ] },
  { id: "sales", label: "Sales", description: "Keep opportunities, client requests, service conversations, and commercial follow-through together.", audience: "Sales and client success", destinations: [
    { label: "Service requests", description: "Track project-scoped needs and delivery requests.", href: "/app/requests" },
    { label: "Services", description: "Review services available to the project.", href: "/app/services" },
    { label: "Messages", description: "Continue secure client conversations.", href: "/app/messages" },
  ] },
  { id: "finance", label: "Finance", description: "Coordinate project budgets, approved products, allocations, financial-security controls, documents, and reporting.", audience: "Finance leads and authorized owners", destinations: [
    { label: "Portfolio", description: "Review authorized project portfolio information.", href: "/app/portfolios" },
    { label: "Financial-security services", description: "Open controlled financial-security capabilities.", href: "/app/products/financial" },
    { label: "Documents", description: "Review approved financial and project records.", href: "/app/documents" },
    { label: "Requests", description: "Submit finance-related project requests for review.", href: "/app/requests" },
  ] },
  { id: "team", label: "Team", description: "Coordinate members, meetings, responsibilities, and weekly project reporting.", audience: "Assigned project team", destinations: [
    { label: "Meetings", description: "Schedule project consultations and reviews.", href: "/app/meetings" },
    { label: "Messages", description: "Open secure team conversations.", href: "/app/messages" },
    { label: "Documents", description: "Use the controlled document workspace.", href: "/app/documents" },
  ] },
  { id: "client", label: "Client view", description: "A clear client-facing view of progress, decisions, deliverables, and requests without internal administration noise.", audience: "Client owners and approved client members", destinations: [
    { label: "Project requests", description: "Submit and follow project requests.", href: "/app/requests" },
    { label: "Documents", description: "Review approved project documents.", href: "/app/documents" },
    { label: "Support", description: "Reach AI-assisted and human support.", href: "/app/support" },
  ] },
  { id: "services", label: "Services", description: "Open the cybersecurity, financial-security, property-risk, and professional services assigned to this project.", audience: "Authorized project members", destinations: [
    { label: "Service catalog", description: "Review available and activated services.", href: "/app/services" },
    { label: "Products", description: "Review controlled product access.", href: "/app/products" },
    { label: "Compliance", description: "Open disclosures and compliance workflow.", href: "/app/compliance" },
  ] },
  { id: "tools", label: "Tools & integrations", description: "Reach project tools and connected services from one controlled environment.", audience: "Authorized operators", destinations: [
    { label: "Social accounts", description: "Review connected publishing accounts.", href: "/app/social-media/accounts" },
    { label: "Analytics", description: "Review project channel performance.", href: "/app/social-media/analytics" },
    { label: "Support tools", description: "Open assistance and escalation channels.", href: "/app/support" },
  ] },
  { id: "monitoring", label: "Monitoring", description: "Follow project activity, notifications, intelligence, delivery signals, and readiness.", audience: "Owners and delivery leads", destinations: [
    { label: "Notifications", description: "Review project and account alerts.", href: "/app/notifications" },
    { label: "Intelligence", description: "Open cross-domain monitoring and trends.", href: "/intel" },
    { label: "Analytics", description: "Review channel and content performance.", href: "/app/social-media/analytics" },
  ] },
  { id: "admin", label: "Project administration", description: "Manage project membership, workspace controls, reporting, and governed configuration.", audience: "Workspace owners and authorized managers", permission: { action: "manage", scope: "projects" }, destinations: [
    { label: "Workspace administration", description: "Return to member, project, and reporting controls.", href: "/app/workspace" },
    { label: "Security", description: "Review account security controls.", href: "/app/security" },
    { label: "Settings", description: "Review account and workspace preferences.", href: "/app/settings" },
  ] },
];

export function isProjectEnvironment(value: string): value is ProjectEnvironmentId {
  return projectEnvironmentIds.includes(value as ProjectEnvironmentId);
}

export function canOpenProjectEnvironment(
  environment: ProjectEnvironment,
  permissions: Array<{ action: string; scope: string }>,
) {
  return !environment.permission || permissions.some((permission) =>
    permission.action === environment.permission?.action && permission.scope === environment.permission.scope,
  );
}
