import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

function authorized(request: NextRequest) {
  const configured = process.env.CRON_SECRET?.trim();
  const header = request.headers.get("authorization")?.trim();
  if (!configured || !header?.startsWith("Bearer ")) return false;
  const expected = Buffer.from(configured);
  const supplied = Buffer.from(header.slice("Bearer ".length));
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
}

/**
 * Legacy analytics synchronization is disabled until it is migrated to shared
 * connector credentials and a read-only analytics adapter. The former worker
 * decrypted the duplicate CBC token store and placed access tokens in URLs.
 */
export async function POST(request: NextRequest) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CRON_AUTH_NOT_CONFIGURED",
          message: "Analytics worker authentication is not configured.",
        },
        externalActionTaken: false,
      },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
  if (!authorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Authentication failed." },
        externalActionTaken: false,
      },
      { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "LEGACY_FACEBOOK_ANALYTICS_WORKER_DISABLED",
        message:
          "Analytics synchronization remains disabled until the shared read-only adapter is certified.",
      },
      externalActionTaken: false,
    },
    { status: 409, headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
