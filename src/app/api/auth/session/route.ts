import { NextRequest, NextResponse } from "next/server";
import { resolveAccessDestination } from "@/lib/auth";
import { requireSession } from "@/lib/api/auth-helpers";
import { platformSurfaces, resolvePreferredSurface } from "@/lib/platformNavigation";

export async function GET(_request: NextRequest) {
  try {
    const gate = await requireSession();
    if (!gate.ok) return gate.response;

    const session = gate.session;
    const recommendedPath = resolveAccessDestination(session);
    const preferredSurface = resolvePreferredSurface(recommendedPath);

    return NextResponse.json(
      {
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
        reauthenticationRecommended: gate.claimsChanged,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[GET /api/auth/session]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
