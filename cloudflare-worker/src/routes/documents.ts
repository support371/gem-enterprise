import { Hono } from "hono";
import { z } from "zod";
import type { Env, SessionPayload } from "../types/env.js";
import { authMiddleware, getSession, requireRole } from "../middleware/auth.js";
import { emitAuditLog, getClientIp } from "../middleware/audit.js";

type HonoEnv = { Bindings: Env; Variables: { session: SessionPayload } };

const documents = new Hono<HonoEnv>();

documents.use("/*", authMiddleware);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// POST /api/documents/upload — upload a document to R2 vault
documents.post("/upload", async (c) => {
  const session = getSession(c);
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  const category = formData.get("category") as string | null;

  if (!file) {
    return c.json({ success: false, error: "No file provided", timestamp: new Date().toISOString() }, 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return c.json({ success: false, error: "File exceeds 10 MB limit", timestamp: new Date().toISOString() }, 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json(
      { success: false, error: `Unsupported file type: ${file.type}`, timestamp: new Date().toISOString() },
      400,
    );
  }

  const documentId = crypto.randomUUID();
  const key = `${session.userId}/${category ?? "general"}/${documentId}-${file.name}`;

  await c.env.VAULT.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: {
      userId: session.userId,
      documentId,
      category: category ?? "general",
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  await c.env.DB.prepare(
    `INSERT INTO document_vault (id, user_id, r2_key, file_name, file_type, file_size, category, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(documentId, session.userId, key, file.name, file.type, file.size, category ?? "general", new Date().toISOString())
    .run();

  await emitAuditLog({
    db: c.env.DB,
    userId: session.userId,
    action: "document_upload",
    resource: "document_vault",
    resourceId: documentId,
    metadata: { fileName: file.name, fileType: file.type, fileSize: file.size, category },
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header("User-Agent"),
  });

  return c.json({
    success: true,
    data: { documentId, key, fileName: file.name, fileType: file.type, fileSize: file.size },
    timestamp: new Date().toISOString(),
  }, 201);
});

// GET /api/documents — list user's documents
documents.get("/", async (c) => {
  const session = getSession(c);
  const category = c.req.query("category");
  const page = parseInt(c.req.query("page") ?? "1", 10);
  const pageSize = parseInt(c.req.query("pageSize") ?? "20", 10);
  const offset = (page - 1) * pageSize;

  let countQuery = "SELECT COUNT(*) as total FROM document_vault WHERE user_id = ?";
  let dataQuery =
    "SELECT id, file_name, file_type, file_size, category, created_at FROM document_vault WHERE user_id = ?";
  const params: (string | number)[] = [session.userId];

  if (category) {
    countQuery += " AND category = ?";
    dataQuery += " AND category = ?";
    params.push(category);
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

// GET /api/documents/:id/download — get presigned download URL
documents.get("/:id/download", async (c) => {
  const documentId = c.req.param("id");
  const session = getSession(c);

  const doc = await c.env.DB.prepare(
    "SELECT r2_key, file_name, user_id FROM document_vault WHERE id = ?",
  )
    .bind(documentId)
    .first<{ r2_key: string; file_name: string; user_id: string }>();

  if (!doc) {
    return c.json({ success: false, error: "Document not found", timestamp: new Date().toISOString() }, 404);
  }

  const isAdmin = ["admin", "super_admin", "internal"].includes(session.role);
  if (doc.user_id !== session.userId && !isAdmin) {
    return c.json({ success: false, error: "Forbidden", timestamp: new Date().toISOString() }, 403);
  }

  const object = await c.env.VAULT.get(doc.r2_key);
  if (!object) {
    return c.json({ success: false, error: "File not found in storage", timestamp: new Date().toISOString() }, 404);
  }

  await emitAuditLog({
    db: c.env.DB,
    userId: session.userId,
    action: "document_download",
    resource: "document_vault",
    resourceId: documentId,
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header("User-Agent"),
  });

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${doc.file_name}"`,
    },
  });
});

// DELETE /api/documents/:id — soft-delete a document (admin+)
documents.delete("/:id", requireRole("admin", "super_admin", "internal"), async (c) => {
  const documentId = c.req.param("id");
  const session = getSession(c);

  const doc = await c.env.DB.prepare("SELECT r2_key FROM document_vault WHERE id = ?")
    .bind(documentId)
    .first<{ r2_key: string }>();

  if (!doc) {
    return c.json({ success: false, error: "Document not found", timestamp: new Date().toISOString() }, 404);
  }

  await c.env.DB.prepare("UPDATE document_vault SET deleted_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), documentId)
    .run();

  await emitAuditLog({
    db: c.env.DB,
    userId: session.userId,
    action: "document_delete",
    resource: "document_vault",
    resourceId: documentId,
    metadata: { r2Key: doc.r2_key },
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header("User-Agent"),
  });

  return c.json({
    success: true,
    data: { documentId, deleted: true },
    timestamp: new Date().toISOString(),
  });
});

export { documents };
