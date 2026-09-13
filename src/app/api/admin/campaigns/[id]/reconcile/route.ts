import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { getRequestContext, requireAdmin, serverError } from "@/lib/api/auth-helpers";

const ReconciliationSchema = z.discriminatedUnion("resolution", [
  z.object({
    resolution: z.literal("CONFIRMED_SENT"),
    confirmedRecipientCount: z.number().int().min(0),
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
    const nextStatus = parsed.data.resolution === "CONFIRMED_SENT" ? "SENT" : "DRAFT";
    const update = await db.emailCampaign.updateMany({
      where: { id, status: "SENDING" },
      data:
        nextStatus === "SENT"
          ? {
              status: "SENT",
              sentAt: new Date(),
              recipientCount: parsed.data.confirmedRecipientCount,
            }
          : {
              status: "DRAFT",
              sentAt: null,
              recipientCount: 0,
            },
    });

    if (update.count !== 1) {
      return NextResponse.json(
        {
          error: "Campaign is not awaiting delivery reconciliation.",
          code: "CAMPAIGN_NOT_AWAITING_RECONCILIATION",
        },
        { status: 409 },
      );
    }

    await emitAuditLog({
      userId: gate.session.userId,
      action: "admin_action",
      resource: "email_campaign",
      resourceId: id,
      metadata: {
        kind: "campaign_delivery_reconciled",
        resolution: parsed.data.resolution,
        confirmedRecipientCount: parsed.data.confirmedRecipientCount,
        evidenceRef: parsed.data.evidenceRef,
        note: parsed.data.note ?? null,
        previousStatus: "SENDING",
        newStatus: nextStatus,
      },
      ipAddress,
      userAgent,
    });

    const campaign = await db.emailCampaign.findUnique({ where: { id } });
    return NextResponse.json({ campaign, reconciliation: parsed.data.resolution });
  } catch (error) {
    console.error("[POST /api/admin/campaigns/[id]/reconcile]", error);
    return serverError("Failed to reconcile campaign delivery");
  }
}
