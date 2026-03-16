export type Actor = "user" | "ai" | "system";

export type QueueName =
  | "General Member Support"
  | "Premium Member Support"
  | "VIP Concierge"
  | "Billing / Accounts"
  | "Technical Support"
  | "Cybersecurity / Incident"
  | "Consultation Scheduling";

export type SupportStatus = "idle" | "active" | "escalating" | "resolved";

export interface SupportMessage {
  id: string;
  actor: Actor;
  content: string;
  createdAt: string;
}

export interface SupportSession {
  id: string;
  userId: string;
  consented: boolean;
  status: SupportStatus;
  queue: QueueName | null;
  handoffReference: string | null;
  messages: SupportMessage[];
}

export interface SupportReply {
  assistantText: string;
  escalated: boolean;
  queue: QueueName;
  bookingSuggested?: boolean;
}
