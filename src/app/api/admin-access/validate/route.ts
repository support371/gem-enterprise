import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext } from "@/lib/api/auth-helpers";
import { rateLimit, rateLimitedResponse } from "@/lib/api/rate-limit";
import { validateAdminAccessToken } from "@/lib/admin-access-validation";

const schema = z
  .object({
    accessToken: z.string().min(32).max(512),
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
    key: "auth:admin-access-validate",
    windowMs: 15 * 60_000,
    max: 20,
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
    return json({ error: "Invalid authorization capability." }, 400);
  }

  try {
    const result = await validateAdminAccessToken(parsed.data.accessToken);
    return json({
      valid: result.valid,
      expiresAt: result.expiresAt,
      requestId: result.requestId,
      message: result.valid
        ? "Authorization confirmed."
        : "No active authorization row matches this browser capability.",
    });
  } catch (error) {
    console.error("[POST /api/admin-access/validate]", error);
    return json(
      {
        error: "Administrator authorization validation is temporarily unavailable.",
      },
      503,
    );
  }
}
