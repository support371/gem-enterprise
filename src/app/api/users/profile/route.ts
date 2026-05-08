import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import {
  requireSession,
  getRequestContext,
  badRequest,
  serverError,
} from "@/lib/api/auth-helpers";

// ─── GET /api/users/profile ───────────────────────────────────────────────────

export async function GET() {
  const gate = await requireSession();
  if (!gate.ok) return (gate as { ok: false; response: any }).response;
  const session = gate.session;

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        profile: true,
        kycApplications: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { status: true, entityType: true, submittedAt: true, completedAt: true },
        },
      },
    });
    if (!user) return badRequest("User not found");

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      profile: user.profile,
      kycStatus: user.kycApplications[0]?.status ?? null,
      kyc: user.kycApplications[0] ?? null,
    });
  } catch (error) {
    console.error("[GET /api/users/profile]", error);
    return serverError();
  }
}

// ─── PATCH /api/users/profile ─────────────────────────────────────────────────
//
// Allow-list of editable profile fields. Anything not explicitly listed here
// (role, status, isActive, organizationId, etc.) cannot be changed via this
// endpoint. We do not expose `accreditedStatus` for self-edit because that
// must be set by KYC review.

const profilePatchSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    displayName: z.string().trim().min(1).max(120).optional(),
    bio: z.string().max(2_000).optional(),
    country: z
      .string()
      .trim()
      .min(2)
      .max(56)
      .optional(),
    phone: z
      .string()
      .trim()
      .min(5)
      .max(32)
      .regex(/^[+0-9 ()-]+$/, "Phone may contain digits, spaces, +, -, and ()")
      .optional(),
    avatarUrl: z.string().url().max(2_000).optional(),
    preferences: z.record(z.unknown()).optional(),
  })
  .strict();

export async function PATCH(req: NextRequest) {
  const gate = await requireSession();
  if (!gate.ok) return (gate as { ok: false; response: any }).response;
  const session = gate.session;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
  }
  const data = parsed.data;
  if (Object.keys(data).length === 0) {
    return badRequest("No editable fields provided");
  }

  const { ipAddress, userAgent } = getRequestContext(req);

  try {
    const profile = await db.profile.upsert({
      where: { userId: session.userId },
      update: data as any,
      create: { ...data, userId: session.userId } as any,
    });

    await emitAuditLog({
      userId: session.userId,
      action: "admin_action", // schema lacks profile_update; admin_action covers self-mutation
      resource: "profile",
      resourceId: profile.id,
      metadata: { fields: Object.keys(data) },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("[PATCH /api/users/profile]", error);
    return serverError();
  }
}
