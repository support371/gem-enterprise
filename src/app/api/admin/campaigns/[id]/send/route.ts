import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import {
  CommunicationGovernanceUnavailableError,
  listAllowedMarketingEmails,
  marketingUnsubscribeUrl,
  normalizeEmail,
  oneClickUnsubscribeUrl,
} from "@/lib/communications/governance";
import { renderGemCampaignEmail } from "@/lib/email/gemCampaignTemplate";
import {
  requireAdmin,
  getRequestContext,
  serverError,
} from "@/lib/api/auth-helpers";

function appendUnsubscribe(html: string, text: string, unsubscribeUrl: string) {
  const htmlFooter = `<div style="margin-top:32px;padding-top:18px;border-top:1px solid #d7dce2;font-size:12px;line-height:1.6;color:#5f6b7a"><p>You are receiving this marketing message under a reviewed GEM Enterprise communication preference.</p><p><a href="${unsubscribeUrl}" style="color:#001F3F;text-decoration:underline">Unsubscribe from GEM Enterprise marketing email</a></p></div>`;
  return {
    text: `${text}\n\nMarketing preference: ${unsubscribeUrl}`,
    html: /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${htmlFooter}</body>`) : `${html}${htmlFooter}`,
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
  let sentCount = 0;

  try {
    if (process.env.COMMUNICATION_GOVERNANCE_ENABLED !== "true") {
      return NextResponse.json(
        { error: "Governed campaign delivery is not activated", code: "COMMUNICATION_GOVERNANCE_DISABLED" },
        { status: 503 },
      );
    }
    if (!process.env.SMTP_HOST) {
      return NextResponse.json(
        { error: "SMTP delivery is not configured; the campaign was not marked sent", code: "SMTP_NOT_CONFIGURED" },
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
      return NextResponse.json({ error: "Campaign delivery is already in progress" }, { status: 409 });
    }

    const [users, allowedMarketingEmails] = await Promise.all([
      db.user.findMany({
        where: { status: "active", isActive: true, isEmailVerified: true },
        select: { email: true },
      }),
      listAllowedMarketingEmails(),
    ]);
    const recipients = users.filter((user) => allowedMarketingEmails.has(normalizeEmail(user.email)));
    if (recipients.length === 0) {
      return NextResponse.json(
        {
          error: "No active verified users currently have an ALLOWED marketing-email preference",
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

    // Atomically claim delivery so concurrent admin requests cannot send the same campaign twice.
    const claim = await db.emailCampaign.updateMany({
      where: { id, status: { in: ["DRAFT", "SCHEDULED"] } },
      data: { status: "SENDING" },
    });
    if (claim.count !== 1) {
      return NextResponse.json(
        { error: "Campaign state changed before delivery could be claimed", code: "CAMPAIGN_DELIVERY_NOT_CLAIMED" },
        { status: 409 },
      );
    }
    markedSending = true;

    const renderedCampaign = renderGemCampaignEmail({
      subject: campaign.subject,
      body: campaign.body,
    });
    let failedCount = 0;

    for (const user of recipients) {
      try {
        const unsubscribeUrl = marketingUnsubscribeUrl(user.email);
        const oneClickUrl = oneClickUnsubscribeUrl(user.email);
        const rendered = appendUnsubscribe(renderedCampaign.html, renderedCampaign.text, unsubscribeUrl);
        await transporter.sendMail({
          from:
            process.env.EMAIL_FROM ??
            process.env.SMTP_FROM ??
            "GEM Enterprise <noreply@gemcybersecurityassist.com>",
          replyTo: process.env.REPLY_TO_EMAIL ?? process.env.GEM_OWNER_EMAIL ?? undefined,
          to: user.email,
          subject: campaign.subject,
          text: rendered.text,
          html: rendered.html,
          headers: {
            "List-Unsubscribe": `<${oneClickUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });
        sentCount += 1;
      } catch (error) {
        failedCount += 1;
        console.error("[campaign-delivery] recipient delivery failed", {
          campaignId: id,
          recipientDomain: user.email.split("@")[1] ?? "unknown",
          error: error instanceof Error ? error.message : "unknown error",
        });
      }
    }

    if (sentCount === 0) {
      await db.emailCampaign.update({ where: { id }, data: { status: "DRAFT" } });
      markedSending = false;
      await emitAuditLog({
        userId: session.userId,
        action: "admin_action",
        resource: "email_campaign",
        resourceId: id,
        metadata: {
          kind: "campaign_delivery_failed",
          governedRecipientCount: recipients.length,
          sentCount,
          failedCount,
          smtpVerified: true,
        },
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        { error: "No campaign recipients were successfully delivered", sentCount, failedCount },
        { status: 502 },
      );
    }

    const updated = await db.emailCampaign.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date(), recipientCount: sentCount },
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
        governedRecipientCount: recipients.length,
        recipientCount: sentCount,
        failedCount,
        smtpVerified: true,
        consentGate: "communication_preferences:EMAIL:MARKETING:ALLOWED",
        unsubscribe: "signed-link-and-one-click",
        emailTemplate: "gem-enterprise-branded-v1",
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      campaign: updated,
      governedRecipientCount: recipients.length,
      sentCount,
      failedCount,
    });
  } catch (error) {
    if (markedSending && sentCount === 0) {
      await db.emailCampaign
        .update({ where: { id }, data: { status: "DRAFT" } })
        .catch(() => {});
    }
    if (markedSending && sentCount > 0) {
      await emitAuditLog({
        userId: session.userId,
        action: "admin_action",
        resource: "email_campaign",
        resourceId: id,
        metadata: {
          kind: "campaign_delivery_reconciliation_required",
          sentCount,
          campaignState: "SENDING",
          reason: error instanceof Error ? error.message : "unknown error",
        },
        ipAddress,
        userAgent,
      }).catch(() => {});
      return NextResponse.json(
        {
          error: "Some messages were delivered, but final campaign reconciliation failed. The campaign remains SENDING to prevent automatic duplicate delivery.",
          code: "CAMPAIGN_DELIVERY_RECONCILIATION_REQUIRED",
          sentCount,
        },
        { status: 500 },
      );
    }
    if (error instanceof CommunicationGovernanceUnavailableError) {
      return NextResponse.json(
        { error: error.message, code: "COMMUNICATION_GOVERNANCE_STORAGE_NOT_READY" },
        { status: 503 },
      );
    }
    console.error("[POST /api/admin/campaigns/[id]/send]", error);
    return serverError("Failed to send campaign");
  }
}
