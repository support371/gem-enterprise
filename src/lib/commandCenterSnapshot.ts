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
