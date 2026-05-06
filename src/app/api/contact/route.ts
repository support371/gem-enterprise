import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { emitAuditLog } from "@/lib/audit";
import { getRequestContext, badRequest } from "@/lib/api/auth-helpers";
import { rateLimit, rateLimitedResponse } from "@/lib/api/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().trim().toLowerCase().email("Invalid email address").max(254),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5_000),
  subject: z.string().trim().max(200).optional(),
  // Optional honeypot field — bots tend to fill every input. If populated we
  // accept (200 OK) but silently drop the submission.
  website: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { ipAddress, userAgent } = getRequestContext(req);

  // Hard rate-limit per IP: 5 contact submissions / hour.
  const limit = rateLimit(ipAddress, {
    key: "contact:submit",
    windowMs: 60 * 60_000,
    max: 5,
  });
  if (!limit.ok) return rateLimitedResponse(limit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
  }

  const { name, email, message, subject, website } = parsed.data;

  // Honeypot — return 200 OK to avoid signaling rejection to the bot.
  if (website && website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Capture the inbound contact as a SupportTicket only when the sender is
  // already authenticated. Otherwise we never write to the database — the
  // ticket model requires a real userId FK and we will not synthesize one
  // (which previously caused FK violations and lost messages).
  const session = await getSession();
  let ticketId: string | null = null;

  if (session) {
    try {
      const ticket = await db.supportTicket.create({
        data: {
          userId: session.userId,
          subject: subject?.trim() || `Contact from ${name}`,
          description: `From: ${name} <${email}>\n\n${message}`,
          status: "open",
          priority: "medium",
        },
        select: { id: true },
      });
      ticketId = ticket.id;
    } catch (error) {
      console.error("[contact] failed to persist ticket", error);
      // non-fatal — fall through and still email + audit
    }
  }

  await emitAuditLog({
    userId: session?.userId,
    action: "admin_action",
    resource: "contact_message",
    resourceId: ticketId ?? undefined,
    metadata: {
      authenticated: Boolean(session),
      email,
      name,
      subject: subject ?? null,
      ticketId,
    },
    ipAddress,
    userAgent,
  });

  // Send notification email if SMTP is configured. We isolate the import in
  // the conditional so deployments without nodemailer wired don't pay the
  // bundle cost on the cold path.
  if (process.env.SMTP_HOST && process.env.ADMIN_EMAIL) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        replyTo: email,
        subject: `[GEM Contact] ${subject?.trim() || `Message from ${name}`}`,
        text: `Name: ${name}\nEmail: ${email}\nAuth: ${session ? `yes (${session.email})` : "no"}\nIP: ${ipAddress}\n\n${message}`,
      });
    } catch (error) {
      console.error("[contact] failed to send notification email", error);
    }
  }

  return NextResponse.json({ ok: true, ticketId });
}
