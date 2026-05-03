import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import nodemailer from "nodemailer";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (!['admin', 'super_admin', 'internal'].includes(session.role)) return null;
  return session;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const campaign = await db.emailCampaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (campaign.status === "SENT") return NextResponse.json({ error: "Already sent" }, { status: 409 });
  if (campaign.status === "CANCELLED") return NextResponse.json({ error: "Campaign is cancelled" }, { status: 409 });

  const users = await db.user.findMany({
    where: { status: "active", isActive: true },
    select: { email: true },
  });

  let sentCount = 0;
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
        sentCount++;
      } catch {
        // continue on per-recipient failures
      }
    }
  } else {
    sentCount = users.length;
  }

  const updated = await db.emailCampaign.update({
    where: { id },
    data: { status: "SENT", sentAt: new Date(), recipientCount: sentCount },
  });

  return NextResponse.json({ campaign: updated, sentCount });
}
