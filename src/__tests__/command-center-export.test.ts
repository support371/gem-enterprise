import { describe, expect, it } from "vitest";
import {
  commandCenterExportFilename,
  commandCenterSnapshotToCsv,
} from "@/lib/commandCenterExport";
import type { CommandCenterSnapshot } from "@/lib/commandCenterSnapshot";

const generatedAt = "2026-07-13T01:45:30.123Z";

const snapshot: CommandCenterSnapshot = {
  source: "database",
  generatedAt,
  metrics: {
    activeUsers: 12,
    organizations: 3,
    activeProducts: 8,
    activeEntitlements: 27,
    openSupportTickets: 2,
    openServiceRequests: 4,
    auditEventsLast24Hours: 19,
  },
  operatingLayer: {
    source: "migration_required",
    metrics: null,
    missingTables: ["enterprise_subscriptions", "enterprise_usage_records"],
    message: 'Owner "approval" is required before migration.',
  },
};

describe("command-center aggregate export", () => {
  it("serializes platform metrics and operating readiness as CSV rows", () => {
    const csv = commandCenterSnapshotToCsv(snapshot);

    expect(csv).toContain('"section","metric","value","source","generated_at"');
    expect(csv).toContain('"platform","Active users","12","database"');
    expect(csv).toContain('"operating_layer","readiness_status"');
    expect(csv).toContain('Owner ""approval"" is required before migration.');
    expect(csv).toContain('"operating_layer","missing_table_count","2","migration_required"');
    expect(csv.endsWith("\r\n")).toBe(true);
  });

  it("creates filesystem-safe CSV and JSON filenames", () => {
    const csvName = commandCenterExportFilename("csv", generatedAt);
    const jsonName = commandCenterExportFilename("json", generatedAt);

    expect(csvName).toBe("gem-command-center-2026-07-13T01-45-30-123Z.csv");
    expect(jsonName).toBe("gem-command-center-2026-07-13T01-45-30-123Z.json");
    expect(csvName).not.toMatch(/[/:]/);
    expect(jsonName).not.toMatch(/[/:]/);
  });
});
