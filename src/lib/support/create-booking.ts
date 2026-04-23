import { randomUUID } from "crypto";
import { supportStore } from "./store-instance";
import type { SupportBooking } from "@/types/support";

export interface CreateBookingInput {
  sessionId: string;
  userId: string;
  type?: SupportBooking["type"];
  notes?: string;
}

export async function createSupportBooking(
  input: CreateBookingInput
): Promise<SupportBooking | null> {
  const session = await supportStore.getSession(input.sessionId);
  if (!session) return null;

  const booking: SupportBooking = {
    id: `BKG-${randomUUID().slice(0, 8).toUpperCase()}`,
    sessionId: input.sessionId,
    userId: input.userId,
    type: input.type ?? "consultation",
    notes: input.notes ?? "",
    status: "requested",
    createdAt: new Date().toISOString(),
  };

  await supportStore.createBooking(booking);
  await supportStore.updateSession(input.sessionId, {
    status: "booking_requested",
    bookingId: booking.id,
  });

  return booking;
}
