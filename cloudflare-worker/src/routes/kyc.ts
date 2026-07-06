import { Hono } from "hono";
import { z } from "zod";
import type { Env, SessionPayload } from "../types/env.js";
import { authMiddleware, getSession, requireRole } from "../middleware/auth.js";
import { emitAuditLog, getClientIp } from "../middleware/audit.js";

type HonoEnv = { Bindings: Env; Variables: { session: SessionPayload } };

const kyc = new Hono<HonoEnv>();

kyc.use("/*", authMiddleware);

const kycWebhookSchema = z.object({
  event: z.enum([
    "kyc.submitted",
    "kyc.approved",
    "kyc.rejected",
    "kyc.expired",
    "kyc.documents_uploaded",
    "kyc.review_requested",
  ]),
  applicationId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

// POST /api/kyc/webhook — receive KYC status change events
kyc.post("/webhook", requireRole("admin", "super_admin", "internal"), async (c) => {
  const body = kycWebhookSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ success: false, error: "Invalid webhook payload", timestamp: new Date().toISOString() }, 400);
  }

  const session = getSession(c);
  const { event, applicationId, userId, status, metadata } = body.data;

  await c.env.DB.prepare(
    `INSERT INTO kyc_events (id, application_id, user_id, event, status, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      crypto.randomUUID(),
      applicationId,
      userId,
      event,
      status,
      metadata ? JSON.stringify(metadata) : null,
      new Date().toISOString(),
    )
    .run();

  await emitAuditLog({
    db: c.env.DB,
    userId: session.userId,
    action: "kyc_webhook",
    resource: "kyc_application",
    resourceId: applicationId,
    metadata: { event, status },
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header("User-Agent"),
  });

  return c.json({
    success: true,
    data: { event, applicationId, processed: true },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/kyc/status/:applicationId — check KYC application status
kyc.get("/status/:applicationId", async (c) => {
  const applicationId = c.req.param("applicationId");
  const session = getSession(c);

  const events = await c.env.DB.prepare(
    `SELECT event, status, metadata, created_at FROM kyc_events
     WHERE application_id = ? ORDER BY created_at DESC LIMIT 10`,
  )
    .bind(applicationId)
    .all();

  const latestEvent = events.results?.[0];

  await emitAuditLog({
    db: c.env.DB,
    userId: session.userId,
    action: "kyc_status_check",
    resource: "kyc_application",
    resourceId: applicationId,
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header("User-Agent"),
  });

  return c.json({
    success: true,
    data: {
      applicationId,
      currentStatus: latestEvent?.status ?? "unknown",
      lastEvent: latestEvent?.event ?? null,
      eventHistory: events.results ?? [],
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/kyc/pending — list pending KYC applications (analyst+)
kyc.get("/pending", requireRole("analyst", "admin", "super_admin", "internal"), async (c) => {
  const page = parseInt(c.req.query("page") ?? "1", 10);
  const pageSize = parseInt(c.req.query("pageSize") ?? "20", 10);
  const offset = (page - 1) * pageSize;

  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM kyc_events
     WHERE event = 'kyc.submitted' AND status = 'under_review'`,
  ).first<{ total: number }>();

  const results = await c.env.DB.prepare(
    `SELECT DISTINCT application_id, user_id, status, created_at FROM kyc_events
     WHERE event = 'kyc.submitted' AND status = 'under_review'
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
  )
    .bind(pageSize, offset)
    .all();

  return c.json({
    success: true,
    data: results.results ?? [],
    pagination: {
      page,
      pageSize,
      total: countResult?.total ?? 0,
      totalPages: Math.ceil((countResult?.total ?? 0) / pageSize),
    },
    timestamp: new Date().toISOString(),
  });
});

export { kyc };
