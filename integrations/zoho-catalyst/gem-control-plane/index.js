"use strict";

const express = require("express");
const { callGem } = require("./bridge");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

function noStore(res) {
  res.set("Cache-Control", "no-store, max-age=0");
  res.set("X-Content-Type-Options", "nosniff");
}

function sendBridgeError(res, error) {
  noStore(res);
  if (error && error.code === "GEM_AGENT_NOT_CONFIGURED") {
    return res.status(503).json({
      ok: false,
      status: "BLOCKED_BY_CREDENTIAL",
      error: "gem_agent_not_configured",
    });
  }
  if (error && error.code === "GEM_OPERATION_NOT_ALLOWED") {
    return res.status(403).json({
      ok: false,
      status: "BLOCKED_BY_POLICY",
      error: "operation_not_allowed",
    });
  }
  return res.status(502).json({
    ok: false,
    status: "FAILED",
    error: "gem_upstream_unavailable",
  });
}

async function proxy(operation, req, res, query = {}) {
  try {
    const result = await callGem(operation, query);
    noStore(res);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return sendBridgeError(res, error);
  }
}

app.get("/health", (req, res) => proxy("health", req, res));
app.get("/context", (req, res) => {
  const view = typeof req.query.view === "string" ? req.query.view : undefined;
  const allowedViews = new Set(["platform", "stores", "tiktok", "google"]);
  return proxy("context", req, res, allowedViews.has(view) ? { view } : {});
});

app.all("*", (req, res) => {
  noStore(res);
  return res.status(404).json({
    ok: false,
    status: "BLOCKED_BY_POLICY",
    error: "route_not_exposed",
  });
});

module.exports = app;
