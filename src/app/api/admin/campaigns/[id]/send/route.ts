import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { renderGemCampaignEmail } from "@/lib/email/gemCampaignTemplate";
import {
  buildMarketingUnsubscribeUrl,
  isMarketingEmailSuppressed,
} from "@/lib/email/marketingPreferences";
import nodemailer from "nodemailer";
import {
  requireAdmin,
  getRequestContext,
  serverError,
} from "@/lib/api/auth-helpers";

type NewsletterSuppressionRow = { email: string };

function isProductionRuntime(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production";
  return process.env.NODE_ENV === "production";
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

  try {
    const campaign = await db.emailCampaign.findUnique({ where: { id } });
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (campaign.status === "SENT") {
      return NextResponse.json({ error: "Already sent" }, { status: 409 });
    }
    if (campaign.status === "CANCELLED") {
      return NextResponse.json({ error: "Campaign is cancelled" }, { status: 409 });
    }

    const postalAddress = process.env.GEM_MARKETING_POSTAL_ADDRESS?.trim();
    const replyTo = process.env.GEM_MARKETING_REPLY_TO?.trim();
    const smtpConfigured = Boolean(process.env.SMTP_HOST?.trim());
    const production = isProductionRuntime();

    if (production && (!postalAddress || !replyTo)) {
      return NextResponse.json(
        {
          error:
            "Marketing delivery is blocked until GEM_MARKETING_POSTAL_ADDRESS and GEM_MARKETING_REPLY_TO are configured.",
          code: "MARKETING_COMPLIANCE_NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }

    if (production && !smtpConfigured) {
      return NextResponse.json(
        {
          error: "Marketing delivery is unavailable because SMTP is not configured.",
          code: "MARKETING_SMTP_NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }

    const users = await db.user.findMany({
      where: { status: "active", isActive: true, isEmailVerified: true },
      select: {
        id: true,
        email: true,
        profile: { select: { preferences: true } },
      },
    });

    const newsletterSuppressions = await db.$queryRaw<NewsletterSuppressionRow[]>`
      SELECT "email"
      FROM "newsletter_subscribers"
      WHERE "status" = 'unsubscribed'
    `;
    const newsletterSuppressedEmails = new Set(
      newsletterSuppressions.map((row) => row.email.trim().toLowerCase()),
    );

    const recipients = users.filter(
      (user) =>
        !isMarketingEmailSuppressed(user.profile?.preferences) &&
        !newsletterSuppressedEmails.has(user.email.trim().toLowerCase()),
    );
    const suppressedCount = users.length - recipients.length;

    // Mark sending only after all production delivery and compliance gates pass.
    await db.emailCampaign.update({
      where: { id },
      data: { status: "SENDING" },
    });

    let sentCount = 0;
    let failedCount = 0;

    if (smtpConfigured) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      for (const user of recipients) {
        const unsubscribeUrl = buildMarketingUnsubscribeUrl(user.id);
        const renderedCampaign = renderGemCampaignEmail({
          subject: campaign.subject,
          body: campaign.body,
          postalAddress,
          unsubscribeUrl,
          replyTo,
        });

        try {
          await transporter.sendMail({
            from:
              process.env.EMAIL_FROM ??
              "GEM Enterprise <noreply@gemcybersecurityassist.com>",
            replyTo,
            to: user.email,
            subject: campaign.subject,
            text: renderedCampaign.text,
            html: renderedCampaign.html,
            headers: {
              "List-Unsubscribe": `<${unsubscribeUrl}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          });
          sentCount += 1;
        } catch {
          failedCount += 1;
        }
      }
    } else {
      // Non-production environments retain an observable dry-run mode.
      sentCount = recipients.length;
    }

    const updated = await db.emailCampaign.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date(), recipientCount: sentCount },
    });

    await emitAuditLog({
      userId: session.userId,
      action: "admin_action",
      resource: "email_campaign",
      resourceId: id,
      metadata: {
        kind: "campaign_sent",
        recipientCount: sentCount,
        failedCount,
        suppressedCount,
        smtpConfigured,
        marketingComplianceConfigured: Boolean(postalAddress && replyTo),
        marketingOptOutMethod: "signed_link_and_one_click",
        emailTemplate: "gem-enterprise-branded-v2",
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      campaign: updated,
      sentCount,
      failedCount,
      suppressedCount,
    });
  } catch (error) {
    console.error("[POST /api/admin/campaigns/[id]/send]", error);
    // Best-effort revert from SENDING to DRAFT on failure.
    await db.emailCampaign
      .update({ where: { id }, data: { status: "DRAFT" } })
      .catch(() => {});
    return serverError("Failed to send campaign");
  }
}
