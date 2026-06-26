import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { getRequestContext } from "@/lib/api/auth-helpers";
import { rateLimit, rateLimitedResponse } from "@/lib/api/rate-limit";

const schema = z.object({ email: z.string().email().max(254) });

export async function POST(request: NextRequest) {
  const { ipAddress, userAgent } = getRequestContext(request);
  const limit = rateLimit(ipAddress, { key: "auth:forgot-password", windowMs: 15 * 60_000, max: 5 });
  if (!limit.ok) {
    await emitAuditLog({ action: "failed_login", resource: "auth", ipAddress, userAgent });
    return rateLimitedResponse(limit.retryAfterSeconds);
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const user = await db.user.findUnique({ where: { email }, select: { id: true, email: true, isActive: true, status: true } });
  await emitAuditLog({ userId: user?.id, action: "password_change", resource: "auth", metadata: { email, accepted: Boolean(user?.isActive && user?.status !== "suspended") }, ipAddress, userAgent });

  return NextResponse.json({ success: true, message: "If an active GEM Enterprise account exists for that email, password reset instructions will be sent shortly." });
}
