import { Context, MiddlewareHandler } from "hono";
import { jwtVerify } from "jose";
import type { Env, SessionPayload, UserRole } from "../types/env.js";

type HonoEnv = { Bindings: Env; Variables: { session: SessionPayload } };

export const authMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const cookieHeader = c.req.header("Cookie");

  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else if (cookieHeader) {
    const match = cookieHeader.match(/gem_session=([^;]+)/);
    token = match?.[1];
  }

  if (!token) {
    return c.json({ success: false, error: "Unauthorized", timestamp: new Date().toISOString() }, 401);
  }

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    c.set("session", payload as unknown as SessionPayload);
    await next();
  } catch {
    return c.json({ success: false, error: "Invalid or expired token", timestamp: new Date().toISOString() }, 401);
  }
};

export function requireRole(...roles: UserRole[]): MiddlewareHandler<HonoEnv> {
  return async (c, next) => {
    const session = c.get("session");
    if (!session) {
      return c.json({ success: false, error: "Unauthorized", timestamp: new Date().toISOString() }, 401);
    }
    if (!roles.includes(session.role)) {
      return c.json(
        { success: false, error: `Forbidden: requires one of [${roles.join(", ")}]`, timestamp: new Date().toISOString() },
        403,
      );
    }
    await next();
  };
}

export function getSession(c: Context<HonoEnv>): SessionPayload {
  return c.get("session");
}
