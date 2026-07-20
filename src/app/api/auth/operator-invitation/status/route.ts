import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GatewayRequestError } from "@/lib/supabase-gateway";
import { getOperatorInvitationStatus } from "@/lib/operator-invitations-gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(40).max(256),
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ valid: false, error: "Invalid request." }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ valid: false, error: "Invalid invitation." }, 400);

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");

  try {
    return json(await getOperatorInvitationStatus(tokenHash));
  } catch (error) {
    if (error instanceof GatewayRequestError) {
      return json({ valid: false, error: error.message, code: error.code }, error.statusCode);
    }
    return json({ valid: false, error: "Invitation status is unavailable." }, 503);
  }
}
