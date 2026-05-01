import { db } from "./db";
import { AuditAction } from "@prisma/client";

interface AuditEntry {
  userId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function emitAuditLog(entry: AuditEntry) {
  if (process.env.AUDIT_ENABLED !== "true") return;

  try {
    await db.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        metadata: entry.metadata ?? undefined,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    });
  } catch (error) {
    console.error("[audit] failed to emit log:", error);
  }
}
