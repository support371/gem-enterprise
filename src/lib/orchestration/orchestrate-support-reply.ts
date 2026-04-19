import { evaluatePolicy } from "@/lib/policy/evaluate-policy";
import { resolveQueue } from "@/lib/policy/resolve-queue";
import type { SupportSession, OrchestrationResult } from "@/types/support";

// ─── AI Reply Generation ──────────────────────────────────────────────────────
// Uses Claude API if ANTHROPIC_API_KEY is set; falls back to rule-based replies.

async function generateAIReply(
  message: string,
  history: { role: string; content: string }[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return generateFallbackReply(message);
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: `You are GEM Concierge, the AI support assistant for GEM Enterprise — an institutional-grade cybersecurity, financial security, and real estate protection platform.
You assist verified, authenticated clients with account inquiries, product questions, and support needs.
Be concise, professional, and helpful. Do not invent policies. If uncertain, offer to connect the client with a human advisor.
Keep responses to 2-4 sentences unless detail is specifically required.`,
        messages: [
          ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      return generateFallbackReply(message);
    }

    const data = await response.json();
    return data?.content?.[0]?.text ?? generateFallbackReply(message);
  } catch {
    return generateFallbackReply(message);
  }
}

function generateFallbackReply(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("password") || msg.includes("login") || msg.includes("access")) {
    return "For account access issues, I recommend visiting your Security settings or using the password reset flow on the login page. If you continue to have trouble, I can connect you with a human advisor.";
  }
  if (msg.includes("kyc") || msg.includes("verif") || msg.includes("document")) {
    return "Your KYC status and submitted documents can be reviewed in the KYC Status page. If your application is under review, you'll be notified by email when a decision is reached.";
  }
  if (msg.includes("portfolio") || msg.includes("allocation")) {
    return "Portfolio details including holdings and allocations are available in the Portfolios section of your dashboard. For specific allocation changes, please submit a service request.";
  }
  if (msg.includes("report") || msg.includes("statement")) {
    return "Account statements and compliance reports are available in the Documents section of your portal. If you need a specific report not yet available, I can help you submit a request.";
  }
  if (msg.includes("product") || msg.includes("service")) {
    return "Your active products and entitlements are visible in the Products section of your portal. If you'd like to discuss additional services, I can arrange a consultation with an advisor.";
  }
  if (msg.includes("thank")) {
    return "You're welcome. Is there anything else I can help you with today?";
  }

  return "Thank you for your message. I'm here to help with your GEM Enterprise account, products, and services. Could you provide a bit more detail about what you need assistance with?";
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

export async function orchestrateSupportReply(
  message: string,
  session: SupportSession
): Promise<OrchestrationResult> {
  // Policy evaluation (synchronous, runs first)
  const policyResult = evaluatePolicy(message);

  // Build AI-friendly history (last 10 messages to stay within token budget)
  const history = session.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-10)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  // If policy demands escalation, still get a brief reply before handing off
  if (policyResult.shouldEscalate) {
    const queue = resolveQueue({ policyResult, userTier: session.userTier });
    const escalationReply =
      policyResult.path === "escalate" && policyResult.escalationReason === "incident_detected"
        ? "I've detected keywords indicating a potential security incident. I'm escalating this immediately to our Cybersecurity Incident team. A specialist will respond shortly. Please do not take any further action on affected systems until they reach you."
        : "Understood — I'll connect you with a human advisor right away. Please hold while I transfer your session.";

    return {
      reply: escalationReply,
      action: "escalate",
      shouldEscalate: true,
      escalationReason: policyResult.escalationReason,
      queue,
    };
  }

  // Booking path
  if (policyResult.path === "booking") {
    return {
      reply:
        "I can arrange a consultation for you. Please use the 'Book Help' button below to submit your booking request and an advisor will confirm a time within one business day.",
      action: "booking",
      shouldEscalate: false,
    };
  }

  // Billing path
  if (policyResult.path === "billing") {
    const aiReply = await generateAIReply(message, history);
    return {
      reply: aiReply,
      action: "continue",
      shouldEscalate: false,
      queue: "Billing / Accounts",
    };
  }

  // Default — continue conversation with AI
  const reply = await generateAIReply(message, history);
  return { reply, action: "continue", shouldEscalate: false };
}
