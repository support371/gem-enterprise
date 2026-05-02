import { NextRequest, NextResponse } from "next/server";
import { canonicalRoutes, legacyRedirects, navigationMenu } from "@/lib/siteRoutes";
import {
  adminPortalNavItems,
  clientPortalNavGroups,
  platformBrandContract,
  platformSurfaces,
} from "@/lib/platformNavigation";

export async function GET(_request: NextRequest) {
  const protectedCount = canonicalRoutes.filter((r) => r.requiresAuth).length;
  const publicCount = canonicalRoutes.filter((r) => r.isPublic).length;
  const adminCount = canonicalRoutes.filter((r) => r.requiresAdmin).length;

  return NextResponse.json({
    canonical: canonicalRoutes,
    legacy: legacyRedirects,
    platform: {
      brand: platformBrandContract,
      surfaces: platformSurfaces,
      navigation: {
        marketing: navigationMenu,
        portal: {
          client: clientPortalNavGroups,
          admin: adminPortalNavItems,
        },
      },
      endpoints: {
        session: "/api/auth/session",
        routes: "/api/routes",
      },
    },
    totals: {
      canonical: canonicalRoutes.length,
      protected: protectedCount,
      public: publicCount,
      admin: adminCount,
      legacy: legacyRedirects.length,
    },
    generated: new Date().toISOString(),
    version: "1.1.0",
  });
}
