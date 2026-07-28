import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { getRequestContext } from "@/lib/api/auth-helpers";
import {
  getNewsletterAppUrl,
  hashNewsletterToken,
} from "@/lib/newsletter/subscription";

type ConfirmedRow = { id: string };

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim() || "";
  const destination = new URL("/newsletter", getNewsletterAppUrl());

  if (token.length < 20 || token.length > 500) {
    destination.searchParams.set("confirmation", "invalid");
    return NextResponse.redirect(destination, 303);
  }

  const tokenHash = hashNewsletterToken(token);
  const { ipAddress, userAgent } = getRequestContext(req);

  try {
    const rows = await db.$queryRaw<ConfirmedRow[]>`
      UPDATE "newsletter_subscribers"
      SET
        "status" = 'active',
        "confirmed_at" = COALESCE("confirmed_at", NOW()),
        "unsubscribed_at" = NULL,
        "confirmation_token_hash" = NULL,
        "updated_at" = NOW()
      WHERE "confirmation_token_hash" = ${tokenHash}
        AND "status" = 'pending'
      RETURNING "id"
    `;

    const subscriber = rows[0];
    if (!subscriber) {
      destination.searchParams.set("confirmation", "invalid");
      return NextResponse.redirect(destination, 303);
    }

    await emitAuditLog({
      action: "admin_action",
      resource: "newsletter_subscription",
      resourceId: subscriber.id,
      metadata: { state: "active", action: "email_confirmed" },
      ipAddress,
      userAgent,
    });

    destination.searchParams.set("confirmation", "confirmed");
    return NextResponse.redirect(destination, 303);
  } catch (error) {
    console.error("[newsletter] confirmation failed", error);
    destination.searchParams.set("confirmation", "unavailable");
    return NextResponse.redirect(destination, 303);
  }
}
