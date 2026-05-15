import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

export type ApiV1Session = Awaited<ReturnType<typeof getSessionFromRequest>>;

export function apiJson<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function unauthorized(message = "Authentication required") {
  return apiJson({ success: false, message }, { status: 401 });
}

export function forbidden(message = "Insufficient privileges") {
  return apiJson({ success: false, message }, { status: 403 });
}

export function badRequest(message = "Invalid request", details?: unknown) {
  return apiJson({ success: false, message, details }, { status: 400 });
}

export async function requireApiSession(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return { session: null, response: unauthorized() };
  return { session, response: null };
}

export async function requireAdminApiSession(request: NextRequest) {
  const { session, response } = await requireApiSession(request);
  if (!session) return { session: null, response };

  if (!["admin", "super_admin", "internal"].includes(session.role)) {
    return { session: null, response: forbidden() };
  }

  return { session, response: null };
}

export function getBearerToken(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice("Bearer ".length).trim();
}

export function requireSetupToken(request: NextRequest) {
  const expected = process.env.ADMIN_BOOTSTRAP_TOKEN;
  if (!expected) {
    return {
      ok: false,
      response: apiJson(
        { success: false, message: "ADMIN_BOOTSTRAP_TOKEN is not configured" },
        { status: 503 },
      ),
    };
  }

  const token = getBearerToken(request);
  if (!token || token !== expected) {
    return { ok: false, response: unauthorized("Invalid bootstrap token") };
  }

  return { ok: true, response: null };
}
