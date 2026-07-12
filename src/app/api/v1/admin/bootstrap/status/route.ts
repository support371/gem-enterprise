import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  bootstrapGatewayStatus,
  GatewayRequestError,
  shouldUseSupabaseGateway,
} from "@/lib/supabase-gateway";

export const dynamic = "force-dynamic";

function response(admin: {
  email: string;
  role: string;
  status: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string | Date;
} | null) {
  return NextResponse.json(
    {
      configured: Boolean(admin),
      admin,
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
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  if (shouldUseSupabaseGateway()) {
    try {
      const result = await bootstrapGatewayStatus<{
        configured: boolean;
        admin: {
          email: string;
          role: string;
          status: string;
          isActive: boolean;
          isEmailVerified: boolean;
          createdAt: string;
        } | null;
      }>();
      return response(result.admin);
    } catch (error) {
      if (error instanceof GatewayRequestError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode, headers: { "Cache-Control": "no-store" } },
        );
      }
    }
  }

  try {
    const admin = await db.user.findFirst({
      where: {
        role: { in: ["admin", "super_admin", "internal"] },
        isActive: true,
      },
      select: {
        email: true,
        role: true,
        status: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });
    return response(admin);
  } catch {
    return NextResponse.json(
      { error: "Administrator status is unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
