import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { getRequestContext } from "@/lib/api/auth-helpers";
import { rateLimit, rateLimitedResponse } from "@/lib/api/rate-limit";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
});

const SAFE_RESPONSE = {
  success: true,
  message: "If an active GEM Enterprise account exists for that email, password reset instructions will be sent shortly.",
};

export async function POST(request: NextRequest) {
  const { ipAddress, userAgent } = getRequestContext(request);
  const limit = rateLimit(ipAddress, {
    key: "auth:forgot-password",
    windowMs: 15 * 60_000,
    max: 5,
  });

  if (!limit.ok) {
    await emitAuditLog({
      action: "failed_login",
      resource: "auth",
      metadata: { flow: "forgot_password", reason: "rate_limited" },
      ipAddress,
      userAgent,
    });
    return rateLimitedResponse(limit.retryAfterSeconds);
  }

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
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  await emitAuditLog({
    userId: user?.id,
    action: "password_change",
    resource: "auth",
    metadata: { flow: "forgot_password", email, accepted: Boolean(user) },
    ipAddress,
    userAgent,
  });

  return NextResponse.json(SAFE_RESPONSE);
}
