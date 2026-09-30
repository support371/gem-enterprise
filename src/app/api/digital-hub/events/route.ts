import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const eventSchema = z.object({
  event: z.enum(["referral_copy", "referral_open", "wallet_connect_attempt", "wallet_connected"]),
  target: z.string().trim().min(1).max(80),
  path: z.string().trim().max(160).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_EVENT" }, { status: 400 });
  }

  console.info("[digital-hub:event]", {
    ...parsed.data,
    at: new Date().toISOString(),
  });

  return NextResponse.json(
    { ok: true },
    {
      status: 202,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
