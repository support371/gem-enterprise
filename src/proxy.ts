import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, resolveAccessDestination } from "@/lib/auth";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/app", "/kyc", "/decision", "/portal", "/access"];

// Routes that require admin role
const ADMIN_PREFIXES = ["/app/admin"];

// Public routes (always accessible, no redirect even if authenticated)
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
  "/privacy",
  "/terms",
  "/compliance-notice",
  "/client-login",
  "/api/health",
  "/api/routes",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAuthRoute(pathname: string): boolean {
  return pathname === "/client-login";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API and static routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Wrap session resolution so a misconfigured JWT_SECRET never crashes the
  // middleware and results in a 500 for every request. On error we treat the
  // request as unauthenticated and let the normal route logic handle it.
  let session = null;
  try {
    session = await getSessionFromRequest(request);
  } catch (err) {
    console.error("[middleware] session read failed:", err);
    // Fall through — session remains null, protected routes will redirect to login
  }

  // Redirect authenticated users away from login page
  if (isAuthRoute(pathname) && session) {
    const dest = resolveAccessDestination(session);
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Protected route checks
  if (isProtected(pathname)) {
    if (!session) {
      const loginUrl = new URL("/client-login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session exists — check admin requirement
    if (isAdminRoute(pathname)) {
      if (session.role !== "admin" && session.role !== "internal") {
        return NextResponse.redirect(new URL("/app/dashboard", request.url));
      }
    }

    // Inject session info into request headers so server components can read
    // them via headers(). Setting them on the response would not be visible to
    // downstream server components.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.userId);
    requestHeaders.set("x-user-role", session.role);
    requestHeaders.set("x-kyc-status", session.kycStatus);
    // Tell the root layout to suppress marketing nav/footer on portal pages
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
