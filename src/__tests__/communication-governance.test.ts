import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("communication governance", () => {
  it("stores permission state and database-enforced append-only preference events", () => {
    const migration = source("prisma/migrations/20260913170000_communication_governance/migration.sql");
    const promotion = source("scripts/apply-communication-governance-prisma.mjs");

    expect(migration).toContain('CREATE TABLE "communication_preferences"');
    expect(migration).toContain('CREATE TABLE "communication_preference_events"');
    expect(migration).toContain("'PENDING', 'ALLOWED', 'BLOCKED'");
    expect(migration).toContain('communication_preference_events_preferenceId_fkey');
    expect(migration).toContain('communication_preference_events_actorUserId_fkey');
    expect(migration).toContain('REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE');
    expect(promotion).toContain('actorUser   User? @relation("CommunicationPreferenceActor", fields: [actorUserId], references: [id], onDelete: Restrict)');
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
      governance.indexOf("export async function unsubscribeMarketingEmail"),
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

  it("requires explicit governed recipients, SMTP preflight, an exact-version atomic claim, and a permission recheck before each send", () => {
    const route = source("src/app/api/admin/campaigns/[id]/send/route.ts");
    const governance = source("src/lib/communications/governance.ts");

    expect(route).toContain('COMMUNICATION_GOVERNANCE_ENABLED !== "true"');
    expect(route).toContain("listAllowedMarketingEmails");
    expect(route).toContain("isMarketingEmailAllowed(user.email)");
    expect(governance).toContain("export async function isMarketingEmailAllowed");
    expect(route).toContain("transporter.verify()");
    expect(route).toContain("NO_GOVERNED_RECIPIENTS");
    expect(route).toContain("SMTP_NOT_CONFIGURED");
    expect(route).toContain("tx.emailCampaign.updateMany");
    expect(route).toContain('status: { in: ["DRAFT", "SCHEDULED"] }');
    expect(route).toContain("updatedAt: campaign.updatedAt");
    expect(route).toContain("CAMPAIGN_DELIVERY_NOT_CLAIMED");
    expect(route).not.toContain("sentCount = users.length");
  });

  it("preserves SENDING after any ambiguous SMTP attempt instead of creating a blind retry path", () => {
    const route = source("src/app/api/admin/campaigns/[id]/send/route.ts");
    const editRoute = source("src/app/api/admin/campaigns/[id]/route.ts");

    expect(route).toContain("let deliveryAttempted = false");
    expect(route).toContain("deliveryAttempted = true");
    expect(route).toContain("uncertainDeliveryCount");
    expect(route).toContain("campaign_delivery_reconciliation_required");
    expect(route).toContain("CAMPAIGN_DELIVERY_RECONCILIATION_REQUIRED");
    expect(route).toContain("markedSending && !deliveryAttempted");
    expect(route).toContain("markedSending && deliveryAttempted");
    expect(route).toContain("The campaign remains SENDING");
    expect(editRoute).toContain('existing.status === "SENDING"');
    expect(editRoute).toContain("CAMPAIGN_RECONCILIATION_REQUIRED");
  });

  it("persists mandatory reconciliation evidence in the same transaction that releases SENDING", () => {
    const route = source("src/app/api/admin/campaigns/[id]/reconcile/route.ts");

    expect(route).toContain("db.$transaction(async (tx) =>");
    expect(route).toContain("tx.emailCampaign.updateMany");
    expect(route).toContain("tx.auditLog.create");
    expect(route).toContain('kind: "campaign_delivery_reconciled"');
    expect(route).toContain("evidenceRef: parsed.data.evidenceRef");
    expect(route).toContain("the campaign remains SENDING");
    expect(route).not.toContain("emitAuditLog");
  });

  it("persists recipient delivery progress and resumes only unresolved original-audience recipients", () => {
    const route = source("src/app/api/admin/campaigns/[id]/send/route.ts");
    const reconcile = source("src/app/api/admin/campaigns/[id]/reconcile/route.ts");
    const ledger = source("src/lib/email/campaignDeliveryLedger.ts");

    expect(route).toContain("loadCampaignDeliveryLedger(id)");
    expect(route).toContain("CAMPAIGN_AUDIENCE_SNAPSHOT");
    expect(route).toContain("CAMPAIGN_RECIPIENT_ATTEMPTED");
    expect(route).toContain("CAMPAIGN_RECIPIENT_CONFIRMED");
    expect(route).toContain("!confirmedRecipientHashes.has(hash)");
    expect(route).toContain("recipientProgress: \"mandatory-audit-ledger\"");
    expect(ledger).toContain("campaignRecipientHash");
    expect(ledger).toContain("CAMPAIGN_RECIPIENT_RECONCILED_CONFIRMED");
    expect(reconcile).toContain("unresolvedAttemptedRecipientHashes");
    expect(reconcile).toContain("CAMPAIGN_RECIPIENT_RECONCILED_CONFIRMED");
    expect(reconcile).toContain('data: { status: "DRAFT", sentAt: null }');
    expect(reconcile).toContain('resumeMode: "unresolved-original-audience-only"');
    expect(reconcile).not.toContain('const nextStatus = parsed.data.resolution === "CONFIRMED_SENT" ? "SENT" : "DRAFT"');
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
    expect(unsubscribeApi).toContain("unsubscribeMarketingEmail");
    expect(control).not.toContain('headers: { "List-Unsubscribe-Post"');
  });

  it("makes unsubscribe persistence event-idempotent and retryable on storage failure", () => {
    const governance = source("src/lib/communications/governance.ts");
    const route = source("src/app/api/communications/unsubscribe/route.ts");

    expect(governance).toContain("export async function unsubscribeMarketingEmail");
    expect(governance).toContain('latestControlEventType: "UNSUBSCRIBED" | "RESUBSCRIBED" | null');
    expect(governance).toContain('current?.latestControlEventType === "UNSUBSCRIBED"');
    expect(governance).toContain("return { preferenceId: current.id, changed: false }");
    expect(governance).toContain("FOR UPDATE");
    expect(route).toContain("UNSUBSCRIBE_PERSISTENCE_FAILED");
    expect(route).toContain("Please retry");
    expect(route).toContain("503");
  });

  it("keeps historical recipient opt-outs active through intermediate statuses until explicit resubscription", () => {
    const governance = source("src/lib/communications/governance.ts");
    const route = source("src/app/api/admin/communications/preferences/route.ts");
    const page = source("src/app/app/admin/communications/page.tsx");

    expect(governance).toContain("CommunicationResubscriptionRequiredError");
    expect(governance).toContain("AND e.\"eventType\" IN ('UNSUBSCRIBED', 'RESUBSCRIBED')");
    expect(governance).toContain('const recipientOptOutActive = current?.latestControlEventType === "UNSUBSCRIBED"');
    expect(governance).not.toContain('current.status === "BLOCKED" &&');
    expect(governance).toContain('input.basis !== "EXPLICIT_CONSENT"');
    expect(governance).toContain("input.resubscribeConfirmed !== true");
    expect(governance).toContain('eventType = "RESUBSCRIBED"');
    expect(route).toContain("EXPLICIT_RESUBSCRIPTION_REQUIRED");
    expect(route).toContain("resubscribeConfirmed: parsed.data.resubscribeConfirmed");
    expect(page).toContain("Explicit resubscription confirmation");
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
