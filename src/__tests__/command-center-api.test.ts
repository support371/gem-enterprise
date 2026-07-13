import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routeSource = readFileSync("src/app/api/command-center/snapshot/route.ts", "utf8");
const exportRouteSource = readFileSync("src/app/api/command-center/export/route.ts", "utf8");
const snapshotSource = readFileSync("src/lib/commandCenterSnapshot.ts", "utf8");
const snapshotServiceSource = readFileSync("src/lib/commandCenterSnapshotService.ts", "utf8");
const exportSource = readFileSync("src/lib/commandCenterExport.ts", "utf8");
const operatingRepositorySource = readFileSync("src/lib/commandCenterOperatingLayer.ts", "utf8");
const operatingProposalSource = readFileSync(
  "prisma/proposals/20260713_command_center_operating_layer.sql",
  "utf8",
);
const proposalReadmeSource = readFileSync("prisma/proposals/README.md", "utf8");

describe("command-center live snapshot API", () => {
  it("requires an active staff session before querying or exporting cross-organization aggregates", () => {
    expect(routeSource).toContain("requireStaff()");
    expect(routeSource).toContain("if (!gate.ok) return gate.response");
    expect(exportRouteSource).toContain("requireStaff()");
    expect(exportRouteSource).toContain("if (!gate.ok) return gate.response");
  });

  it("prevents authenticated aggregate responses and exports from being cached", () => {
    expect(routeSource).toContain('"Cache-Control": "no-store, max-age=0"');
    expect(routeSource).toContain('export const dynamic = "force-dynamic"');
    expect(exportRouteSource).toContain('"Cache-Control": "no-store, max-age=0"');
    expect(exportRouteSource).toContain('export const dynamic = "force-dynamic"');
  });

  it("returns counts only for approved operating records through the shared service", () => {
    expect(routeSource).toContain("buildCommandCenterSnapshot()");
    expect(exportRouteSource).toContain("buildCommandCenterSnapshot()");
    expect(snapshotServiceSource).toContain("db.user.count");
    expect(snapshotServiceSource).toContain("db.product.count");
    expect(snapshotServiceSource).toContain("db.entitlement.count");
    expect(snapshotServiceSource).toContain("db.supportTicket.count");
    expect(snapshotServiceSource).toContain("db.serviceRequest.count");
    expect(snapshotServiceSource).toContain("db.auditLog.count");
    expect(snapshotServiceSource).toContain("getCommandCenterOperatingLayerSnapshot");

    expect(snapshotSource).not.toContain("email");
    expect(snapshotSource).not.toContain("phone");
    expect(snapshotSource).not.toContain("document");
    expect(snapshotSource).not.toContain("password");
  });

  it("fails closed to a disclosed unavailable state when Prisma queries fail", () => {
    expect(snapshotServiceSource).toContain('source: "unavailable"');
    expect(snapshotServiceSource).toContain("metrics: null");
    expect(snapshotServiceSource).toContain("interface remains in disclosed demo mode");
  });

  it("detects operating tables before running aggregate queries", () => {
    expect(operatingRepositorySource).toContain("to_regclass('public.enterprise_subscriptions')");
    expect(operatingRepositorySource).toContain('source: "migration_required"');
    expect(operatingRepositorySource).toContain("missingTables");
    expect(snapshotSource).toContain("operatingLayer: CommandCenterOperatingLayerSnapshot");
  });

  it("keeps the runtime operating repository read-only", () => {
    const normalizedRepository = operatingRepositorySource.toUpperCase();
    const forbiddenWrites = ["INSERT INTO", "UPDATE ENTERPRISE_", "DELETE FROM", "DROP TABLE", "ALTER TABLE"];
    for (const statement of forbiddenWrites) {
      expect(normalizedRepository).not.toContain(statement);
    }
    expect(operatingRepositorySource).toContain("db.$queryRaw");
    expect(operatingRepositorySource).not.toContain("$executeRaw");
    expect(operatingRepositorySource).not.toContain("$queryRawUnsafe");
  });

  it("stores the schema change as a reviewed non-auto-applied proposal", () => {
    expect(operatingProposalSource).toContain("BEGIN;");
    expect(operatingProposalSource).toContain("COMMIT;");
    expect(operatingProposalSource).toContain("CREATE TABLE IF NOT EXISTS enterprise_subscriptions");
    expect(operatingProposalSource).toContain("CREATE TABLE IF NOT EXISTS enterprise_security_incidents");
    expect(operatingProposalSource).toContain("CREATE TABLE IF NOT EXISTS enterprise_compliance_controls");
    expect(operatingProposalSource).toContain("CREATE TABLE IF NOT EXISTS enterprise_agents");
    expect(operatingProposalSource).toContain("CREATE TABLE IF NOT EXISTS enterprise_integrations");
    expect(proposalReadmeSource).toContain("not automatic migrations");
    expect(proposalReadmeSource).toContain("explicit production approval");
  });

  it("does not propose storage for API secrets or payment credentials", () => {
    const normalized = operatingProposalSource.toLowerCase();
    expect(normalized).not.toContain("api_secret");
    expect(normalized).not.toContain("client_secret");
    expect(normalized).not.toContain("access_token");
    expect(normalized).not.toContain("refresh_token");
    expect(normalized).not.toContain("card_number");
    expect(normalized).not.toContain("bank_account");
  });

  it("exports aggregate-only CSV and JSON downloads", () => {
    expect(exportRouteSource).toContain('z.enum(["csv", "json"])');
    expect(exportRouteSource).toContain('"Content-Disposition"');
    expect(exportRouteSource).toContain('"Content-Type": "text/csv; charset=utf-8"');
    expect(exportRouteSource).toContain("commandCenterSnapshotToCsv(snapshot)");
    expect(exportSource).toContain("commandCenterSnapshotLabels");
    expect(exportSource).toContain("commandCenterOperatingMetricLabels");
    expect(exportSource).toContain("replaceAll");
    expect(exportSource).toContain('"platform"');
    expect(exportSource).toContain('"operating_layer"');

    const normalizedExport = exportSource.toLowerCase();
    expect(normalizedExport).not.toContain("email");
    expect(normalizedExport).not.toContain("phone");
    expect(normalizedExport).not.toContain("password");
    expect(normalizedExport).not.toContain("access_token");
  });
});
