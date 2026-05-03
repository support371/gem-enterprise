import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  subject: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, message, subject } = parsed.data;

  try {
    // Persist as a support ticket (no userId required for public contact form)
    await db.supportTicket.create({
      data: {
        userId: "contact-form",
        subject: subject || `Contact from ${name}`,
        description: `From: ${name} <${email}>\n\n${message}`,
        status: "open",
        priority: "medium",
      },
    });
  } catch {
    // Non-fatal: log and continue so the user gets a success response
    console.error("[contact] Failed to persist contact submission");
  }

  // Send notification email if SMTP is configured
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
        subject: `[GEM Contact] ${subject || `Message from ${name}`}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      });
    } catch {
      console.error("[contact] Failed to send notification email");
    }
  }

  return NextResponse.json({ ok: true });
}
