import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const requiredCommandCenterOperatingTables = [
  "enterprise_subscriptions",
  "enterprise_usage_records",
  "enterprise_security_incidents",
  "enterprise_compliance_controls",
  "enterprise_agents",
  "enterprise_integrations",
] as const;

export interface CommandCenterOperatingMetrics {
  activeSubscriptions: number;
  meteredUsageCurrentPeriod: number;
  openSecurityIncidents: number;
  criticalSecurityIncidents: number;
  complianceControlsReady: number;
  complianceControlsDue: number;
  activeAgents: number;
  pendingApprovals: number;
  connectedIntegrations: number;
  degradedIntegrations: number;
}

export interface CommandCenterOperatingLayerSnapshot {
  source: "database" | "migration_required" | "unavailable";
  metrics: CommandCenterOperatingMetrics | null;
  missingTables?: string[];
  message?: string;
}

type ReadinessRow = {
  subscriptions: string | null;
  usageRecords: string | null;
  securityIncidents: string | null;
  complianceControls: string | null;
  agents: string | null;
  integrations: string | null;
};

type MetricsRow = {
  activeSubscriptions: number | bigint;
  meteredUsageCurrentPeriod: number | bigint | Prisma.Decimal;
  openSecurityIncidents: number | bigint;
  criticalSecurityIncidents: number | bigint;
  complianceControlsReady: number | bigint;
  complianceControlsDue: number | bigint;
  activeAgents: number | bigint;
  pendingApprovals: number | bigint;
  connectedIntegrations: number | bigint;
  degradedIntegrations: number | bigint;
};

function numeric(value: number | bigint | Prisma.Decimal): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "bigint") return Number(value);
  return value.toNumber();
}

export async function getCommandCenterOperatingLayerSnapshot(): Promise<CommandCenterOperatingLayerSnapshot> {
  try {
    const [readiness] = await db.$queryRaw<ReadinessRow[]>(Prisma.sql`
      SELECT
        to_regclass('public.enterprise_subscriptions')::text AS "subscriptions",
        to_regclass('public.enterprise_usage_records')::text AS "usageRecords",
        to_regclass('public.enterprise_security_incidents')::text AS "securityIncidents",
        to_regclass('public.enterprise_compliance_controls')::text AS "complianceControls",
        to_regclass('public.enterprise_agents')::text AS "agents",
        to_regclass('public.enterprise_integrations')::text AS "integrations"
    `);

    const tableState: Record<(typeof requiredCommandCenterOperatingTables)[number], string | null> = {
      enterprise_subscriptions: readiness?.subscriptions ?? null,
      enterprise_usage_records: readiness?.usageRecords ?? null,
      enterprise_security_incidents: readiness?.securityIncidents ?? null,
      enterprise_compliance_controls: readiness?.complianceControls ?? null,
      enterprise_agents: readiness?.agents ?? null,
      enterprise_integrations: readiness?.integrations ?? null,
    };

    const missingTables = requiredCommandCenterOperatingTables.filter((table) => !tableState[table]);
    if (missingTables.length > 0) {
      return {
        source: "migration_required",
        metrics: null,
        missingTables: [...missingTables],
        message:
          "The persistent command-center operating layer has not been installed. The reviewed SQL remains a non-auto-applied proposal until schema and production approval are complete.",
      };
    }

    const [row] = await db.$queryRaw<MetricsRow[]>(Prisma.sql`
      SELECT
        (
          SELECT COUNT(*)::int
          FROM enterprise_subscriptions
          WHERE status IN ('trialing', 'active', 'past_due')
        ) AS "activeSubscriptions",
        COALESCE((
          SELECT SUM(quantity)::double precision
          FROM enterprise_usage_records
          WHERE period_end > date_trunc('month', NOW())
            AND period_start < date_trunc('month', NOW()) + INTERVAL '1 month'
        ), 0::double precision) AS "meteredUsageCurrentPeriod",
        (
          SELECT COUNT(*)::int
          FROM enterprise_security_incidents
          WHERE status IN ('open', 'investigating', 'contained')
        ) AS "openSecurityIncidents",
        (
          SELECT COUNT(*)::int
          FROM enterprise_security_incidents
          WHERE severity = 'critical'
            AND status IN ('open', 'investigating', 'contained')
        ) AS "criticalSecurityIncidents",
        (
          SELECT COUNT(*)::int
          FROM enterprise_compliance_controls
          WHERE status = 'ready'
        ) AS "complianceControlsReady",
        (
          SELECT COUNT(*)::int
          FROM enterprise_compliance_controls
          WHERE due_at IS NOT NULL
            AND due_at <= NOW() + INTERVAL '30 days'
            AND status NOT IN ('ready', 'not_applicable')
        ) AS "complianceControlsDue",
        (
          SELECT COUNT(*)::int
          FROM enterprise_agents
          WHERE status IN ('ready', 'running')
        ) AS "activeAgents",
        (
          SELECT COUNT(*)::int
          FROM tokmetric_approval_requests
          WHERE state = 'APPROVAL_REQUIRED'
        ) AS "pendingApprovals",
        (
          SELECT COUNT(*)::int
          FROM enterprise_integrations
          WHERE state = 'connected'
        ) AS "connectedIntegrations",
        (
          SELECT COUNT(*)::int
          FROM enterprise_integrations
          WHERE state IN ('degraded', 'reauthorization_required', 'blocked')
        ) AS "degradedIntegrations"
    `);

    if (!row) {
      return {
        source: "unavailable",
        metrics: null,
        message: "The command-center operating query returned no aggregate row.",
      };
    }

    return {
      source: "database",
      metrics: {
        activeSubscriptions: numeric(row.activeSubscriptions),
        meteredUsageCurrentPeriod: numeric(row.meteredUsageCurrentPeriod),
        openSecurityIncidents: numeric(row.openSecurityIncidents),
        criticalSecurityIncidents: numeric(row.criticalSecurityIncidents),
        complianceControlsReady: numeric(row.complianceControlsReady),
        complianceControlsDue: numeric(row.complianceControlsDue),
        activeAgents: numeric(row.activeAgents),
        pendingApprovals: numeric(row.pendingApprovals),
        connectedIntegrations: numeric(row.connectedIntegrations),
        degradedIntegrations: numeric(row.degradedIntegrations),
      },
    };
  } catch (error) {
    console.error("[command-center] operating layer unavailable", error);
    return {
      source: "unavailable",
      metrics: null,
      message: "The command-center operating layer could not be queried safely.",
    };
  }
}
