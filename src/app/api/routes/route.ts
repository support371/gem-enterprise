import { NextRequest, NextResponse } from "next/server";
import {
  canonicalRoutes,
  legacyRedirects,
  navigationMenu,
  type SiteRoute,
} from "@/lib/siteRoutes";
import {
  adminPortalNavItems,
  clientPortalNavGroups,
  platformBrandContract,
  platformSurfaces,
} from "@/lib/platformNavigation";

const complianceRecoveryRoutes: SiteRoute[] = [
  {
    path: "/cookie-policy",
    label: "Cookie Policy",
    category: "compliance",
    description: "Cookie categories, purposes, security controls, and consent choices",
    isPublic: true,
    isCanonical: true,
    menuGroup: "none",
    owner: "legal",
    showInFooter: true,
  },
  {
    path: "/trust-center",
    label: "Trust Center",
    category: "compliance",
    description: "Security controls, compliance alignment, and responsible disclosure",
    isPublic: true,
    isCanonical: true,
    menuGroup: "company",
    owner: "security",
    showInFooter: true,
  },
  {
    path: "/forgot-password",
    label: "Forgot Password",
    category: "auth",
    description: "Non-enumerating account recovery request",
    isPublic: true,
    isCanonical: true,
    menuGroup: "none",
    owner: "auth",
  },
  {
    path: "/reset-password",
    label: "Reset Password",
    category: "auth",
    description: "Time-limited signed password reset completion",
    isPublic: true,
    isCanonical: true,
    menuGroup: "none",
    owner: "auth",
  },
];

export async function GET(_request: NextRequest) {
  const registeredPaths = new Set(canonicalRoutes.map((route) => route.path));
  const canonical = [
    ...canonicalRoutes,
    ...complianceRecoveryRoutes.filter((route) => !registeredPaths.has(route.path)),
  ];
  const legacy = legacyRedirects.filter((redirect) => redirect.source !== "/trust-center");
  const protectedCount = canonical.filter((route) => route.requiresAuth).length;
  const publicCount = canonical.filter((route) => route.isPublic).length;
  const adminCount = canonical.filter((route) => route.requiresAdmin).length;

  return NextResponse.json({
    canonical,
    legacy,
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
      canonical: canonical.length,
      protected: protectedCount,
      public: publicCount,
      admin: adminCount,
      legacy: legacy.length,
    },
    generated: new Date().toISOString(),
    version: "1.2.0",
  });
}
