import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import {
  CommunicationGovernanceUnavailableError,
  isMarketingEmailAllowed,
  listAllowedMarketingEmails,
  marketingUnsubscribeUrl,
  normalizeEmail,
  oneClickUnsubscribeUrl,
} from "@/lib/communications/governance";
import { renderGemCampaignEmail } from "@/lib/email/gemCampaignTemplate";
import {
  CAMPAIGN_AUDIENCE_SNAPSHOT,
  CAMPAIGN_RECIPIENT_ATTEMPTED,
  CAMPAIGN_RECIPIENT_CONFIRMED,
  CAMPAIGN_RECIPIENT_UNCERTAIN,
  campaignRecipientHash,
  loadCampaignDeliveryLedger,
} from "@/lib/email/campaignDeliveryLedger";
import {
  requireAdmin,
  getRequestContext,
  serverError,
} from "@/lib/api/auth-helpers";

function isProductionRuntime(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production";
  return process.env.NODE_ENV === "production";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function marketingDeliveryConfig() {
  const postalAddress = process.env.GEM_MARKETING_POSTAL_ADDRESS?.trim();
  const replyTo =
    process.env.GEM_MARKETING_REPLY_TO?.trim() ||
    process.env.REPLY_TO_EMAIL?.trim() ||
    process.env.GEM_OWNER_EMAIL?.trim();
  return { postalAddress, replyTo };
}

function appendUnsubscribe(
  html: string,
  text: string,
  unsubscribeUrl: string,
  postalAddress?: string,
  replyTo?: string,
) {
  const complianceLines = [
    postalAddress ? `<p>Mailing address: ${escapeHtml(postalAddress)}</p>` : "",
    replyTo ? `<p>Preference support: ${escapeHtml(replyTo)}</p>` : "",
  ]
    .filter(Boolean)
    .join("");
  const htmlFooter = `<div style="margin-top:32px;padding-top:18px;border-top:1px solid #d7dce2;font-size:12px;line-height:1.6;color:#5f6b7a"><p>This is a commercial communication from GEM Enterprise. You are receiving it under a reviewed GEM Enterprise communication preference.</p>${complianceLines}<p><a href="${unsubscribeUrl}" style="color:#001F3F;text-decoration:underline">Unsubscribe from GEM Enterprise marketing email</a></p></div>`;
  const textFooter = [
    "Commercial communication from GEM Enterprise.",
    postalAddress ? `Mailing address: ${postalAddress}` : null,
    replyTo ? `Preference support: ${replyTo}` : null,
    `Marketing preference: ${unsubscribeUrl}`,
  ]
    .filter((value): value is string => Boolean(value))
    .join("\n");
  return {
    text: `${text}\n\n${textFooter}`,
    html: /<\/body>/i.test(html)
      ? html.replace(/<\/body>/i, `${htmlFooter}</body>`)
      : `${html}${htmlFooter}`,
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdmin();
  if (!gate.ok) return (gate as { ok: false; response: any }).response;
  const session = gate.session;
  const { ipAddress, userAgent } = getRequestContext(req);
  const { id } = await params;
  let markedSending = false;
  let deliveryAttempted = false;
  let sentCount = 0;
  let uncertainDeliveryCount = 0;
  let skippedBlockedCount = 0;

  try {
    if (process.env.COMMUNICATION_GOVERNANCE_ENABLED !== "true") {
      return NextResponse.json(
        {
          error: "Governed campaign delivery is not activated",
          code: "COMMUNICATION_GOVERNANCE_DISABLED",
        },
        { status: 503 },
      );
    }
    if (!process.env.SMTP_HOST) {
      return NextResponse.json(
        {
          error: "SMTP delivery is not configured; the campaign was not marked sent",
          code: "SMTP_NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }

    const { postalAddress, replyTo } = marketingDeliveryConfig();
    if (isProductionRuntime() && (!postalAddress || !replyTo)) {
      return NextResponse.json(
        {
          error:
            "Production marketing delivery is blocked until GEM_MARKETING_POSTAL_ADDRESS and a monitored reply-to address are configured.",
          code: "MARKETING_COMPLIANCE_NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }

    const campaign = await db.emailCampaign.findUnique({ where: { id } });
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (campaign.status === "SENT") {
      return NextResponse.json({ error: "Already sent" }, { status: 409 });
    }
    if (campaign.status === "CANCELLED") {
      return NextResponse.json({ error: "Campaign is cancelled" }, { status: 409 });
    }
    if (campaign.status === "SENDING") {
      return NextResponse.json(
        { error: "Campaign delivery is already in progress" },
        { status: 409 },
      );
    }

    const [users, allowedMarketingEmails, deliveryLedger] = await Promise.all([
      db.user.findMany({
        where: { status: "active", isActive: true, isEmailVerified: true },
        select: { email: true },
      }),
      listAllowedMarketingEmails(),
      loadCampaignDeliveryLedger(id),
    ]);
    const currentlyGovernedRecipients = users.filter((user) =>
      allowedMarketingEmails.has(normalizeEmail(user.email)),
    );
    const originalAudience =
      deliveryLedger.audienceRecipientHashes ??
      new Set(currentlyGovernedRecipients.map((user) => campaignRecipientHash(user.email)));
    const confirmedRecipientHashes = new Set(deliveryLedger.confirmedRecipientHashes);
    const recipients = currentlyGovernedRecipients.filter((user) => {
      const hash = campaignRecipientHash(user.email);
      return originalAudience.has(hash) && !confirmedRecipientHashes.has(hash);
    });

    if (recipients.length === 0) {
      if (deliveryLedger.audienceRecipientHashes && confirmedRecipientHashes.size > 0) {
        const completed = await db.$transaction(async (tx) => {
          const update = await tx.emailCampaign.updateMany({
            where: {
              id,
              status: { in: ["DRAFT", "SCHEDULED"] },
              updatedAt: campaign.updatedAt,
            },
            data: {
              status: "SENT",
              sentAt: new Date(),
              recipientCount: confirmedRecipientHashes.size,
            },
          });
          if (update.count !== 1) return null;
          await tx.auditLog.create({
            data: {
              userId: session.userId,
              action: "admin_action",
              resource: "email_campaign",
              resourceId: id,
              metadata: {
                kind: "campaign_delivery_completed_from_ledger",
                recipientCount: confirmedRecipientHashes.size,
                reason: "no-unresolved-currently-governed-recipients",
              },
              ipAddress,
              userAgent,
            },
          });
          return tx.emailCampaign.findUnique({ where: { id } });
        });
        if (!completed) {
          return NextResponse.json(
            {
              error: "Campaign state or content changed before ledger completion",
              code: "CAMPAIGN_DELIVERY_NOT_CLAIMED",
            },
            { status: 409 },
          );
        }
        return NextResponse.json({
          campaign: completed,
          governedRecipientCount: originalAudience.size,
          sentCount: confirmedRecipientHashes.size,
          resumedFromLedger: true,
        });
      }

      return NextResponse.json(
        {
          error:
            "No active verified users currently have an ALLOWED marketing-email preference",
          code: "NO_GOVERNED_RECIPIENTS",
        },
        { status: 409 },
      );
    }

    // Validate unsubscribe signing before changing campaign state.
    oneClickUnsubscribeUrl(recipients[0].email);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.verify();

    // Claim the exact campaign version and persist the immutable audience snapshot in the same
    // transaction. A retry therefore uses the original audience and never re-sends recipients
    // whose successful delivery was already recorded in the mandatory delivery ledger.
    const claimed = await db.$transaction(async (tx) => {
      const claim = await tx.emailCampaign.updateMany({
        where: {
          id,
          status: { in: ["DRAFT", "SCHEDULED"] },
          updatedAt: campaign.updatedAt,
        },
        data: { status: "SENDING" },
      });
      if (claim.count !== 1) return false;

      if (!deliveryLedger.audienceRecipientHashes) {
        await tx.auditLog.create({
          data: {
            userId: session.userId,
            action: "admin_action",
            resource: "email_campaign",
            resourceId: id,
            metadata: {
              kind: CAMPAIGN_AUDIENCE_SNAPSHOT,
              recipientHashes: [...originalAudience],
              recipientCount: originalAudience.size,
            },
            ipAddress,
            userAgent,
          },
        });
      }
      return true;
    });
    if (!claimed) {
      return NextResponse.json(
        {
          error: "Campaign state or content changed before delivery could be claimed",
          code: "CAMPAIGN_DELIVERY_NOT_CLAIMED",
        },
        { status: 409 },
      );
    }
    markedSending = true;

    const renderedCampaign = renderGemCampaignEmail({
      subject: campaign.subject,
      body: campaign.body,
    });

    for (const user of recipients) {
      const recipientHash = campaignRecipientHash(user.email);

      // Permission can change after the initial audience query. Recheck immediately before
      // each delivery so an unsubscribe/block that lands mid-run takes effect before send.
      const stillAllowed = await isMarketingEmailAllowed(user.email);
      if (!stillAllowed) {
        skippedBlockedCount += 1;
        continue;
      }

      const unsubscribeUrl = marketingUnsubscribeUrl(user.email);
      const oneClickUrl = oneClickUnsubscribeUrl(user.email);
      const rendered = appendUnsubscribe(
        renderedCampaign.html,
        renderedCampaign.text,
        unsubscribeUrl,
        postalAddress,
        replyTo,
      );

      // The attempt record is mandatory and is written before SMTP. If it cannot be persisted,
      // no external delivery is attempted and the safe outer rollback can return the campaign
      // to DRAFT. Recipient identity is represented only by a deterministic one-way hash.
      await db.auditLog.create({
        data: {
          userId: session.userId,
          action: "admin_action",
          resource: "email_campaign",
          resourceId: id,
          metadata: {
            kind: CAMPAIGN_RECIPIENT_ATTEMPTED,
            recipientHash,
          },
          ipAddress,
          userAgent,
        },
      });

      deliveryAttempted = true;
      try {
        await transporter.sendMail({
          from:
            process.env.EMAIL_FROM ??
            process.env.SMTP_FROM ??
            "GEM Enterprise <noreply@gemcybersecurityassist.com>",
          replyTo,
          to: user.email,
          subject: campaign.subject,
          text: rendered.text,
          html: rendered.html,
          headers: {
            "List-Unsubscribe": `<${oneClickUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });

        // Delivery is not counted as confirmed until the durable recipient-level record exists.
        // If this insert fails after SMTP accepted the message, the outcome becomes ambiguous and
        // the campaign remains SENDING for evidence-based reconciliation.
        await db.auditLog.create({
          data: {
            userId: session.userId,
            action: "admin_action",
            resource: "email_campaign",
            resourceId: id,
            metadata: {
              kind: CAMPAIGN_RECIPIENT_CONFIRMED,
              recipientHash,
            },
            ipAddress,
            userAgent,
          },
        });
        confirmedRecipientHashes.add(recipientHash);
        sentCount += 1;
      } catch (error) {
        uncertainDeliveryCount += 1;
        await db.auditLog
          .create({
            data: {
              userId: session.userId,
              action: "admin_action",
              resource: "email_campaign",
              resourceId: id,
              metadata: {
                kind: CAMPAIGN_RECIPIENT_UNCERTAIN,
                recipientHash,
              },
              ipAddress,
              userAgent,
            },
          })
          .catch(() => {});
        console.error("[campaign-delivery] recipient outcome uncertain", {
          campaignId: id,
          recipientDomain: user.email.split("@")[1] ?? "unknown",
          error: error instanceof Error ? error.message : "unknown error",
        });
        break;
      }
    }

    if (uncertainDeliveryCount > 0) {
      // Intentionally leave the durable campaign status as SENDING. The confirmed-recipient
      // ledger survives the reconciliation and prevents already delivered recipients from being
      // selected again when a safe resume is authorized.
      markedSending = false;
      await emitAuditLog({
        userId: session.userId,
        action: "admin_action",
        resource: "email_campaign",
        resourceId: id,
        metadata: {
          kind: "campaign_delivery_reconciliation_required",
          governedRecipientCount: originalAudience.size,
          sentCount,
          confirmedRecipientCount: confirmedRecipientHashes.size,
          uncertainDeliveryCount,
          skippedBlockedCount,
          campaignState: "SENDING",
        },
        ipAddress,
        userAgent,
      }).catch(() => {});
      return NextResponse.json(
        {
          error:
            "A delivery outcome is uncertain. The campaign remains SENDING and must be reconciled before any retry.",
          code: "CAMPAIGN_DELIVERY_RECONCILIATION_REQUIRED",
          sentCount,
          confirmedRecipientCount: confirmedRecipientHashes.size,
          uncertainDeliveryCount,
          skippedBlockedCount,
        },
        { status: 502 },
      );
    }

    if (confirmedRecipientHashes.size === 0) {
      // No SMTP attempt was durably confirmed and every candidate became blocked before delivery.
      // Returning to DRAFT is retry-safe because no confirmed recipient exists in the ledger.
      await db.emailCampaign.update({ where: { id }, data: { status: "DRAFT" } });
      markedSending = false;
      await emitAuditLog({
        userId: session.userId,
        action: "admin_action",
        resource: "email_campaign",
        resourceId: id,
        metadata: {
          kind: "campaign_delivery_stopped_no_current_permission",
          governedRecipientCount: originalAudience.size,
          sentCount,
          skippedBlockedCount,
          deliveryAttempted,
        },
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        {
          error: "Every candidate recipient became blocked before delivery",
          code: "NO_CURRENT_GOVERNED_RECIPIENTS",
          sentCount,
          skippedBlockedCount,
        },
        { status: 409 },
      );
    }

    const updated = await db.emailCampaign.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        recipientCount: confirmedRecipientHashes.size,
      },
    });
    markedSending = false;

    await emitAuditLog({
      userId: session.userId,
      action: "admin_action",
      resource: "email_campaign",
      resourceId: id,
      metadata: {
        kind: "campaign_sent",
        eligibleUserCount: users.length,
        governedRecipientCount: originalAudience.size,
        recipientCount: confirmedRecipientHashes.size,
        sentThisRun: sentCount,
        resumedConfirmedRecipientCount: confirmedRecipientHashes.size - sentCount,
        skippedBlockedCount,
        smtpVerified: true,
        marketingComplianceConfigured: Boolean(postalAddress && replyTo),
        postalAddressConfigured: Boolean(postalAddress),
        monitoredReplyToConfigured: Boolean(replyTo),
        consentGate: "communication_preferences:EMAIL:MARKETING:ALLOWED",
        permissionRecheck: "immediately-before-each-send",
        recipientProgress: "mandatory-audit-ledger",
        unsubscribe: "signed-link-and-one-click",
        emailTemplate: "gem-enterprise-branded-v1",
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      campaign: updated,
      governedRecipientCount: originalAudience.size,
      sentCount,
      confirmedRecipientCount: confirmedRecipientHashes.size,
      skippedBlockedCount,
    });
  } catch (error) {
    if (markedSending && !deliveryAttempted) {
      await db.emailCampaign
        .update({ where: { id }, data: { status: "DRAFT" } })
        .catch(() => {});
    }
    if (markedSending && deliveryAttempted) {
      // Once SMTP delivery has been attempted, unexpected failures are treated as potentially
      // ambiguous even when sentCount is still zero. Preserve SENDING to prevent blind retry.
      markedSending = false;
      await emitAuditLog({
        userId: session.userId,
        action: "admin_action",
        resource: "email_campaign",
        resourceId: id,
        metadata: {
          kind: "campaign_delivery_reconciliation_required",
          sentCount,
          uncertainDeliveryCount,
          skippedBlockedCount,
          campaignState: "SENDING",
          reason: error instanceof Error ? error.message : "unknown error",
        },
        ipAddress,
        userAgent,
      }).catch(() => {});
      return NextResponse.json(
        {
          error:
            "Campaign delivery requires reconciliation. The campaign remains SENDING to prevent automatic duplicate delivery.",
          code: "CAMPAIGN_DELIVERY_RECONCILIATION_REQUIRED",
          sentCount,
        },
        { status: 500 },
      );
    }
    if (error instanceof CommunicationGovernanceUnavailableError) {
      return NextResponse.json(
        {
          error: error.message,
          code: "COMMUNICATION_GOVERNANCE_STORAGE_NOT_READY",
        },
        { status: 503 },
      );
    }
    console.error("[POST /api/admin/campaigns/[id]/send]", error);
    return serverError("Failed to send campaign");
  }
}
