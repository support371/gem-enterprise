import { Hono } from "hono";
import type { Env } from "../types/env.js";
import type { HealthResponse, ReadyResponse, VersionResponse } from "../types/api.js";

type HonoEnv = { Bindings: Env };

const health = new Hono<HonoEnv>();

health.get("/health", async (c) => {
  let d1Status: "ok" | "error" = "ok";
  let r2Status: "ok" | "error" | "not_configured" = "not_configured";
  let kvStatus: "ok" | "error" | "not_configured" = "not_configured";

  try {
    await c.env.DB.prepare("SELECT 1").first();
  } catch {
    d1Status = "error";
  }

  if (c.env.VAULT) {
    r2Status = "ok";
    try {
      await c.env.VAULT.head("__health_check__");
    } catch {
      r2Status = "error";
    }
  }

  if (c.env.CACHE) {
    kvStatus = "ok";
    try {
      await c.env.CACHE.get("__health_check__");
    } catch {
      kvStatus = "error";
    }
  }

  const coreOk = d1Status === "ok";
  const hasErrors = d1Status === "error" || r2Status === "error" || kvStatus === "error";
  const status = !coreOk ? "down" : hasErrors ? "degraded" : "ok";

  const body: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: c.env.APP_VERSION,
    environment: c.env.ENVIRONMENT,
    services: { d1: d1Status, r2: r2Status, kv: kvStatus },
  };

  return c.json(body, coreOk ? 200 : 503);
});

health.get("/ready", async (c) => {
  const checks = { database: false, storage: false, cache: false, secrets: false };

  try {
    await c.env.DB.prepare("SELECT 1").first();
    checks.database = true;
  } catch { /* not ready */ }

  if (c.env.VAULT) {
    try {
      await c.env.VAULT.head("__ready_check__");
      checks.storage = true;
    } catch { /* not ready */ }
  } else {
    checks.storage = true; // not configured, skip check
  }

  if (c.env.CACHE) {
    try {
      await c.env.CACHE.get("__ready_check__");
      checks.cache = true;
    } catch { /* not ready */ }
  } else {
    checks.cache = true; // not configured, skip check
  }

  checks.secrets = Boolean(c.env.JWT_SECRET && c.env.CLOUDFLARE_ACCOUNT_ID);

  const ready = checks.database && checks.secrets;
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
