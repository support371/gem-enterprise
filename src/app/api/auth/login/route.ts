import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  signSession,
  setSessionCookie,
  resolveAccessDestination,
  SessionPayload,
} from "@/lib/auth";
import { emitAuditLog } from "@/lib/audit";
import { getRequestContext } from "@/lib/api/auth-helpers";
import { rateLimit, rateLimitedResponse } from "@/lib/api/rate-limit";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(254),
  password: z.string().min(1, "Password is required").max(256),
});

const INVALID_CREDENTIALS = { error: "Invalid credentials" };

export async function POST(request: NextRequest) {
  const { ipAddress, userAgent } = getRequestContext(request);

  // Rate limit per-IP: 10 attempts / 5 minutes. Best-effort (in-memory).
  const limit = rateLimit(ipAddress, {
    key: "auth:login",
    windowMs: 5 * 60_000,
    max: 10,
  });
  if (!limit.ok) {
    await emitAuditLog({
      action: "failed_login",
      resource: "auth",
      metadata: { reason: "rate_limited" },
      ipAddress,
      userAgent,
    });
    return rateLimitedResponse(limit.retryAfterSeconds);
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: true,
        entitlements: { where: { isActive: true } },
        kycApplications: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        portfolioMemberships: {
          take: 1,
          orderBy: { assignedAt: "desc" },
        },
      },
    });

    // Always run a bcrypt compare to mitigate user-enumeration via timing.
    // We use a placeholder hash for missing users so the compare cost is
    // similar in both branches.
    const placeholderHash =
      "$2a$12$C6UzMDM.H6dfI/f/IKxGhuM6NXk0RvPhgZQ1.0Y8wIJtZk4jAr8s2";
    const passwordValid = await bcrypt.compare(
      password,
      user?.passwordHash ?? placeholderHash,
    );

    if (!user || !passwordValid) {
      await emitAuditLog({
        userId: user?.id,
        action: "failed_login",
        resource: "auth",
        metadata: {
          email: email.toLowerCase(),
          reason: !user ? "unknown_user" : "bad_password",
        },
        ipAddress,
        userAgent,
      });
      return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });
    }

    if (!user.isActive || user.status === "suspended") {
      await emitAuditLog({
        userId: user.id,
        action: "failed_login",
        resource: "auth",
        metadata: { email: user.email, reason: "suspended" },
        ipAddress,
        userAgent,
      });
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    const latestKyc = user.kycApplications[0] ?? null;
    const kycStatus = (latestKyc?.status ?? "not_started") as SessionPayload["kycStatus"];
    const entitlementSlugs = user.entitlements.map((e) => e.slug);
    const portfolioId = user.portfolioMemberships[0]?.portfolioId ?? undefined;

    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as SessionPayload["role"],
      kycStatus,
      kycApplicationId: latestKyc?.id ?? undefined,
      entitlements: entitlementSlugs,
      portfolioId,
      organizationId: user.organizationId ?? undefined,
    };

    const token = await signSession(sessionPayload);
    const redirect = resolveAccessDestination(sessionPayload);

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await emitAuditLog({
      userId: user.id,
      action: "login",
      resource: "user",
      resourceId: user.id,
      metadata: { email: user.email },
      ipAddress,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      role: sessionPayload.role,
      kycStatus: sessionPayload.kycStatus,
      redirect,
    });

    return setSessionCookie(response, token);
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
