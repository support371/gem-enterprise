import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await db.user.findFirst({
    where: {
      role: {
        in: ["admin", "super_admin", "internal"],
      },
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      isActive: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    configured: Boolean(admin),
    admin: admin
      ? {
          email: admin.email,
          role: admin.role,
          status: admin.status,
          isActive: admin.isActive,
          isEmailVerified: admin.isEmailVerified,
          createdAt: admin.createdAt,
        }
      : null,
    nextSteps: admin
      ? [
          "Sign in at /client-login.",
          "Admin accounts route to /app/admin after authentication.",
          "Keep SMTP and owner alert variables configured for request-access notifications.",
        ]
      : [
          "Create the first owner account using a protected database seed or one-time platform console action.",
          "Set role to super_admin, status to active, isActive to true, and isEmailVerified to true.",
          "After first login, rotate any temporary setup secret and configure SMTP owner alerts.",
        ],
  });
}
