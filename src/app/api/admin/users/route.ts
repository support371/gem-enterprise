import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

function isAdmin(role: string) {
  return role === "admin" || role === "internal";
}

const userPatchSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  isActive: z.boolean().optional(),
  role: z.enum(["client", "admin", "internal", "analyst"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const roleParam = searchParams.get("role") ?? "";

    const where = {
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" as const } },
              {
                profile: {
                  OR: [
                    { firstName: { contains: search, mode: "insensitive" as const } },
                    { lastName: { contains: search, mode: "insensitive" as const } },
                  ],
                },
              },
            ],
          }
        : {}),
      ...(roleParam && ["client", "admin", "internal", "analyst"].includes(roleParam)
        ? { role: roleParam as "client" | "admin" | "internal" | "analyst" }
        : {}),
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          organizationId: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              displayName: true,
              phone: true,
              country: true,
              entityType: true,
            },
          },
          kycApplications: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              status: true,
              entityType: true,
              submittedAt: true,
              createdAt: true,
            },
          },
          entitlements: {
            where: { isActive: true },
            select: { id: true, slug: true, grantedAt: true },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({ users, total });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = userPatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userId, isActive, role } = parsed.data;

    if (isActive === undefined && role === undefined) {
      return NextResponse.json(
        { error: "At least one field to update is required (isActive or role)" },
        { status: 400 }
      );
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(role !== undefined && { role }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "user_updated",
        resource: "user",
        resourceId: userId,
        metadata: {
          changes: {
            ...(isActive !== undefined && { isActive }),
            ...(role !== undefined && { role }),
          },
          previousState: {
            isActive: targetUser.isActive,
            role: targetUser.role,
          },
        },
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("[PATCH /api/admin/users]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
