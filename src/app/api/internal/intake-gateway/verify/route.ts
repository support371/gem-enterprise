import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  intakeGatewayActions,
  verifyIntakeGatewayCapability,
} from "@/lib/intake/gateway-capability";

const schema = z
  .object({
    token: z.string().min(32).max(4096),
    action: z.enum(intakeGatewayActions),
    intakeId: z.string().trim().min(1).max(128).nullable().optional(),
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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ valid: false }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ valid: false }, 400);

  const claims = await verifyIntakeGatewayCapability(parsed.data.token);
  if (!claims || claims.action !== parsed.data.action) {
    return json({ valid: false }, 403);
  }

  const requestedIntakeId = parsed.data.intakeId?.trim() || null;
  if (claims.intakeId !== requestedIntakeId) {
    return json({ valid: false }, 403);
  }

  return json({
    valid: true,
    action: claims.action,
    intakeId: claims.intakeId,
  });
}
