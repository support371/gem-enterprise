import { Hono } from "hono";
import { z } from "zod";
import { jwtVerify } from "jose";
import type { Env, SessionPayload } from "../types/env.js";
import { authMiddleware, getSession } from "../middleware/auth.js";
import { emitAuditLog, getClientIp } from "../middleware/audit.js";

type HonoEnv = { Bindings: Env; Variables: { session: SessionPayload } };

const auth = new Hono<HonoEnv>();

const validateTokenSchema = z.object({
  token: z.string().min(1),
});

// POST /api/auth/validate — validate a JWT without setting cookies
auth.post("/validate", async (c) => {
  const body = validateTokenSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ success: false, error: "Invalid request body", timestamp: new Date().toISOString() }, 400);
  }

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(body.data.token, secret);
    const session = payload as unknown as SessionPayload;

    return c.json({
      success: true,
      data: {
        valid: true,
        userId: session.userId,
        email: session.email,
        role: session.role,
        kycStatus: session.kycStatus,
        entitlements: session.entitlements,
        expiresAt: session.exp ? new Date(session.exp * 1000).toISOString() : null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return c.json({
      success: true,
      data: { valid: false },
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/auth/session — return current session from bearer/cookie
auth.get("/session", authMiddleware, async (c) => {
  const session = getSession(c);

  await emitAuditLog({
    db: c.env.DB,
    userId: session.userId,
    action: "session_check",
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header("User-Agent"),
  });

  return c.json({
    success: true,
    data: {
      userId: session.userId,
      email: session.email,
      role: session.role,
      kycStatus: session.kycStatus,
      entitlements: session.entitlements,
      kycApplicationId: session.kycApplicationId ?? null,
      portfolioId: session.portfolioId ?? null,
      organizationId: session.organizationId ?? null,
    },
    timestamp: new Date().toISOString(),
  });
});

export { auth };
