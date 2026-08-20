import type { AuthRole } from "@/lib/auth";

export type SupportActorType = "client" | "staff" | "system";

export interface SupportThreadMessage {
  id: string;
  message: string;
  actorType: SupportActorType;
  actorId?: string;
  actorRole?: string;
  createdAt: string;
}

export function canAccessSupportTicket(
  role: AuthRole,
  actorId: string,
  ticketOwnerId: string,
) {
  return (
    actorId === ticketOwnerId ||
    role === "analyst" ||
    role === "admin" ||
    role === "super_admin" ||
    role === "internal"
  );
}

export function isSupportStaff(role: AuthRole) {
  return role === "analyst" || role === "admin" || role === "super_admin" || role === "internal";
}

export function parseSupportThreadMessage(input: {
  id: string;
  body: string;
  data: unknown;
  createdAt: Date;
}): SupportThreadMessage | null {
  if (!input.data || typeof input.data !== "object" || Array.isArray(input.data)) return null;
  const data = input.data as Record<string, unknown>;
  if (typeof data.supportTicketId !== "string") return null;
  const actorType = data.actorType;
  if (actorType !== "client" && actorType !== "staff" && actorType !== "system") return null;

  return {
    id: input.id,
    message: input.body,
    actorType,
    actorId: typeof data.actorId === "string" ? data.actorId : undefined,
    actorRole: typeof data.actorRole === "string" ? data.actorRole : undefined,
    createdAt: input.createdAt.toISOString(),
  };
}

export function supportMessageNotificationData(input: {
  ticketId: string;
  actorType: SupportActorType;
  actorId?: string;
  actorRole?: string;
}) {
  return {
    supportTicketId: input.ticketId,
    eventType: "support_message",
    actorType: input.actorType,
    actorId: input.actorId,
    actorRole: input.actorRole,
  };
}
