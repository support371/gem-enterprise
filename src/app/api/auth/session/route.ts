import { NextRequest, NextResponse } from "next/server";
import { getSession, resolveAccessDestination } from "@/lib/auth";
import { platformSurfaces, resolvePreferredSurface } from "@/lib/platformNavigation";

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          preferredSurface: "marketing-mobile",
          recommendedPath: "/",
          availableSurfaces: platformSurfaces,
        },
        { status: 401 },
      );
    }

    const recommendedPath = resolveAccessDestination(session);
    const preferredSurface = resolvePreferredSurface(recommendedPath);

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
      preferredSurface,
      recommendedPath,
      availableSurfaces: platformSurfaces,
    });
  } catch (error) {
    console.error("[GET /api/auth/session]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
