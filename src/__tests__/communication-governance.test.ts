import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("communication governance", () => {
  it("stores permission state and immutable preference events without destructive migration steps", () => {
    const migration = source("prisma/migrations/20260913170000_communication_governance/migration.sql");

    expect(migration).toContain('CREATE TABLE "communication_preferences"');
    expect(migration).toContain('CREATE TABLE "communication_preference_events"');
    expect(migration).toContain("'PENDING', 'ALLOWED', 'BLOCKED'");
    expect(migration).toContain('ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('REVOKE ALL');
    expect(migration).not.toMatch(/DROP\s+(TABLE|COLUMN|TYPE)/i);
  });

  it("persists preference state and its immutable event in one database transaction", () => {
    const governance = source("src/lib/communications/governance.ts");
    const setter = governance.slice(
      governance.indexOf("export async function setCommunicationPreference"),
      governance.indexOf("function unsubscribeSecret"),
    );

    expect(setter).toContain("db.$transaction(async (tx) =>");
    expect(setter).toContain("tx.$queryRaw");
    expect(setter).toContain("tx.$executeRaw");
    expect(setter).toContain('INSERT INTO "communication_preferences"');
    expect(setter).toContain('INSERT INTO "communication_preference_events"');
  });

  it("requires explicit governed recipients, SMTP preflight, and an atomic delivery claim", () => {
    const route = source("src/app/api/admin/campaigns/[id]/send/route.ts");

    expect(route).toContain('COMMUNICATION_GOVERNANCE_ENABLED !== "true"');
    expect(route).toContain("listAllowedMarketingEmails");
    expect(route).toContain("transporter.verify()");
    expect(route).toContain("NO_GOVERNED_RECIPIENTS");
    expect(route).toContain("SMTP_NOT_CONFIGURED");
    expect(route).toContain("db.emailCampaign.updateMany");
    expect(route).toContain('status: { in: ["DRAFT", "SCHEDULED"] }');
    expect(route).toContain("CAMPAIGN_DELIVERY_NOT_CLAIMED");
    expect(route).not.toContain("sentCount = users.length");
  });

  it("does not make uncertain partial deliveries automatically retryable", () => {
    const route = source("src/app/api/admin/campaigns/[id]/send/route.ts");

    expect(route).toContain("markedSending && sentCount === 0");
    expect(route).toContain("markedSending && sentCount > 0");
    expect(route).toContain("campaign_delivery_reconciliation_required");
    expect(route).toContain("CAMPAIGN_DELIVERY_RECONCILIATION_REQUIRED");
    expect(route).toContain("campaign remains SENDING");
  });

  it("adds signed unsubscribe controls to every governed marketing recipient", () => {
    const route = source("src/app/api/admin/campaigns/[id]/send/route.ts");
    const governance = source("src/lib/communications/governance.ts");
    const unsubscribe = source("src/app/api/communications/unsubscribe/route.ts");

    expect(governance).toContain("COMMUNICATION_UNSUBSCRIBE_SECRET");
    expect(governance).toContain('createHmac("sha256"');
    expect(route).toContain('"List-Unsubscribe"');
    expect(route).toContain('"List-Unsubscribe-Post"');
    expect(unsubscribe).toContain('status: "BLOCKED"');
    expect(unsubscribe).toContain('eventType: "UNSUBSCRIBED"');
  });

  it("keeps marketing permission grants behind admin review and durable evidence", () => {
    const route = source("src/app/api/admin/communications/preferences/route.ts");

    expect(route).toContain("requireAdmin");
    expect(route).toContain('value.status === "ALLOWED" && !value.basis');
    expect(route).toContain('value.status === "ALLOWED" && !value.evidenceRef');
    expect(route).toContain('value.basis === "TRANSACTIONAL_NECESSITY"');
    expect(route).toContain("emitAuditLog");
  });
});
