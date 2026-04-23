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

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: true,
        entitlements: {
          where: { isActive: true },
        },
        kycApplications: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        portfolios: {
          take: 1,
          orderBy: { assignedAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    const latestKyc = user.kycApplications[0] ?? null;
    const kycStatus = (latestKyc?.status ?? "not_started") as SessionPayload["kycStatus"];
    const entitlementSlugs = user.entitlements.map((e) => e.slug);
    const portfolioId = user.portfolios[0]?.portfolioId ?? undefined;

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

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    await Promise.all([
      db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
      db.auditLog.create({
        data: {
          userId: user.id,
          action: "login",
          resource: "user",
          resourceId: user.id,
          metadata: { email: user.email },
          ipAddress,
          userAgent,
        },
      }),
    ]);

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
