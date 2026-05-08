import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import nodemailer from "nodemailer";
import {
  requireAdmin,
  getRequestContext,
  serverError,
} from "@/lib/api/auth-helpers";

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

    // Mark sending so concurrent calls cannot double-send.
    await db.emailCampaign.update({
      where: { id },
      data: { status: "SENDING" },
    });

    const users = await db.user.findMany({
      where: { status: "active", isActive: true, isEmailVerified: true },
      select: { email: true },
    });

    let sentCount = 0;
    let failedCount = 0;

    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      for (const user of users) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM ?? "noreply@gemcybersecurityassist.com",
            to: user.email,
            subject: campaign.subject,
            text: campaign.body,
          });
          sentCount += 1;
        } catch {
          failedCount += 1;
        }
      }
    } else {
      // No SMTP configured — record an audit-only "dry run" so the workflow
      // remains observable in non-production environments.
      sentCount = users.length;
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
        smtpConfigured: Boolean(process.env.SMTP_HOST),
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ campaign: updated, sentCount, failedCount });
  } catch (error) {
    console.error("[POST /api/admin/campaigns/[id]/send]", error);
    // Best-effort revert from SENDING to DRAFT on failure.
    await db.emailCampaign
      .update({ where: { id }, data: { status: "DRAFT" } })
      .catch(() => {});
    return serverError("Failed to send campaign");
  }
}
