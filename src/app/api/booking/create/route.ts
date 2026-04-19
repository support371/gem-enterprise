import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supportStore } from "@/lib/support/store-instance";
import { createSupportBooking } from "@/lib/support/create-booking";
import { z } from "zod";

const schema = z.object({
  sessionId: z.string().min(1),
  type: z.enum(["consultation", "advisory", "technical"]).optional(),
  notes: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  const auth = await getSession();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const session = await supportStore.getSession(parsed.data.sessionId);
  if (!session || session.userId !== auth.userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const booking = await createSupportBooking({
      sessionId: parsed.data.sessionId,
      userId: auth.userId,
      type: parsed.data.type,
      notes: parsed.data.notes,
    });

    if (!booking) {
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: `Booking ${booking.id} has been requested. An advisor will confirm your appointment within one business day.`,
    });
  } catch (err) {
    console.error("[booking/create]", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
