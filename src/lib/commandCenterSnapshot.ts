import type { CommandCenterOperatingLayerSnapshot } from "@/lib/commandCenterOperatingLayer";

export interface CommandCenterSnapshotMetrics {
  activeUsers: number;
  organizations: number;
  activeProducts: number;
  activeEntitlements: number;
  openSupportTickets: number;
  openServiceRequests: number;
  auditEventsLast24Hours: number;
}

export interface CommandCenterSnapshot {
  source: "database" | "unavailable";
  generatedAt: string;
  metrics: CommandCenterSnapshotMetrics | null;
  operatingLayer: CommandCenterOperatingLayerSnapshot;
  message?: string;
}

export const commandCenterSnapshotLabels: Array<{
  key: keyof CommandCenterSnapshotMetrics;
  label: string;
  detail: string;
}> = [
  { key: "activeUsers", label: "Active users", detail: "Enabled user accounts" },
  { key: "organizations", label: "Organizations", detail: "Distinct assigned organization IDs" },
  { key: "activeProducts", label: "Active products", detail: "Enabled catalog products" },
  { key: "activeEntitlements", label: "Entitlements", detail: "Active user entitlements" },
  { key: "openSupportTickets", label: "Support queue", detail: "Tickets not resolved or closed" },
  { key: "openServiceRequests", label: "Service requests", detail: "Requests not completed or cancelled" },
  { key: "auditEventsLast24Hours", label: "Audit events", detail: "Events recorded during the last 24 hours" },
];

export const commandCenterOperatingMetricLabels = [
  { key: "activeSubscriptions", label: "Subscriptions", detail: "Trialing, active, or past-due plans" },
  { key: "meteredUsageCurrentPeriod", label: "Metered usage", detail: "Recorded units in the current month" },
  { key: "openSecurityIncidents", label: "Open incidents", detail: "Open, investigating, or contained" },
  { key: "criticalSecurityIncidents", label: "Critical incidents", detail: "Unresolved critical-severity incidents" },
  { key: "complianceControlsReady", label: "Controls ready", detail: "Compliance controls marked ready" },
  { key: "complianceControlsDue", label: "Controls due", detail: "Incomplete controls due within 30 days" },
  { key: "activeAgents", label: "Active agents", detail: "Governed agents ready or running" },
  { key: "pendingApprovals", label: "Approvals", detail: "Actions awaiting human approval" },
  { key: "connectedIntegrations", label: "Connected", detail: "Verified connected integrations" },
  { key: "degradedIntegrations", label: "Integration alerts", detail: "Degraded, blocked, or reauthorization required" },
] as const;
