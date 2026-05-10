import { Hono } from "hono";
import { z } from "zod";
import type { Env, SessionPayload } from "../types/env.js";
import { authMiddleware, getSession, requireRole } from "../middleware/auth.js";
import { emitAuditLog, getClientIp } from "../middleware/audit.js";

type HonoEnv = { Bindings: Env; Variables: { session: SessionPayload } };

const notifications = new Hono<HonoEnv>();

notifications.use("/*", authMiddleware);

const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  channel: z.enum(["in_app", "email", "sms", "push"]).default("in_app"),
  metadata: z.record(z.unknown()).optional(),
});

const bulkNotificationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(1000),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  channel: z.enum(["in_app", "email", "sms", "push"]).default("in_app"),
});

// GET /api/notifications — list notifications for current user
notifications.get("/", async (c) => {
  const session = getSession(c);
  const page = parseInt(c.req.query("page") ?? "1", 10);
  const pageSize = parseInt(c.req.query("pageSize") ?? "20", 10);
  const unreadOnly = c.req.query("unreadOnly") === "true";
  const offset = (page - 1) * pageSize;

  let countQuery = "SELECT COUNT(*) as total FROM notifications WHERE user_id = ?";
  let dataQuery = "SELECT id, title, message, channel, read, metadata, created_at FROM notifications WHERE user_id = ?";
  const params: (string | number)[] = [session.userId];

  if (unreadOnly) {
    countQuery += " AND read = 0";
    dataQuery += " AND read = 0";
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

// PATCH /api/notifications/:id/read — mark notification as read
notifications.patch("/:id/read", async (c) => {
  const id = c.req.param("id");
  const session = getSession(c);

  const notification = await c.env.DB.prepare(
    "SELECT user_id FROM notifications WHERE id = ?",
  )
    .bind(id)
    .first<{ user_id: string }>();

  if (!notification) {
    return c.json({ success: false, error: "Notification not found", timestamp: new Date().toISOString() }, 404);
  }

  if (notification.user_id !== session.userId) {
    return c.json({ success: false, error: "Forbidden", timestamp: new Date().toISOString() }, 403);
  }

  await c.env.DB.prepare("UPDATE notifications SET read = 1 WHERE id = ?").bind(id).run();

  return c.json({
    success: true,
    data: { id, read: true },
    timestamp: new Date().toISOString(),
  });
});

// PATCH /api/notifications/read-all — mark all notifications as read
notifications.patch("/read-all", async (c) => {
  const session = getSession(c);

  const result = await c.env.DB.prepare(
    "UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0",
  )
    .bind(session.userId)
    .run();

  return c.json({
    success: true,
    data: { markedRead: result.meta?.changes ?? 0 },
    timestamp: new Date().toISOString(),
  });
});

// POST /api/notifications — create a notification (admin+)
notifications.post("/", requireRole("admin", "super_admin", "internal"), async (c) => {
  const body = createNotificationSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ success: false, error: "Invalid request body", timestamp: new Date().toISOString() }, 400);
  }

  const session = getSession(c);
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    `INSERT INTO notifications (id, user_id, title, message, channel, read, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
  )
    .bind(
      id, body.data.userId, body.data.title, body.data.message, body.data.channel,
      body.data.metadata ? JSON.stringify(body.data.metadata) : null, new Date().toISOString(),
    )
    .run();

  if (c.env.NOTIFICATION_QUEUE) {
    await c.env.NOTIFICATION_QUEUE.send({
      userId: body.data.userId,
      channel: body.data.channel,
      title: body.data.title,
      message: body.data.message,
      metadata: body.data.metadata as Record<string, unknown> | undefined,
    });
  }

  await emitAuditLog({
    db: c.env.DB,
    userId: session.userId,
    action: "notification_create",
    resource: "notification",
    resourceId: id,
    metadata: { targetUserId: body.data.userId, channel: body.data.channel },
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header("User-Agent"),
  });

  return c.json({
    success: true,
    data: { id, userId: body.data.userId, title: body.data.title, channel: body.data.channel },
    timestamp: new Date().toISOString(),
  }, 201);
});

// POST /api/notifications/bulk — send bulk notifications (admin+)
notifications.post("/bulk", requireRole("admin", "super_admin", "internal"), async (c) => {
  const body = bulkNotificationSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ success: false, error: "Invalid request body", timestamp: new Date().toISOString() }, 400);
  }

  const session = getSession(c);
  const now = new Date().toISOString();
  const ids: string[] = [];

  const stmt = c.env.DB.prepare(
    `INSERT INTO notifications (id, user_id, title, message, channel, read, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?)`,
  );

  const batch = body.data.userIds.map((userId) => {
    const id = crypto.randomUUID();
    ids.push(id);
    return stmt.bind(id, userId, body.data.title, body.data.message, body.data.channel, now);
  });

  await c.env.DB.batch(batch);

  await emitAuditLog({
    db: c.env.DB,
    userId: session.userId,
    action: "notification_bulk_create",
    resource: "notification",
    metadata: { count: body.data.userIds.length, channel: body.data.channel },
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header("User-Agent"),
  });

  return c.json({
    success: true,
    data: { count: ids.length, channel: body.data.channel },
    timestamp: new Date().toISOString(),
  }, 201);
});

export { notifications };
