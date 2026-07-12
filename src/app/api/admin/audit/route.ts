import { NextResponse } from "next/server";
import { getGatewaySessionToken } from "@/lib/auth";
import { requireAdmin } from "@/lib/api/auth-helpers";
import { db } from "@/lib/db";
import {
  adminReadGateway,
  GatewayRequestError,
} from "@/lib/supabase-gateway";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const gatewayToken = await getGatewaySessionToken();
  if (gatewayToken) {
    try {
      return json(await adminReadGateway("audit", gatewayToken));
    } catch (error) {
      if (error instanceof GatewayRequestError) {
        return json({ error: error.message, code: error.code }, error.statusCode);
      }
      return json({ logs: [], error: "Unable to load audit logs" }, 500);
    }
  }

  try {
    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    return json({ logs });
  } catch (error) {
    console.error("[ADMIN_AUDIT_GET]", error);
    return json({ logs: [], error: "Unable to load audit logs" }, 500);
  }
}
