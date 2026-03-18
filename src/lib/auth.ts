import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// ── JWT secret validation ──────────────────────────────────────────────────────
// In production, JWT_SECRET must be set explicitly. A hardcoded fallback would
// allow session forgery if the variable is accidentally unset.
// Validation is deferred to first use so Next.js build-time imports don't fail
// when environment variables are not available during static analysis.
const DEFAULT_DEV_SECRET = "gem-enterprise-dev-secret-change-in-production";

let _jwtSecret: Uint8Array | null = null;

function getJwtSecret(): Uint8Array {
  if (_jwtSecret) return _jwtSecret;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET environment variable is required in production. " +
          "Generate one with: openssl rand -hex 32"
      );
    }
    _jwtSecret = new TextEncoder().encode(DEFAULT_DEV_SECRET);
    return _jwtSecret;
  }
  if (secret === DEFAULT_DEV_SECRET && process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET must not use the default development value in production."
    );
  }
  if (secret.length < 32 && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be at least 32 characters in production.");
  }
  _jwtSecret = new TextEncoder().encode(secret);
  return _jwtSecret;
}

const COOKIE_NAME = "gem_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export type AuthRole = "client" | "admin" | "internal";

export type KYCStatus =
  | "not_started"
  | "started"
  | "in_progress"
  | "documents_uploaded"
  | "under_review"
  | "manual_review"
  | "approved"
  | "rejected"
  | "expired";

export interface SessionPayload {
  userId: string;
  email: string;
  role: AuthRole;
  kycStatus: KYCStatus;
  kycApplicationId?: string;
  entitlements: string[];
  portfolioId?: string;
  organizationId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  session: SessionPayload | null;
  isAdmin: boolean;
  isApproved: boolean;
  kycStatus: KYCStatus;
}

// ─── JWT Operations ───────────────────────────────────────────────────────────

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getJwtSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Cookie Operations ────────────────────────────────────────────────────────

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function createSessionCookie(payload: SessionPayload): Promise<string> {
  return signSession(payload);
}

export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}

// ─── Middleware Session Read ───────────────────────────────────────────────────

export async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

// ─── Auth State Helper ────────────────────────────────────────────────────────

export function resolveAuthState(session: SessionPayload | null): AuthState {
  if (!session) {
    return {
      isAuthenticated: false,
      session: null,
      isAdmin: false,
      isApproved: false,
      kycStatus: "not_started",
    };
  }

  return {
    isAuthenticated: true,
    session,
    isAdmin: session.role === "admin" || session.role === "internal",
    isApproved: session.kycStatus === "approved",
    kycStatus: session.kycStatus,
  };
}

// ─── Access Bridge Logic ──────────────────────────────────────────────────────

export function resolveAccessDestination(session: SessionPayload): string {
  const { kycStatus, role, entitlements, portfolioId } = session;

  // Admin goes directly to admin
  if (role === "admin" || role === "internal") {
    return "/app/admin";
  }

  // KYC state routing
  switch (kycStatus) {
    case "not_started":
      return "/kyc/start";
    case "started":
    case "in_progress":
    case "documents_uploaded":
      return "/kyc/status";
    case "under_review":
      return "/decision/pending";
    case "manual_review":
      return "/decision/manual-review";
    case "rejected":
    case "expired":
      return "/decision/rejected";
    case "approved":
      break;
    default:
      return "/kyc/start";
  }

  // Approved — route by entitlement
  if (portfolioId) {
    return `/app/portfolios/${portfolioId}`;
  }
  if (entitlements.includes("cyber")) {
    return "/app/products/cyber";
  }
  if (entitlements.includes("financial")) {
    return "/app/products/financial";
  }
  if (entitlements.includes("real-estate")) {
    return "/app/products/real-estate";
  }

  return "/app/dashboard";
}
