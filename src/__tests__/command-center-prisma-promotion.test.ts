import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const promotionScript = readFileSync(
  join(root, "scripts/apply-command-center-prisma-models.mjs"),
  "utf8",
);
const migration = readFileSync(
  join(
    root,
    "prisma/migrations/20260713032500_command_center_operating_models/migration.sql",
  ),
  "utf8",
);
const rollback = readFileSync(
  join(
    root,
    "prisma/migrations/20260713032500_command_center_operating_models/rollback.sql",
  ),
  "utf8",
);
const operatingLayer = readFileSync(
  join(root, "src/lib/commandCenterOperatingLayer.ts"),
  "utf8",
);

const expectedTables = [
  "enterprise_subscriptions",
  "enterprise_usage_records",
  "enterprise_security_assets",
  "enterprise_security_incidents",
  "enterprise_compliance_frameworks",
  "enterprise_compliance_controls",
  "enterprise_compliance_evidence",
  "enterprise_compliance_tasks",
  "enterprise_risks",
  "enterprise_agents",
  "enterprise_agent_runs",
  "enterprise_integration_health",
] as const;

describe("command-center Prisma operating-model promotion", () => {
  it("keeps every promoted table synchronized across schema generation, migration, and rollback", () => {
    for (const table of expectedTables) {
      expect(promotionScript).toContain(`@@map(\"${table}\")`);
      expect(migration).toMatch(new RegExp(`CREATE TABLE \\\"${table}\\\"`, "i"));
      expect(rollback).toMatch(new RegExp(`DROP TABLE IF EXISTS \\\"${table}\\\"`, "i"));
    }
  });

  it("keeps the operating-layer readiness query on the installed table contract", () => {
    const readinessTables = [
      "enterprise_subscriptions",
      "enterprise_usage_records",
      "enterprise_security_incidents",
      "enterprise_compliance_controls",
      "enterprise_agents",
      "enterprise_integration_health",
    ];

    for (const table of readinessTables) {
      expect(operatingLayer).toContain(table);
    }

    expect(operatingLayer).not.toContain("enterprise_integrations");
    expect(operatingLayer).not.toContain("period_start");
    expect(operatingLayer).not.toContain("period_end");
  });

  it("uses the promoted enum values and accepted usage records in aggregate queries", () => {
    expect(operatingLayer).toContain("'TRIALING', 'ACTIVE', 'PAST_DUE'");
    expect(operatingLayer).toContain("status = 'ACCEPTED'");
    expect(operatingLayer).toContain("severity = 'CRITICAL'");
    expect(operatingLayer).toContain("status = 'ACTIVE'");
    expect(operatingLayer).toContain("status = 'HEALTHY'");
  });

  it("does not introduce credential or payment-instrument storage fields", () => {
    const prohibitedFields = [
      "accessToken",
      "refreshToken",
      "clientSecret",
      "cardNumber",
      "bankAccountNumber",
      "routingNumber",
      "privateKey",
    ];

    for (const field of prohibitedFields) {
      expect(promotionScript).not.toContain(field);
      expect(migration).not.toContain(field);
    }

    expect(promotionScript).toContain("safeMetadata");
    expect(promotionScript).toContain("storageRef");
  });

  it("keeps migration and rollback explicitly non-automatic", () => {
    expect(migration).toContain("DO NOT APPLY TO PRODUCTION AUTOMATICALLY");
    expect(rollback).toContain("DISPOSABLE ENVIRONMENT ONLY");
    expect(rollback).toContain("DROP TYPE IF EXISTS");
  });
});
