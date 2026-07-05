import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, resolveAccessDestination } from "@/lib/auth";

const ADMIN_PREFIXES = ["/app/admin", "/admin", "/review", "/compliance/admin"];
const PROTECTED_PREFIXES = [
  "/app",
  "/kyc",
  "/decision",
  "/portal",
  "/access",
  "/account",
  "/billing",
  "/documents",
  "/messages",
  "/requests",
  "/community-hub/members",
  "/community-hub/messages",
  "/community-hub/requests",
  "/community-hub/profile",
  "/community-hub/settings",
  "/community-hub/opportunities",
  ...ADMIN_PREFIXES,
];

const ALWAYS_PUBLIC = [
  "/",
  "/intel",
  "/assets",
  "/community",
  "/hub",
  "/about",
  "/contact",
  "/resources",
  "/services",
  "/company",
  "/get-started",
  "/eligibility",
  "/eligibility/status",
  "/request-access",
  "/privacy",
  "/terms",
  "/compliance-notice",
  "/cookie-policy",
  "/trust-center",
  "/client-login",
  "/forgot-password",
  "/reset-password",
  "/api/health",
  "/api/routes",
];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isProtected(pathname: string): boolean {
  return matchesPrefix(pathname, PROTECTED_PREFIXES);
}

function isAdminRoute(pathname: string): boolean {
  return matchesPrefix(pathname, ADMIN_PREFIXES);
}

function isAuthRoute(pathname: string): boolean {
  return pathname === "/client-login";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (ALWAYS_PUBLIC.includes(pathname)) {
    return NextResponse.next();
  }

  let session = null;
  try {
    session = await getSessionFromRequest(request);
  } catch (error) {
    console.error("[middleware] session read failed:", error);
  }

  if (isAuthRoute(pathname) && session) {
    return NextResponse.redirect(new URL(resolveAccessDestination(session), request.url));
  }

  if (isProtected(pathname)) {
    if (!session) {
      const loginUrl = new URL("/client-login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (
      isAdminRoute(pathname) &&
      !["admin", "super_admin", "internal"].includes(session.role)
    ) {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.userId);
    requestHeaders.set("x-user-email", session.email);
    requestHeaders.set("x-user-role", session.role);
    requestHeaders.set("x-kyc-status", session.kycStatus);
    requestHeaders.set("x-user-entitlements", session.entitlements.join(","));

    if (session.kycApplicationId) requestHeaders.set("x-kyc-application-id", session.kycApplicationId);
    if (session.portfolioId) requestHeaders.set("x-portfolio-id", session.portfolioId);
    if (session.organizationId) requestHeaders.set("x-organization-id", session.organizationId);
    if (pathname.startsWith("/app") || pathname.startsWith("/access")) {
      requestHeaders.set("x-is-portal", "1");
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|robots.txt|placeholder.svg).*)",
  ],
};
