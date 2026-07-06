import type { Env } from "../types/env.js";

interface AuditParams {
  db: D1Database;
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function emitAuditLog(params: AuditParams): Promise<void> {
  try {
    await params.db
      .prepare(
        `INSERT INTO audit_logs (id, user_id, action, resource, resource_id, metadata, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        params.userId ?? null,
        params.action,
        params.resource ?? null,
        params.resourceId ?? null,
        params.metadata ? JSON.stringify(params.metadata) : null,
        params.ipAddress ?? null,
        params.userAgent ?? null,
        new Date().toISOString(),
      )
      .run();
  } catch (error) {
    console.error("[audit] failed to emit log:", error);
  }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
