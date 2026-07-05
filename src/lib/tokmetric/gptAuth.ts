import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { TokMetricError } from "@/lib/tokmetric/security";

function timingSafeStringEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function requireTokMetricGptAuth(request: NextRequest) {
  const configured = process.env.GPT_AUTH_TOKEN;
  if (!configured) {
    throw new TokMetricError(503, "GPT_AUTH_NOT_CONFIGURED", "TokMetric GPT authentication is not configured.");
  }
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token || !timingSafeStringEqual(token, configured)) {
    throw new TokMetricError(401, "GPT_AUTH_INVALID", "A valid TokMetric GPT bearer token is required.");
  }
  return { principal: "tokmetric-gpt", mode: "server_to_server" as const };
}
