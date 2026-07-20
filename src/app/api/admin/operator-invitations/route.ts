import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth-helpers";
import { getGatewaySessionToken } from "@/lib/auth";
import { GatewayRequestError } from "@/lib/supabase-gateway";
import { operatorInvitationGateway } from "@/lib/operator-invitations-gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const issueSchema = z.object({
  email: z.string().email().max(254),
  role: z.enum(["analyst", "admin"]),
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  expiresMinutes: z.number().int().min(15).max(1440).default(60),
});

const revokeSchema = z.object({
  id: z.string().uuid(),
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

function gatewayError(error: GatewayRequestError) {
  return json({ error: error.message, code: error.code }, error.statusCode);
}

async function authorizedToken() {
  const gate = await requireAdmin();
  if (!gate.ok) return { response: gate.response, token: null };
  const token = await getGatewaySessionToken();
  if (!token) {
    return {
      response: json(
        {
          error: "A Supabase gateway administrator session is required.",
          code: "GATEWAY_SESSION_REQUIRED",
        },
        401,
      ),
      token: null,
    };
  }
  return { response: null, token };
}

export async function GET() {
  const authorization = await authorizedToken();
  if (authorization.response || !authorization.token) return authorization.response;

  try {
    return json(
      await operatorInvitationGateway("list", authorization.token),
    );
  } catch (error) {
    if (error instanceof GatewayRequestError) return gatewayError(error);
    return json({ error: "Operator invitations are unavailable." }, 503);
  }
}

export async function POST(request: NextRequest) {
  const authorization = await authorizedToken();
  if (authorization.response || !authorization.token) return authorization.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = issueSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: "Invitation details are invalid.", details: parsed.error.flatten().fieldErrors },
      400,
    );
  }

  try {
    return json(
      await operatorInvitationGateway(
        "issue",
        authorization.token,
        parsed.data,
      ),
      201,
    );
  } catch (error) {
    if (error instanceof GatewayRequestError) return gatewayError(error);
    return json({ error: "Operator invitation could not be created." }, 503);
  }
}

export async function DELETE(request: NextRequest) {
  const authorization = await authorizedToken();
  if (authorization.response || !authorization.token) return authorization.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = revokeSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Invitation identifier is invalid." }, 400);

  try {
    return json(
      await operatorInvitationGateway(
        "revoke",
        authorization.token,
        parsed.data,
      ),
    );
  } catch (error) {
    if (error instanceof GatewayRequestError) return gatewayError(error);
    return json({ error: "Operator invitation could not be revoked." }, 503);
  }
}
