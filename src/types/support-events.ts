// ─── Support Session Events ───────────────────────────────────────────────────

export type SupportEventType =
  | "session_started"
  | "consent_accepted"
  | "message_sent"
  | "message_received"
  | "policy_triggered"
  | "escalation_initiated"
  | "ticket_created"
  | "booking_requested"
  | "session_closed";

export interface SupportEvent {
  type: SupportEventType;
  sessionId: string;
  userId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
