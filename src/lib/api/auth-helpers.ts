/**
 * Shared API auth helpers.
 *
 * Centralizes role checks, request-context extraction, and standard error
 * responses so route handlers don't drift on security semantics.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession, type AuthRole, type SessionPayload } from "@/lib/auth";

// ─── Role gates ───────────────────────────────────────────────────────────────
//
// The Prisma schema defines five roles (client, analyst, admin, super_admin,
// internal). Per AGENTS.md rule 7, super_admin and internal must never be
// granted via the API, but they retain admin-level read/write access.

const ADMIN_ROLES: ReadonlyArray<string> = ["admin", "super_admin", "internal"];
const STAFF_ROLES: ReadonlyArray<string> = ["analyst", "admin", "super_admin", "internal"];
const ASSIGNABLE_ROLES: ReadonlyArray<string> = ["client", "analyst", "admin"];

export function isAdminRole(role: string | undefined | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

export function isStaffRole(role: string | undefined | null): boolean {
  return !!role && STAFF_ROLES.includes(role);
}

export function isAssignableRole(role: string): role is "client" | "analyst" | "admin" {
  return ASSIGNABLE_ROLES.includes(role);
}

// ─── Request context ──────────────────────────────────────────────────────────

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

// ─── Standard responses ───────────────────────────────────────────────────────

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    details ? { error: message, details } : { error: message },
    { status: 400 },
  );
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

// ─── Composite gates ──────────────────────────────────────────────────────────

export type GateOk = { ok: true; session: SessionPayload; response?: never };
export type GateErr = { ok: false; response: NextResponse; session?: never };
export type GateResult = GateOk | GateErr;

/**
 * Resolve the current session and return either the session or a 401 response.
 * Always prefer this over reading getSession() directly so routes share the
 * same error semantics.
 */
function ok(session: SessionPayload): GateOk {
  return { ok: true, session };
}

function err(response: NextResponse): GateErr {
  return { ok: false, response };
}

export async function requireSession(): Promise<GateResult> {
  const session = await getSession();
  if (!session) return err(unauthorized());
  return ok(session);
}

/**
 * Require a session AND admin-level role.
 * Returns 401 when unauthenticated, 403 when authenticated but not authorized.
 */
export async function requireAdmin(): Promise<GateResult> {
  const session = await getSession();
  if (!session) return err(unauthorized());
  if (!isAdminRole(session.role)) return err(forbidden());
  return ok(session);
}

/**
 * Require a session AND staff-level role (analyst, admin, super_admin, internal).
 */
export async function requireStaff(): Promise<GateResult> {
  const session = await getSession();
  if (!session) return err(unauthorized());
  if (!isStaffRole(session.role)) return err(forbidden());
  return ok(session);
}

// Re-export for convenience so route handlers don't need two imports.
export type { AuthRole, SessionPayload };
