import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(30).optional(),
  company: z.string().max(200).optional(),
  inquiryType: z
    .enum(["general", "sales", "support", "partnership", "media", "other"])
    .default("general"),
  message: z.string().min(1, "Message is required").max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, phone, company, inquiryType, message } = parsed.data;

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] ?? name;
    const lastName = nameParts.slice(1).join(" ") || null;

    // Upsert contact by email
    const contact = await db.contact.upsert({
      where: { email: email.toLowerCase() },
      update: {
        firstName,
        lastName,
        updatedAt: new Date(),
      },
      create: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        isSubscribed: true,
      },
    });

    // Create outbox message for admin notification
    await db.outboxMessage.create({
      data: {
        channel: "email",
        recipient: process.env.ADMIN_EMAIL ?? "admin@gemcybersecurityassist.com",
        subject: `New Contact Inquiry: ${inquiryType} — ${name}`,
        body: [
          `New contact form submission received.`,
          ``,
          `Name: ${name}`,
          `Email: ${email}`,
          ...(phone ? [`Phone: ${phone}`] : []),
          ...(company ? [`Company: ${company}`] : []),
          `Inquiry Type: ${inquiryType}`,
          ``,
          `Message:`,
          message,
        ].join("\n"),
        metadata: {
          contactId: contact.id,
          name,
          email,
          phone: phone ?? null,
          company: company ?? null,
          inquiryType,
        },
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your inquiry has been received.",
    });
  } catch (error) {
    console.error("[POST /api/contact]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
