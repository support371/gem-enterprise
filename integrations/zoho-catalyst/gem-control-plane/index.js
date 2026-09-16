"use strict";
const { callGem } = require("./bridge");
const PREFIX = "/server/gem_control_plane";
const VIEWS = new Set(["platform", "stores", "tiktok", "google"]);
const parseUrl = (req) => new URL(req.url || "/", `https://${req.headers?.host || "localhost"}`);
function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Cache-Control": "no-store, max-age=0",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  res.end(JSON.stringify(body));
}
function fail(res, error) {
  if (error?.code === "GEM_AGENT_NOT_CONFIGURED") {
    return send(res, 503, { ok: false, status: "BLOCKED_BY_CREDENTIAL", error: "gem_agent_not_configured" });
  }
  if (error?.code === "GEM_OPERATION_NOT_ALLOWED") {
    return send(res, 403, { ok: false, status: "BLOCKED_BY_POLICY", error: "operation_not_allowed" });
  }
  return send(res, 502, { ok: false, status: "FAILED", error: "gem_upstream_unavailable" });
}
module.exports = async (req, res) => {
  const url = parseUrl(req);
  const path = url.pathname.startsWith(PREFIX) ? url.pathname.slice(PREFIX.length) || "/" : url.pathname;
  if (req.method !== "GET") {
    return send(res, 405, { ok: false, status: "BLOCKED_BY_POLICY", error: "method_not_allowed" }, { Allow: "GET" });
  }
  const operation = path === "/health" ? "health" : path === "/context" ? "context" : null;
  if (!operation) return send(res, 404, { ok: false, status: "BLOCKED_BY_POLICY", error: "route_not_exposed" });
  const view = url.searchParams.get("view");
  try {
    const result = await callGem(operation, operation === "context" && VIEWS.has(view) ? { view } : {});
    return send(res, result.status, result.body);
  } catch (error) {
    return fail(res, error);
  }
};
