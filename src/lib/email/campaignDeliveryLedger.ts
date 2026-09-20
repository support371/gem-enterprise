import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { normalizeEmail } from "@/lib/communications/governance";

export const CAMPAIGN_AUDIENCE_SNAPSHOT = "campaign_delivery_audience_snapshot";
export const CAMPAIGN_RECIPIENT_ATTEMPTED = "campaign_recipient_delivery_attempted";
export const CAMPAIGN_RECIPIENT_CONFIRMED = "campaign_recipient_delivery_confirmed";
export const CAMPAIGN_RECIPIENT_UNCERTAIN = "campaign_recipient_delivery_uncertain";
export const CAMPAIGN_RECIPIENT_RECONCILED_CONFIRMED = "campaign_recipient_delivery_reconciled_confirmed";

export interface CampaignDeliveryLedger {
  audienceRecipientHashes: Set<string> | null;
  attemptedRecipientHashes: Set<string>;
  confirmedRecipientHashes: Set<string>;
  uncertainRecipientHashes: Set<string>;
}

function metadataObject(value: Prisma.JsonValue | null): Record<string, unknown> | null {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

export function campaignRecipientHash(email: string): string {
  return createHash("sha256").update(normalizeEmail(email), "utf8").digest("hex");
}

export async function loadCampaignDeliveryLedger(campaignId: string): Promise<CampaignDeliveryLedger> {
  const rows = await db.auditLog.findMany({
    where: { resource: "email_campaign", resourceId: campaignId },
    select: { metadata: true, createdAt: true, id: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  let audienceRecipientHashes: Set<string> | null = null;
  const attemptedRecipientHashes = new Set<string>();
  const confirmedRecipientHashes = new Set<string>();
  const uncertainRecipientHashes = new Set<string>();

  for (const row of rows) {
    const metadata = metadataObject(row.metadata);
    if (!metadata) continue;
    const kind = typeof metadata.kind === "string" ? metadata.kind : "";
    const recipientHash = typeof metadata.recipientHash === "string" ? metadata.recipientHash : null;

    if (kind === CAMPAIGN_AUDIENCE_SNAPSHOT) {
      audienceRecipientHashes = new Set(stringArray(metadata.recipientHashes));
      continue;
    }
    if (kind === CAMPAIGN_RECIPIENT_ATTEMPTED && recipientHash) {
      attemptedRecipientHashes.add(recipientHash);
      continue;
    }
    if (kind === CAMPAIGN_RECIPIENT_CONFIRMED && recipientHash) {
      confirmedRecipientHashes.add(recipientHash);
      uncertainRecipientHashes.delete(recipientHash);
      continue;
    }
    if (kind === CAMPAIGN_RECIPIENT_UNCERTAIN && recipientHash) {
      uncertainRecipientHashes.add(recipientHash);
      continue;
    }
    if (kind === CAMPAIGN_RECIPIENT_RECONCILED_CONFIRMED) {
      for (const hash of stringArray(metadata.recipientHashes)) {
        confirmedRecipientHashes.add(hash);
        uncertainRecipientHashes.delete(hash);
      }
    }
  }

  return {
    audienceRecipientHashes,
    attemptedRecipientHashes,
    confirmedRecipientHashes,
    uncertainRecipientHashes,
  };
}
