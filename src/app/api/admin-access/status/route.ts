import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext } from "@/lib/api/auth-helpers";
import { rateLimit, rateLimitedResponse } from "@/lib/api/rate-limit";

const STATUS_ENDPOINT =
  "https://slzdjoqpzbkwzuaexlkj.supabase.co/functions/v1/gem-admin-access-status";
const REQUEST_TIMEOUT_MS = 15_000;

const schema = z
  .object({
    tokenHash: z.string().regex(/^[a-f0-9]{64}$/),
    requestId: z.string().regex(/^aar_[a-f0-9]{32}$/),
  })
  .strict();

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export async function POST(request: NextRequest) {
  const { ipAddress } = getRequestContext(request);
  const limit = rateLimit(ipAddress, {
    key: "auth:admin-access-status",
    windowMs: 15 * 60_000,
    max: 12,
  });
  if (!limit.ok) return rateLimitedResponse(limit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return json({ active: false, expiresAt: null }, 200);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(STATUS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: controller.signal,
    });
    const result = (await response.json().catch(() => null)) as
      | { active?: boolean; expiresAt?: string | null }
      | null;

    if (!response.ok || !result) {
      return json({ error: "Authorization verification unavailable" }, 503);
    }

    return json({
      active: result.active === true,
      expiresAt:
        typeof result.expiresAt === "string" ? result.expiresAt : null,
    });
  } catch (error) {
    console.error("[POST /api/admin-access/status]", error);
    return json({ error: "Authorization verification unavailable" }, 503);
  } finally {
    clearTimeout(timeout);
  }
}
