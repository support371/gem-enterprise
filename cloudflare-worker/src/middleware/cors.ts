import { MiddlewareHandler } from "hono";
import type { Env } from "../types/env.js";

type HonoEnv = { Bindings: Env };

export const corsMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const allowedOrigins = (c.env.CORS_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean);
  const origin = c.req.header("Origin") ?? "";

  if (c.req.method === "OPTIONS") {
    const headers = new Headers();
    if (allowedOrigins.includes(origin)) {
      headers.set("Access-Control-Allow-Origin", origin);
    }
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Max-Age", "86400");
    headers.set("Access-Control-Allow-Credentials", "true");
    return new Response(null, { status: 204, headers });
  }

  await next();

  if (allowedOrigins.includes(origin)) {
    c.res.headers.set("Access-Control-Allow-Origin", origin);
    c.res.headers.set("Access-Control-Allow-Credentials", "true");
  }
};
