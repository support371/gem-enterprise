/**
 * Shared API auth helpers.
 *
 * Gateway sessions are revalidated by Supabase on every protected request.
 * Local JWT sessions retain the existing Prisma authority reconciliation.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession, type AuthRole, type SessionPayload } from "@/lib/auth";
import { db } from "@/lib/db";
import { reconcileSessionAuthority } from "@/lib/auth-authority";

const ADMIN_ROLES: ReadonlyArray<string> = ["admin", "super_admin", "internal"];
const STAFF_ROLES: ReadonlyArray<string> = ["analyst", "admin", "super_admin", "internal"];
const ASSIGNABLE_ROLES: ReadonlyArray<string> = ["client", "analyst", "admin"];

export function isAdminRole(role: string | undefined | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

export function isPlatformOwnerRole(role: string | undefined | null): boolean {
  return role === "super_admin";
}

export function isStaffRole(role: string | undefined | null): boolean {
  return !!role && STAFF_ROLES.includes(role);
}

export function isAssignableRole(role: string): role is "client" | "analyst" | "admin" {
  return ASSIGNABLE_ROLES.includes(role);
}

export interface RequestContext {
  ipAddress: string;
  userAgent: string;
}

export function getRequestContext(request: Request | NextRequest): RequestContext {
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  return { ipAddress, userAgent };
}

function response(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function unauthorized(message = "Unauthorized") {
  return response({ error: message }, 401);
}

export function forbidden(message = "Forbidden", code?: string) {
  return response(code ? { error: message, code } : { error: message }, 403);
}

export function badRequest(message: string, details?: unknown) {
  return response(details ? { error: message, details } : { error: message }, 400);
}

export function serverError(message = "Internal server error") {
  return response({ error: message }, 500);
}

export function serviceUnavailable(message = "Authorization service unavailable") {
  return response({ error: message }, 503);
}

export type GateOk = {
  ok: true;
  session: SessionPayload;
  accountStatus: "active" | "suspended" | "pending_approval";
  claimsChanged: boolean;
  response?: never;
};
export type GateErr = { ok: false; response: NextResponse; session?: never };
export type GateResult = GateOk | GateErr;

function ok(input: Omit<GateOk, "ok">): GateOk {
  return { ok: true, ...input };
}

function err(responseValue: NextResponse): GateErr {
  return { ok: false, response: responseValue };
}

async function resolveAuthoritativeGate(): Promise<GateResult> {
  const claims = await getSession();
  if (!claims) return err(unauthorized());

  if (claims.authSource === "supabase_gateway") {
    return ok({
      session: claims,
      accountStatus: "active",
      claimsChanged: false,
    });
  }

  try {
    const account = await db.user.findUnique({
      where: { id: claims.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        organizationId: true,
      },
    });

    const authority = reconcileSessionAuthority(claims, account);
    if (authority.ok === false) {
      return err(
        response(
          { error: authority.message, code: authority.code },
          authority.statusCode,
        ),
      );
    }

    return ok({
      session: authority.session,
      accountStatus: authority.accountStatus,
      claimsChanged: authority.claimsChanged,
    });
  } catch (error) {
    console.error("[auth-authority] account reconciliation failed", error);
    return err(serviceUnavailable());
  }
}

export async function requireSession(): Promise<GateResult> {
  return resolveAuthoritativeGate();
}

export async function requireAdmin(): Promise<GateResult> {
  const gate = await resolveAuthoritativeGate();
  if (!gate.ok) return gate;
  if (gate.accountStatus !== "active") {
    return err(forbidden("An active account is required for administrator access."));
  }
  if (!isAdminRole(gate.session.role)) return err(forbidden());
  return gate;
}

export async function requirePlatformOwner(): Promise<GateResult> {
  const gate = await resolveAuthoritativeGate();
  if (!gate.ok) return gate;
  if (gate.accountStatus !== "active") {
    return err(forbidden("An active account is required for platform owner access."));
  }
  if (!isPlatformOwnerRole(gate.session.role)) {
    return err(
      forbidden(
        "Platform Owner access is required.",
        "PLATFORM_OWNER_REQUIRED",
      ),
    );
  }
  return gate;
}

export async function requireStaff(): Promise<GateResult> {
  const gate = await resolveAuthoritativeGate();
  if (!gate.ok) return gate;
  if (gate.accountStatus !== "active") {
    return err(forbidden("An active account is required for reviewer access."));
  }
  if (!isStaffRole(gate.session.role)) return err(forbidden());
  return gate;
}

export type { AuthRole, SessionPayload };
