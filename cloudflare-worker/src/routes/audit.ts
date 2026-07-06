import { Hono } from "hono";
import { z } from "zod";
import type { Env, SessionPayload } from "../types/env.js";
import { authMiddleware, getSession, requireRole } from "../middleware/auth.js";

type HonoEnv = { Bindings: Env; Variables: { session: SessionPayload } };

const audit = new Hono<HonoEnv>();

audit.use("/*", authMiddleware);

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  action: z.string().optional(),
  userId: z.string().uuid().optional(),
  resource: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// GET /api/audit/logs — query audit logs (admin+)
audit.get("/logs", requireRole("admin", "super_admin", "internal"), async (c) => {
  const parsed = querySchema.safeParse({
    page: c.req.query("page"),
    pageSize: c.req.query("pageSize"),
    action: c.req.query("action"),
    userId: c.req.query("userId"),
    resource: c.req.query("resource"),
    startDate: c.req.query("startDate"),
    endDate: c.req.query("endDate"),
  });

  if (!parsed.success) {
    return c.json({ success: false, error: "Invalid query parameters", timestamp: new Date().toISOString() }, 400);
  }

  const { page, pageSize, action, userId, resource, startDate, endDate } = parsed.data;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (action) { conditions.push("action = ?"); params.push(action); }
  if (userId) { conditions.push("user_id = ?"); params.push(userId); }
  if (resource) { conditions.push("resource = ?"); params.push(resource); }
  if (startDate) { conditions.push("created_at >= ?"); params.push(startDate); }
  if (endDate) { conditions.push("created_at <= ?"); params.push(endDate); }

  const where = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";

  const countResult = await c.env.DB.prepare(`SELECT COUNT(*) as total FROM audit_logs${where}`)
    .bind(...params)
    .first<{ total: number }>();

  const results = await c.env.DB.prepare(
    `SELECT id, user_id, action, resource, resource_id, metadata, ip_address, user_agent, created_at
     FROM audit_logs${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
  )
    .bind(...params, pageSize, offset)
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

// GET /api/audit/logs/:id — get a specific audit log entry
audit.get("/logs/:id", requireRole("admin", "super_admin", "internal"), async (c) => {
  const id = c.req.param("id");

  const entry = await c.env.DB.prepare(
    "SELECT * FROM audit_logs WHERE id = ?",
  )
    .bind(id)
    .first();

  if (!entry) {
    return c.json({ success: false, error: "Audit log not found", timestamp: new Date().toISOString() }, 404);
  }

  return c.json({
    success: true,
    data: entry,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/audit/summary — aggregated audit stats (admin+)
audit.get("/summary", requireRole("admin", "super_admin", "internal"), async (c) => {
  const hours = parseInt(c.req.query("hours") ?? "24", 10);
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const actionCounts = await c.env.DB.prepare(
    `SELECT action, COUNT(*) as count FROM audit_logs
     WHERE created_at >= ? GROUP BY action ORDER BY count DESC`,
  )
    .bind(since)
    .all();

  const totalCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as total FROM audit_logs WHERE created_at >= ?",
  )
    .bind(since)
    .first<{ total: number }>();

  const uniqueUsers = await c.env.DB.prepare(
    "SELECT COUNT(DISTINCT user_id) as count FROM audit_logs WHERE created_at >= ?",
  )
    .bind(since)
    .first<{ count: number }>();

  return c.json({
    success: true,
    data: {
      period: { hours, since },
      totalEvents: totalCount?.total ?? 0,
      uniqueUsers: uniqueUsers?.count ?? 0,
      actionBreakdown: actionCounts.results ?? [],
    },
    timestamp: new Date().toISOString(),
  });
});

export { audit };
