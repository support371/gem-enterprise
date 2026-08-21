import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth";
import { emitAuditLog } from "@/lib/audit";
import { getRequestContext } from "@/lib/api/auth-helpers";

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (session) {
    const { ipAddress, userAgent } = getRequestContext(request);
    try {
      await emitAuditLog({
        userId: session.userId,
        action: "logout",
        resource: "user",
        resourceId: session.userId,
        metadata: { email: session.email },
        ipAddress,
        userAgent,
      });
    } catch (error) {
      // Session termination must remain available during an audit-store outage.
      // The failure is recorded server-side without retaining the user's cookie.
      console.error("[POST /api/auth/logout] audit persistence failed", error);
    }
  }

  const response = NextResponse.json({ success: true });
  return clearSessionCookie(response);
}
