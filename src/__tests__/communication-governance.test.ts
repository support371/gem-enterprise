import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("communication governance", () => {
  it("stores permission state and database-enforced append-only preference events", () => {
    const migration = source("prisma/migrations/20260913170000_communication_governance/migration.sql");

    expect(migration).toContain('CREATE TABLE "communication_preferences"');
    expect(migration).toContain('CREATE TABLE "communication_preference_events"');
    expect(migration).toContain("'PENDING', 'ALLOWED', 'BLOCKED'");
    expect(migration).toContain('ON DELETE RESTRICT');
    expect(migration).toContain('prevent_communication_preference_event_mutation');
    expect(migration).toContain('BEFORE UPDATE OR DELETE ON "communication_preference_events"');
    expect(migration).toContain('ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('REVOKE ALL');
    expect(migration).not.toMatch(/DROP\s+(TABLE|COLUMN|TYPE)/i);
  });

  it("keeps migration index names aligned with the promoted Prisma schema", () => {
    const migration = source("prisma/migrations/20260913170000_communication_governance/migration.sql");
    const promotion = source("scripts/apply-communication-governance-prisma.mjs");

    for (const name of [
      "communication_preferences_channel_destination_purpose_key",
      "communication_preferences_status_purpose_idx",
      "communication_preferences_userId_idx",
      "communication_preference_events_preferenceId_createdAt_idx",
    ]) {
      expect(migration).toContain(name);
      expect(promotion).toContain(`map: \"${name}\"`);
    }
    expect(promotion).toContain("onDelete: Restrict");
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

  it("preserves reviewed permission basis and evidence when an unsubscribe blocks future delivery", () => {
    const governance = source("src/lib/communications/governance.ts");

    expect(governance).toContain('"basis" = COALESCE(EXCLUDED."basis", "communication_preferences"."basis")');
    expect(governance).toContain('"evidenceRef" = COALESCE(EXCLUDED."evidenceRef", "communication_preferences"."evidenceRef")');
  });

  it("requires explicit governed recipients, SMTP preflight, an atomic claim, and a permission recheck before each send", () => {
    const route = source("src/app/api/admin/campaigns/[id]/send/route.ts");
    const governance = source("src/lib/communications/governance.ts");

    expect(route).toContain('COMMUNICATION_GOVERNANCE_ENABLED !== "true"');
    expect(route).toContain("listAllowedMarketingEmails");
    expect(route).toContain("isMarketingEmailAllowed(user.email)");
    expect(governance).toContain("export async function isMarketingEmailAllowed");
    expect(route).toContain("transporter.verify()");
    expect(route).toContain("NO_GOVERNED_RECIPIENTS");
    expect(route).toContain("SMTP_NOT_CONFIGURED");
    expect(route).toContain("db.emailCampaign.updateMany");
    expect(route).toContain('status: { in: ["DRAFT", "SCHEDULED"] }');
    expect(route).toContain("CAMPAIGN_DELIVERY_NOT_CLAIMED");
    expect(route).not.toContain("sentCount = users.length");
  });

  it("preserves SENDING after any ambiguous SMTP attempt instead of creating a blind retry path", () => {
    const route = source("src/app/api/admin/campaigns/[id]/send/route.ts");

    expect(route).toContain("let deliveryAttempted = false");
    expect(route).toContain("deliveryAttempted = true");
    expect(route).toContain("uncertainDeliveryCount");
    expect(route).toContain("campaign_delivery_reconciliation_required");
    expect(route).toContain("CAMPAIGN_DELIVERY_RECONCILIATION_REQUIRED");
    expect(route).toContain("markedSending && !deliveryAttempted");
    expect(route).toContain("markedSending && deliveryAttempted");
    expect(route).toContain("The campaign remains SENDING");
  });

  it("keeps browser signed-link and mailbox one-click unsubscribe evidence distinct", () => {
    const route = source("src/app/api/admin/campaigns/[id]/send/route.ts");
    const governance = source("src/lib/communications/governance.ts");
    const unsubscribeApi = source("src/app/api/communications/unsubscribe/route.ts");
    const control = source("src/components/communications/UnsubscribeControl.tsx");

    expect(governance).toContain("COMMUNICATION_UNSUBSCRIBE_SECRET");
    expect(governance).toContain('createHmac("sha256"');
    expect(route).toContain('"List-Unsubscribe"');
    expect(route).toContain('"List-Unsubscribe-Post"');
    expect(unsubscribeApi).toContain('request.headers.get("list-unsubscribe-post") ? "one_click_header" : "signed_link"');
    expect(unsubscribeApi).toContain('status: "BLOCKED"');
    expect(unsubscribeApi).toContain('eventType: "UNSUBSCRIBED"');
    expect(control).not.toContain('headers: { "List-Unsubscribe-Post"');
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
