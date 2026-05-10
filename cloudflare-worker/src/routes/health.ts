import { Hono } from "hono";
import type { Env } from "../types/env.js";
import type { HealthResponse, ReadyResponse, VersionResponse } from "../types/api.js";

type HonoEnv = { Bindings: Env };

const health = new Hono<HonoEnv>();

health.get("/health", async (c) => {
  let d1Status: "ok" | "error" = "ok";
  let r2Status: "ok" | "error" = "ok";
  let kvStatus: "ok" | "error" = "ok";

  try {
    await c.env.DB.prepare("SELECT 1").first();
  } catch {
    d1Status = "error";
  }

  try {
    await c.env.VAULT.head("__health_check__");
  } catch {
    r2Status = "error";
  }

  try {
    await c.env.CACHE.get("__health_check__");
  } catch {
    kvStatus = "error";
  }

  const allOk = d1Status === "ok" && r2Status === "ok" && kvStatus === "ok";
  const allDown = d1Status === "error" && r2Status === "error" && kvStatus === "error";
  const status = allOk ? "ok" : allDown ? "down" : "degraded";

  const body: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: c.env.APP_VERSION,
    environment: c.env.ENVIRONMENT,
    services: { d1: d1Status, r2: r2Status, kv: kvStatus },
  };

  return c.json(body, allOk ? 200 : 503);
});

health.get("/ready", async (c) => {
  const checks = { database: false, storage: false, cache: false, secrets: false };

  try {
    await c.env.DB.prepare("SELECT 1").first();
    checks.database = true;
  } catch { /* not ready */ }

  try {
    await c.env.VAULT.head("__ready_check__");
    checks.storage = true;
  } catch { /* not ready */ }

  try {
    await c.env.CACHE.get("__ready_check__");
    checks.cache = true;
  } catch { /* not ready */ }

  checks.secrets = Boolean(c.env.JWT_SECRET && c.env.CLOUDFLARE_ACCOUNT_ID);

  const ready = checks.database && checks.storage && checks.cache && checks.secrets;
  const body: ReadyResponse = { ready, checks };

  return c.json(body, ready ? 200 : 503);
});

health.get("/version", (c) => {
  const body: VersionResponse = {
    version: c.env.APP_VERSION,
    environment: c.env.ENVIRONMENT,
    appName: c.env.APP_NAME,
    buildDate: new Date().toISOString(),
    compatibilityDate: "2025-01-01",
  };

  return c.json(body);
});

export { health };
