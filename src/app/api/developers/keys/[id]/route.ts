import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import {
  requireSession,
  getRequestContext,
  serverError,
} from "@/lib/api/auth-helpers";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireSession();
  if (!gate.ok) return (gate as { ok: false; response: any }).response;
  const session = gate.session;
  const { ipAddress, userAgent } = getRequestContext(req);

  const { id } = await params;

  try {
    const key = await db.apiKey.findFirst({
      where: { id, userId: session.userId },
      select: { id: true, label: true, keyPrefix: true, revokedAt: true },
    });
    if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (key.revokedAt) {
      return NextResponse.json({ error: "Already revoked" }, { status: 409 });
    }

    await db.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    await emitAuditLog({
      userId: session.userId,
      action: "admin_action",
      resource: "api_key",
      resourceId: id,
      metadata: { kind: "api_key_revoked", label: key.label, keyPrefix: key.keyPrefix },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/developers/keys/[id]]", error);
    return serverError();
  }
}
