import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { getRequestContext } from "@/lib/api/auth-helpers";
import { rateLimit, rateLimitedResponse } from "@/lib/api/rate-limit";
import { sendMail } from "@/lib/mail/send";
import { createPasswordResetToken } from "@/lib/passwordReset";
import {
  requestPasswordRecoveryGateway,
  shouldUseSupabaseGateway,
} from "@/lib/supabase-gateway";

const DEFAULT_APP_URL = "https://www.gemcybersecurityassist.com";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
});

const SAFE_RESPONSE = {
  success: true,
  message: "If an active GEM Enterprise account exists for that email, its recovery request has been recorded.",
};

function emailBucket(email: string): string {
  return createHash("sha256").update(email).digest("hex");
}

function appBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_APP_URL;
  const parsed = new URL(configured);
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_APP_URL must use HTTPS in production.");
  }
  return parsed.toString().replace(/\/$/, "");
}

export async function POST(request: NextRequest) {
  const { ipAddress, userAgent } = getRequestContext(request);
  const ipLimit = rateLimit(ipAddress, {
    key: "auth:forgot-password:ip",
    windowMs: 15 * 60_000,
    max: 5,
  });
  if (!ipLimit.ok) return rateLimitedResponse(ipLimit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const addressLimit = rateLimit(emailBucket(email), {
    key: "auth:forgot-password:email",
    windowMs: 60 * 60_000,
    max: 3,
  });
  if (!addressLimit.ok) {
    return NextResponse.json(SAFE_RESPONSE, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (shouldUseSupabaseGateway()) {
    try {
      await requestPasswordRecoveryGateway(email);
    } catch (error) {
      console.error("[auth] password recovery gateway unavailable", {
        code: error instanceof Error ? error.name : "unknown_error",
      });
      return NextResponse.json(
        { error: "The recovery service is temporarily unavailable. Please try again." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(SAFE_RESPONSE, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      isActive: true,
      status: true,
    },
  });

  let delivery = "not_applicable";
  if (user?.isActive && user.status === "active") {
    try {
      const token = await createPasswordResetToken({
        userId: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
      });
      const resetUrl = new URL("/reset-password", appBaseUrl());
      resetUrl.hash = new URLSearchParams({ token }).toString();
      const result = await sendMail({
        to: user.email,
        subject: "Reset your GEM Enterprise password",
        text: `A password reset was requested for your GEM Enterprise account. Open this link within 15 minutes: ${resetUrl.toString()}\n\nIf you did not request this, ignore this message.`,
        html: `<p>A password reset was requested for your GEM Enterprise account.</p><p><a href="${resetUrl.toString()}">Reset your password</a>. This link expires in 15 minutes.</p><p>If you did not request this, ignore this message.</p>`,
      });
      delivery = result.sent
        ? "sent"
        : "reason" in result
          ? result.reason
          : "skipped";
    } catch (error) {
      delivery = "failed";
      console.error("[auth] password reset email delivery failed", {
        userId: user.id,
        error: error instanceof Error ? error.message : "unknown_error",
      });
    }
  }

  await emitAuditLog({
    userId: user?.id,
    action: "password_change",
    resource: "auth",
    resourceId: user?.id,
    metadata: {
      flow: "forgot_password_request",
      accountEligible: Boolean(user?.isActive && user.status === "active"),
      delivery,
    },
    ipAddress,
    userAgent,
  });

  return NextResponse.json(SAFE_RESPONSE, {
    headers: { "Cache-Control": "no-store" },
  });
}
