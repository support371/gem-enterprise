// ─── API Request / Response Contracts ─────────────────────────────────────────

export interface StartSessionRequest {
  // userId and email are resolved from session on the server
}

export interface StartSessionResponse {
  sessionId: string;
  status: string;
  requiresConsent: boolean;
}

export interface ConsentRequest {
  sessionId: string;
  accepted: boolean;
}

export interface ConsentResponse {
  success: boolean;
  greeting: string;
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
}

export interface SendMessageResponse {
  messageId: string;
  reply: string;
  action?: "continue" | "escalate" | "booking" | "billing";
  shouldEscalate: boolean;
}

export interface EscalateRequest {
  sessionId: string;
  reason?: string;
}

export interface EscalateResponse {
  success: boolean;
  queue: string;
  atlassianIssueKey?: string;
  message: string;
}

export interface CreateTicketRequest {
  sessionId: string;
  subject: string;
  description: string;
  priority?: "low" | "medium" | "high" | "critical";
}

export interface CreateTicketResponse {
  success: boolean;
  ticketId: string;
  message: string;
}

export interface CreateBookingRequest {
  sessionId: string;
  type?: "consultation" | "advisory" | "technical";
  notes?: string;
}

export interface CreateBookingResponse {
  success: boolean;
  bookingId: string;
  message: string;
}

export interface ApiError {
  error: string;
  code?: string;
}
