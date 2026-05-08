import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import {
  requireAdmin,
  getRequestContext,
  badRequest,
  serverError,
} from "@/lib/api/auth-helpers";

// ─── GET /api/admin/news/sources ──────────────────────────────────────────────

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return (gate as { ok: false; response: any }).response;

  try {
    const sources = await db.newsSource.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { articles: true } },
      },
    });
    return NextResponse.json({ sources });
  } catch (error) {
    console.error("[GET /api/admin/news/sources]", error);
    return serverError();
  }
}

// ─── PATCH /api/admin/news/sources ────────────────────────────────────────────
//
// Admin console toggles a source on/off and (optionally) tunes its poll
// interval. We accept the canonical `sourceId` key the admin page sends and
// also tolerate the legacy `id` alias so older clients keep working.

const patchSchema = z
  .object({
    sourceId: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
    pollIntervalMinutes: z.number().int().min(5).max(7 * 24 * 60).optional(),
  })
  .refine((v) => v.sourceId || v.id, {
    message: "sourceId is required",
  })
  .refine((v) => v.isActive !== undefined || v.pollIntervalMinutes !== undefined, {
    message: "Provide isActive or pollIntervalMinutes",
  });

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return (gate as { ok: false; response: any }).response;
  const session = gate.session;
  const { ipAddress, userAgent } = getRequestContext(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
  }

  const sourceId = parsed.data.sourceId ?? parsed.data.id!;
  const data: { isActive?: boolean; pollIntervalMinutes?: number } = {};
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;
  if (parsed.data.pollIntervalMinutes !== undefined) {
    data.pollIntervalMinutes = parsed.data.pollIntervalMinutes;
  }

  try {
    const existing = await db.newsSource.findUnique({
      where: { id: sourceId },
      select: { id: true, name: true, isActive: true, pollIntervalMinutes: true },
    });
    if (!existing) return badRequest("News source not found");

    const updated = await db.newsSource.update({ where: { id: sourceId }, data });

    await emitAuditLog({
      userId: session.userId,
      action: "admin_action",
      resource: "news_source",
      resourceId: sourceId,
      metadata: {
        name: existing.name,
        previousIsActive: existing.isActive,
        newIsActive: data.isActive,
        previousPollInterval: existing.pollIntervalMinutes,
        newPollInterval: data.pollIntervalMinutes,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ ok: true, source: updated });
  } catch (error) {
    console.error("[PATCH /api/admin/news/sources]", error);
    return serverError();
  }
}
