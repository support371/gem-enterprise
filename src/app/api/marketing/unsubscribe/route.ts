import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { getRequestContext } from "@/lib/api/auth-helpers";
import {
  mergeMarketingOptOutPreferences,
  verifyMarketingUnsubscribeToken,
} from "@/lib/email/marketingPreferences";

const HTML_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "text/html; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function page(title: string, body: string, action?: string): NextResponse {
  const form = action
    ? `<form method="post" action="${action}" style="margin-top:24px"><button type="submit" style="border:0;border-radius:8px;background:#FFBF00;color:#001F3F;font-weight:700;padding:12px 18px;cursor:pointer">Unsubscribe from marketing email</button></form>`
    : "";
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | GEM Enterprise</title></head><body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#172033"><main style="max-width:620px;margin:48px auto;padding:0 18px"><section style="overflow:hidden;border:1px solid #dfe4ea;border-radius:16px;background:#fff"><header style="background:#001F3F;border-bottom:4px solid #FFBF00;padding:24px 28px"><div style="color:#FFBF00;font-size:22px;font-weight:800;letter-spacing:2px">GEM</div><div style="margin-top:4px;color:#fff;font-size:11px;letter-spacing:3px;text-transform:uppercase">Enterprise</div></header><div style="padding:30px 28px"><h1 style="margin:0 0 12px;font-size:24px;color:#001F3F">${title}</h1><p style="margin:0;font-size:15px;line-height:1.7;color:#475467">${body}</p>${form}</div></section></main></body></html>`,
    { status: 200, headers: HTML_HEADERS },
  );
}

function invalidToken(): NextResponse {
  return new NextResponse(
    "Invalid or expired marketing preference link.",
    {
      status: 400,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );
}

function resolveUserId(req: NextRequest): { userId: string; token: string } | null {
  const token = req.nextUrl.searchParams.get("token")?.trim();
  if (!token) return null;
  const userId = verifyMarketingUnsubscribeToken(token);
  return userId ? { userId, token } : null;
}

export async function GET(req: NextRequest) {
  const resolved = resolveUserId(req);
  if (!resolved) return invalidToken();

  const action = `/api/marketing/unsubscribe?token=${encodeURIComponent(resolved.token)}`;
  return page(
    "Marketing email preferences",
    "Confirm below if you no longer want to receive GEM Enterprise marketing and campaign email. Service, security, account, billing, or other non-marketing communications may still be sent when necessary.",
    action,
  );
}

export async function POST(req: NextRequest) {
  const resolved = resolveUserId(req);
  if (!resolved) return invalidToken();

  const user = await db.user.findUnique({
    where: { id: resolved.userId },
    select: {
      id: true,
      profile: { select: { preferences: true } },
    },
  });

  // Return the same success state if the signed link refers to an account that
  // no longer exists. This avoids exposing account lifecycle details.
  if (!user) {
    return page(
      "Marketing email unsubscribed",
      "Your marketing email preference has been recorded. No further action is required.",
    );
  }

  const preferences = mergeMarketingOptOutPreferences(
    user.profile?.preferences,
  ) as Prisma.InputJsonValue;

  await db.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, preferences },
    update: { preferences },
  });

  const { ipAddress, userAgent } = getRequestContext(req);
  await emitAuditLog({
    userId: user.id,
    action: "admin_action",
    resource: "marketing_email_preference",
    resourceId: user.id,
    metadata: {
      state: "unsubscribed",
      channel: "email",
      mechanism: req.headers.get("List-Unsubscribe")
        ? "one_click"
        : "signed_link",
    },
    ipAddress,
    userAgent,
  });

  return page(
    "Marketing email unsubscribed",
    "You will no longer receive GEM Enterprise marketing and campaign email. Service, security, account, billing, or other non-marketing communications may still be sent when necessary.",
  );
}
