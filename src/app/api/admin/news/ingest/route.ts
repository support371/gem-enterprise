import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { runNewsIngestion } from "@/lib/news/ingest";
import {
  requireAdmin,
  getRequestContext,
  badRequest,
  serverError,
} from "@/lib/api/auth-helpers";

// ─── GET /api/admin/news/ingest ───────────────────────────────────────────────

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const runs = await db.newsIngestionRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ runs });
  } catch (error) {
    console.error("[GET /api/admin/news/ingest]", error);
    return serverError();
  }
}

// ─── POST /api/admin/news/ingest ──────────────────────────────────────────────

const triggerSchema = z
  .object({
    sourceIds: z.array(z.string().min(1)).optional(),
  })
  .partial();

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const session = gate.session;
  const { ipAddress, userAgent } = getRequestContext(request);

  // Body is optional; tolerate empty/non-JSON bodies.
  let parsed: { sourceIds?: string[] } = {};
  try {
    const text = await request.text();
    if (text.trim().length > 0) {
      const body = JSON.parse(text);
      const result = triggerSchema.safeParse(body ?? {});
      if (!result.success) {
        return badRequest("Validation failed", result.error.flatten().fieldErrors);
      }
      parsed = result.data;
    }
  } catch {
    return badRequest("Invalid JSON");
  }

  try {
    const result = await runNewsIngestion({
      triggeredBy: `admin:${session.userId}`,
      sourceIds: parsed.sourceIds,
    });

    // Metadata must be a JSON object — never JSON.stringify (Prisma expects
    // Json input). Persist a structured payload for downstream observability.
    await emitAuditLog({
      userId: session.userId,
      action: "admin_action",
      resource: "news_ingestion_run",
      resourceId: result.runId,
      metadata: {
        trigger: "manual",
        scopedSourceIds: parsed.sourceIds ?? null,
        status: result.status,
        sourcesAttempted: result.sourcesAttempted,
        sourcesSucceeded: result.sourcesSucceeded,
        sourcesFailed: result.sourcesFailed,
        articlesCreated: result.articlesCreated,
        articlesUpdated: result.articlesUpdated,
        articlesSkipped: result.articlesSkipped,
        durationMs: result.durationMs,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[POST /api/admin/news/ingest]", error);
    return serverError("News ingestion failed");
  }
}
