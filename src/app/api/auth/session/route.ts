import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      userId: session.userId,
      email: session.email,
      role: session.role,
      kycStatus: session.kycStatus,
      entitlements: session.entitlements,
      kycApplicationId: session.kycApplicationId ?? null,
      portfolioId: session.portfolioId ?? null,
      organizationId: session.organizationId ?? null,
    });
  } catch (error) {
    console.error("[GET /api/auth/session]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
