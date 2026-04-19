import { NextRequest, NextResponse } from "next/server";
import { getSession, clearSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);

    if (session?.userId) {
      const ipAddress =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        undefined;
      const userAgent = request.headers.get("user-agent") ?? undefined;

      await db.auditLog.create({
        data: {
          userId: session.userId,
          action: "logout",
          resource: "user",
          resourceId: session.userId,
          metadata: { email: session.email },
          ipAddress,
          userAgent,
        },
      });
    }

    return response;
  } catch (error) {
    console.error("[POST /api/auth/logout]", error);
    // Still clear the cookie even if logging fails
    const response = NextResponse.json({ success: true });
    return clearSessionCookie(response);
  }
}
