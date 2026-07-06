import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import type { Env, SessionPayload } from "./types/env.js";
import { corsMiddleware } from "./middleware/cors.js";
import { health } from "./routes/health.js";
import { auth } from "./routes/auth.js";
import { rbac } from "./routes/rbac.js";
import { kyc } from "./routes/kyc.js";
import { documents } from "./routes/documents.js";
import { serviceRequests } from "./routes/service-requests.js";
import { audit } from "./routes/audit.js";
import { notifications } from "./routes/notifications.js";

type HonoEnv = { Bindings: Env; Variables: { session: SessionPayload } };

const app = new Hono<HonoEnv>();

// ── Global Middleware ─────────────────────────────────────────────────────────

app.use("*", logger());
app.use("*", secureHeaders());
app.use("*", timing());
app.use("*", corsMiddleware);

// ── Error Handler ─────────────────────────────────────────────────────────────

app.onError((err, c) => {
  console.error(`[error] ${c.req.method} ${c.req.url}:`, err.message);
  return c.json(
    {
      success: false,
      error: c.env.ENVIRONMENT === "production" ? "Internal server error" : err.message,
      timestamp: new Date().toISOString(),
    },
    500,
  );
});

// ── 404 Handler ───────────────────────────────────────────────────────────────

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: `Route not found: ${c.req.method} ${c.req.url}`,
      timestamp: new Date().toISOString(),
    },
    404,
  );
});

// ── Routes ────────────────────────────────────────────────────────────────────

// Public routes (no auth required)
app.route("/api", health);

// Authenticated routes
app.route("/api/auth", auth);
app.route("/api/rbac", rbac);
app.route("/api/kyc", kyc);
app.route("/api/documents", documents);
app.route("/api/service-requests", serviceRequests);
app.route("/api/audit", audit);
app.route("/api/notifications", notifications);

// ── Root ──────────────────────────────────────────────────────────────────────

app.get("/", (c) => {
  return c.json({
    name: c.env.APP_NAME,
    version: c.env.APP_VERSION,
    docs: "/api/docs",
    health: "/api/health",
    ready: "/api/ready",
  });
});

export default app;
