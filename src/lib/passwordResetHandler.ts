import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { emitAuditLog } from "@/lib/audit";
import { clearSessionCookie } from "@/lib/auth";
import { getRequestContext } from "@/lib/api/auth-helpers";
import { rateLimit, rateLimitedResponse } from "@/lib/api/rate-limit";
import { completePasswordReset } from "@/lib/passwordResetService";

const schema = z.object({
  token: z.string().min(20).max(4096),
  newPassword: z.string().min(12).max(256),
});

export async function handlePasswordReset(request: NextRequest) {
  const { ipAddress, userAgent } = getRequestContext(request);
  const limit = rateLimit(ipAddress, { key: "auth:reset-password", windowMs: 900_000, max: 10 });
  if (!limit.ok) return rateLimitedResponse(limit.retryAfterSeconds);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const result = await completePasswordReset(parsed.data.token, parsed.data.newPassword);
  if (!result.ok) {
    const error = result.code === "password_reused"
      ? "Choose a password different from your current password."
      : "This password reset link is invalid or has expired.";
    return NextResponse.json({ error }, { status: 400 });
  }

  await emitAuditLog({
    userId: result.userId,
    action: "password_change",
    resource: "user",
    resourceId: result.userId,
    metadata: { flow: "forgot_password_reset" },
    ipAddress,
    userAgent,
  });

  const response = NextResponse.json({ success: true, message: "Your password has been reset." });
  response.headers.set("Cache-Control", "no-store");
  return clearSessionCookie(response);
}
