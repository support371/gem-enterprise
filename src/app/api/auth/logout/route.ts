import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth";
import { emitAuditLog } from "@/lib/audit";
import { getRequestContext } from "@/lib/api/auth-helpers";

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (session) {
    const { ipAddress, userAgent } = getRequestContext(request);
    await emitAuditLog({
      userId: session.userId,
      action: "logout",
      resource: "user",
      resourceId: session.userId,
      metadata: { email: session.email },
      ipAddress,
      userAgent,
    });
  }

  const response = NextResponse.json({ success: true });
  return clearSessionCookie(response);
}
