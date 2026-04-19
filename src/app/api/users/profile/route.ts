import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const profilePatchSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  displayName: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  country: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  dateOfBirth: z.string().datetime().optional(),
  taxId: z.string().max(50).optional(),
  accreditedStatus: z.boolean().optional(),
});

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      profile: user.profile,
    });
  } catch (error) {
    console.error("[GET /api/users/profile]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profilePatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const profile = await db.userProfile.upsert({
      where: { userId: session.userId },
      update: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.zipCode !== undefined && { zipCode: data.zipCode }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.dateOfBirth !== undefined && {
          dateOfBirth: new Date(data.dateOfBirth),
        }),
        ...(data.taxId !== undefined && { taxId: data.taxId }),
        ...(data.accreditedStatus !== undefined && {
          accreditedStatus: data.accreditedStatus,
        }),
      },
      create: {
        userId: session.userId,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        displayName: data.displayName ?? null,
        phone: data.phone ?? null,
        country: data.country ?? null,
        state: data.state ?? null,
        city: data.city ?? null,
        zipCode: data.zipCode ?? null,
        address: data.address ?? null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        taxId: data.taxId ?? null,
        accreditedStatus: data.accreditedStatus ?? false,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("[PATCH /api/users/profile]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
