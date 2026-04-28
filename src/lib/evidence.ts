import { db } from "./db";
import { AuditAction } from "@prisma/client";

export type EvidenceClass =
  | "governance"
  | "interaction"
  | "decision"
  | "security"
  | "financial"
  | "legal"
  | "quality";

interface EvidenceItem {
  userId?: string;
  class: EvidenceClass;
  action: string;
  data: Record<string, any>;
  retentionYears: number;
}

export async function createEvidenceItem(item: EvidenceItem) {
  const retainUntil = new Date();
  retainUntil.setFullYear(retainUntil.getFullYear() + item.retentionYears);

  try {
    await db.auditLog.create({
      data: {
        userId: item.userId,
        action: "evidence_created" as AuditAction,
        resource: item.action,
        metadata: {
          ...item.data,
          retainUntil: retainUntil.toISOString(),
          evidenceClass: item.class
        },
      },
    });
  } catch (error) {
    console.error("[evidence] failed to create item:", error);
  }
}
