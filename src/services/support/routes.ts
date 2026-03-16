import { PlatformUser } from "@/lib/platform";
import {
  postBookingCreate,
  postSupportEscalate,
  postSupportMessage,
  postSupportSessionConsent,
  postSupportSessionStart,
  postTicketCreate,
} from "./api";

export const supportApiRoutes = {
  start: "/api/support/session/start",
  consent: "/api/support/session/consent",
  message: "/api/support/message",
  escalate: "/api/support/escalate",
  ticket: "/api/ticket/create",
  booking: "/api/booking/create",
} as const;

export async function postRoute(path: string, payload: Record<string, string | undefined>, user: PlatformUser) {
  if (path === supportApiRoutes.start) return postSupportSessionStart(user);
  if (path === supportApiRoutes.consent) return postSupportSessionConsent(user, payload.sessionId);
  if (path === supportApiRoutes.message) return postSupportMessage(user, payload.sessionId, payload.content);
  if (path === supportApiRoutes.escalate) return postSupportEscalate(user, payload.sessionId, payload.queueHint);
  if (path === supportApiRoutes.ticket) return postTicketCreate(user, payload.sessionId);
  if (path === supportApiRoutes.booking) return postBookingCreate(user, payload.sessionId);
  throw new Error(`Unsupported route: ${path}`);
}
