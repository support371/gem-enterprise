import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getRequestContext, requireAdmin, serverError } from "@/lib/api/auth-helpers";
import {
  CAMPAIGN_RECIPIENT_RECONCILED_CONFIRMED,
  loadCampaignDeliveryLedger,
} from "@/lib/email/campaignDeliveryLedger";

const ReconciliationSchema = z.discriminatedUnion("resolution", [
  z.object({
    resolution: z.literal("CONFIRMED_SENT"),
    confirmedRecipientCount: z.number().int().min(1),
    evidenceRef: z.string().trim().min(3).max(500),
    note: z.string().trim().max(1000).optional(),
  }),
  z.object({
    resolution: z.literal("SAFE_TO_RETRY"),
    confirmedRecipientCount: z.literal(0),
    evidenceRef: z.string().trim().min(3).max(500),
    note: z.string().trim().max(1000).optional(),
  }),
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const { ipAddress, userAgent } = getRequestContext(request);
  const { id } = await params;

  const parsed = ReconciliationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid reconciliation evidence", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const ledger = await loadCampaignDeliveryLedger(id);
    if (!ledger.audienceRecipientHashes) {
      return NextResponse.json(
        {
          error: "Campaign delivery has no durable audience snapshot to reconcile.",
          code: "CAMPAIGN_RECONCILIATION_LEDGER_MISSING",
        },
        { status: 409 },
      );
    }

    const unresolvedAttemptedRecipientHashes = [...ledger.attemptedRecipientHashes].filter(
      (hash) => !ledger.confirmedRecipientHashes.has(hash),
    );

    if (unresolvedAttemptedRecipientHashes.length === 0) {
      return NextResponse.json(
        {
          error: "Campaign has no unresolved delivery attempt requiring reconciliation.",
          code: "CAMPAIGN_RECONCILIATION_NOT_REQUIRED",
        },
        { status: 409 },
      );
    }

    if (
      parsed.data.resolution === "CONFIRMED_SENT" &&
      parsed.data.confirmedRecipientCount !== unresolvedAttemptedRecipientHashes.length
    ) {
      return NextResponse.json(
        {
          error:
            "Confirmed recipient count must match the unresolved attempted-recipient ledger.",
          code: "CAMPAIGN_RECONCILIATION_COUNT_MISMATCH",
          unresolvedAttemptedRecipientCount: unresolvedAttemptedRecipientHashes.length,
        },
        { status: 409 },
      );
    }

    // Reconciliation releases only the delivery lock. It never marks the whole campaign SENT.
    // The next send resumes the original audience while excluding every recipient already
    // durably confirmed. If reconciliation confirms the ambiguous attempt, that recipient is
    // added to the confirmed ledger in the same transaction before SENDING becomes DRAFT.
    const campaign = await db.$transaction(async (tx) => {
      const update = await tx.emailCampaign.updateMany({
        where: { id, status: "SENDING" },
        data: { status: "DRAFT", sentAt: null },
      });
      if (update.count !== 1) return null;

      if (parsed.data.resolution === "CONFIRMED_SENT") {
        await tx.auditLog.create({
          data: {
            userId: gate.session.userId,
            action: "admin_action",
            resource: "email_campaign",
            resourceId: id,
            metadata: {
              kind: CAMPAIGN_RECIPIENT_RECONCILED_CONFIRMED,
              recipientHashes: unresolvedAttemptedRecipientHashes,
              recipientCount: unresolvedAttemptedRecipientHashes.length,
              evidenceRef: parsed.data.evidenceRef,
              note: parsed.data.note ?? null,
            },
            ipAddress,
            userAgent,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: gate.session.userId,
          action: "admin_action",
          resource: "email_campaign",
          resourceId: id,
          metadata: {
            kind: "campaign_delivery_reconciled",
            resolution: parsed.data.resolution,
            confirmedRecipientCount: parsed.data.confirmedRecipientCount,
            unresolvedAttemptedRecipientCount: unresolvedAttemptedRecipientHashes.length,
            evidenceRef: parsed.data.evidenceRef,
            note: parsed.data.note ?? null,
            previousStatus: "SENDING",
            newStatus: "DRAFT",
            resumeMode: "unresolved-original-audience-only",
            evidenceRequired: true,
          },
          ipAddress,
          userAgent,
        },
      });

      return tx.emailCampaign.findUnique({ where: { id } });
    });

    if (!campaign) {
      return NextResponse.json(
        {
          error: "Campaign is not awaiting delivery reconciliation.",
          code: "CAMPAIGN_NOT_AWAITING_RECONCILIATION",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      campaign,
      reconciliation: parsed.data.resolution,
      unresolvedAttemptedRecipientCount: unresolvedAttemptedRecipientHashes.length,
      resumeRequired: true,
    });
  } catch (error) {
    console.error("[POST /api/admin/campaigns/[id]/reconcile]", error);
    return serverError(
      "Failed to persist reconciliation evidence; the campaign remains SENDING",
    );
  }
}
