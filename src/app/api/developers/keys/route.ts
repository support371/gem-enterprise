import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import {
  requireSession,
  getRequestContext,
  badRequest,
  serverError,
} from "@/lib/api/auth-helpers";

export async function GET() {
  const gate = await requireSession();
  if (!gate.ok) return (gate as { ok: false; response: any }).response;
  const session = gate.session;

  try {
    const keys = await db.apiKey.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        label: true,
        keyPrefix: true,
        lastUsedAt: true,
        revokedAt: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ keys });
  } catch (error) {
    console.error("[GET /api/developers/keys]", error);
    return serverError();
  }
}

const CreateSchema = z.object({
  label: z.string().trim().min(1).max(100),
});

const MAX_ACTIVE_KEYS_PER_USER = 10;

export async function POST(req: NextRequest) {
  const gate = await requireSession();
  if (!gate.ok) return (gate as { ok: false; response: any }).response;
  const session = gate.session;
  const { ipAddress, userAgent } = getRequestContext(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
  }

  try {
    const activeCount = await db.apiKey.count({
      where: { userId: session.userId, revokedAt: null },
    });
    if (activeCount >= MAX_ACTIVE_KEYS_PER_USER) {
      return NextResponse.json(
        { error: `Active key limit reached (${MAX_ACTIVE_KEYS_PER_USER}). Revoke unused keys before creating new ones.` },
        { status: 409 },
      );
    }

    // Issue a fresh secret once, hash it for at-rest storage. The plaintext
    // is returned to the caller and never persisted.
    const rawKey = `gem_${crypto.randomBytes(32).toString("hex")}`;
    const keyPrefix = rawKey.slice(0, 10);
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const key = await db.apiKey.create({
      data: {
        userId: session.userId,
        label: parsed.data.label,
        keyHash,
        keyPrefix,
      },
      select: { id: true, label: true, keyPrefix: true, createdAt: true },
    });

    await emitAuditLog({
      userId: session.userId,
      action: "admin_action",
      resource: "api_key",
      resourceId: key.id,
      metadata: { kind: "api_key_created", label: parsed.data.label, keyPrefix },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ key, plaintext: rawKey }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/developers/keys]", error);
    return serverError();
  }
}
