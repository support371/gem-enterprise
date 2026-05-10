import { Hono } from "hono";
import { z } from "zod";
import type { Env, SessionPayload } from "../types/env.js";
import { authMiddleware, getSession, requireRole } from "../middleware/auth.js";
import { emitAuditLog, getClientIp } from "../middleware/audit.js";

type HonoEnv = { Bindings: Env; Variables: { session: SessionPayload } };

const serviceRequests = new Hono<HonoEnv>();

serviceRequests.use("/*", authMiddleware);

const createRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  metadata: z.record(z.unknown()).optional(),
});

const updateRequestSchema = z.object({
  status: z.enum(["open", "in_progress", "pending_info", "completed", "cancelled"]).optional(),
  assignedTo: z.string().uuid().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  resolution: z.string().max(5000).optional(),
});

// POST /api/service-requests — create a new service request
serviceRequests.post("/", async (c) => {
  const body = createRequestSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ success: false, error: "Invalid request body", timestamp: new Date().toISOString() }, 400);
  }

  const session = getSession(c);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO service_requests (id, user_id, title, description, priority, status, metadata, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'open', ?, ?, ?)`,
  )
    .bind(id, session.userId, body.data.title, body.data.description, body.data.priority,
      body.data.metadata ? JSON.stringify(body.data.metadata) : null, now, now)
    .run();

  await emitAuditLog({
    db: c.env.DB,
    userId: session.userId,
    action: "service_request_create",
    resource: "service_request",
    resourceId: id,
    metadata: { title: body.data.title, priority: body.data.priority },
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header("User-Agent"),
  });

  return c.json({
    success: true,
    data: { id, title: body.data.title, status: "open", priority: body.data.priority, createdAt: now },
    timestamp: new Date().toISOString(),
  }, 201);
});

// GET /api/service-requests — list service requests
serviceRequests.get("/", async (c) => {
  const session = getSession(c);
  const page = parseInt(c.req.query("page") ?? "1", 10);
  const pageSize = parseInt(c.req.query("pageSize") ?? "20", 10);
  const status = c.req.query("status");
  const offset = (page - 1) * pageSize;

  const isAdmin = ["admin", "super_admin", "internal"].includes(session.role);

  let countQuery = "SELECT COUNT(*) as total FROM service_requests";
  let dataQuery = "SELECT id, user_id, title, description, priority, status, assigned_to, created_at, updated_at FROM service_requests";
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (!isAdmin) {
    conditions.push("user_id = ?");
    params.push(session.userId);
  }
  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  if (conditions.length > 0) {
    const where = " WHERE " + conditions.join(" AND ");
    countQuery += where;
    dataQuery += where;
  }

  dataQuery += " ORDER BY created_at DESC LIMIT ? OFFSET ?";

  const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();
  const results = await c.env.DB.prepare(dataQuery).bind(...params, pageSize, offset).all();

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

// GET /api/service-requests/:id — get a specific service request
serviceRequests.get("/:id", async (c) => {
  const id = c.req.param("id");
  const session = getSession(c);

  const request = await c.env.DB.prepare(
    "SELECT * FROM service_requests WHERE id = ?",
  )
    .bind(id)
    .first();

  if (!request) {
    return c.json({ success: false, error: "Service request not found", timestamp: new Date().toISOString() }, 404);
  }

  const isAdmin = ["admin", "super_admin", "internal"].includes(session.role);
  if (request.user_id !== session.userId && !isAdmin) {
    return c.json({ success: false, error: "Forbidden", timestamp: new Date().toISOString() }, 403);
  }

  return c.json({
    success: true,
    data: request,
    timestamp: new Date().toISOString(),
  });
});

// PATCH /api/service-requests/:id — update a service request (admin+ or owner)
serviceRequests.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const session = getSession(c);
  const body = updateRequestSchema.safeParse(await c.req.json());

  if (!body.success) {
    return c.json({ success: false, error: "Invalid request body", timestamp: new Date().toISOString() }, 400);
  }

  const existing = await c.env.DB.prepare("SELECT user_id FROM service_requests WHERE id = ?")
    .bind(id)
    .first<{ user_id: string }>();

  if (!existing) {
    return c.json({ success: false, error: "Service request not found", timestamp: new Date().toISOString() }, 404);
  }

  const isAdmin = ["admin", "super_admin", "internal"].includes(session.role);
  if (existing.user_id !== session.userId && !isAdmin) {
    return c.json({ success: false, error: "Forbidden", timestamp: new Date().toISOString() }, 403);
  }

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (body.data.status) { updates.push("status = ?"); values.push(body.data.status); }
  if (body.data.assignedTo) { updates.push("assigned_to = ?"); values.push(body.data.assignedTo); }
  if (body.data.priority) { updates.push("priority = ?"); values.push(body.data.priority); }
  if (body.data.resolution) { updates.push("resolution = ?"); values.push(body.data.resolution); }

  if (updates.length === 0) {
    return c.json({ success: false, error: "No updates provided", timestamp: new Date().toISOString() }, 400);
  }

  updates.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  await c.env.DB.prepare(`UPDATE service_requests SET ${updates.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  await emitAuditLog({
    db: c.env.DB,
    userId: session.userId,
    action: "service_request_update",
    resource: "service_request",
    resourceId: id,
    metadata: body.data,
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header("User-Agent"),
  });

  return c.json({
    success: true,
    data: { id, ...body.data, updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
  });
});

export { serviceRequests };
