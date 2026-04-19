import { NextRequest, NextResponse } from "next/server";
import { canonicalRoutes, legacyRedirects } from "@/lib/siteRoutes";

export async function GET(_request: NextRequest) {
  const protectedCount = canonicalRoutes.filter((r) => r.requiresAuth).length;
  const publicCount = canonicalRoutes.filter((r) => r.isPublic).length;
  const adminCount = canonicalRoutes.filter((r) => r.requiresAdmin).length;

  return NextResponse.json({
    canonical: canonicalRoutes,
    legacy: legacyRedirects,
    totals: {
      canonical: canonicalRoutes.length,
      protected: protectedCount,
      public: publicCount,
      admin: adminCount,
      legacy: legacyRedirects.length,
    },
    generated: new Date().toISOString(),
    version: "1.0.0",
  });
}
