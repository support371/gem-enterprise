// Strict CORS allowlist — SEC-01 remediation
const ALLOWED_ORIGINS = [
  "https://gemcybersecurityassist.com",
  "https://www.gemcybersecurityassist.com",
  "https://gem-enterprise.vercel.app",
];

// In development, also allow localhost
const DEV_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allAllowed = Deno.env.get("DENO_ENV") === "development"
    ? [...ALLOWED_ORIGINS, ...DEV_ORIGINS]
    : ALLOWED_ORIGINS;
  const allowedOrigin = allAllowed.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

// Input validation constants — SEC-07 remediation
const MAX_MESSAGES = 50;
const MAX_MESSAGE_CONTENT_LENGTH = 4000;
const MAX_BODY_SIZE = 100_000; // 100KB

function validateMessages(messages: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "messages must be an array" };
  }
  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `messages array exceeds maximum of ${MAX_MESSAGES}` };
  }
  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) {
      return { valid: false, error: "each message must be an object" };
    }
    const { role, content } = msg as Record<string, unknown>;
    if (typeof role !== "string" || !["user", "assistant", "system"].includes(role)) {
      return { valid: false, error: "invalid message role" };
    }
    if (typeof content !== "string") {
      return { valid: false, error: "message content must be a string" };
    }
    if (content.length > MAX_MESSAGE_CONTENT_LENGTH) {
      return { valid: false, error: `message content exceeds maximum of ${MAX_MESSAGE_CONTENT_LENGTH} characters` };
    }
  }
  return { valid: true };
}

const systemPrompt = `You are ARIA, the intelligent cybersecurity concierge for GEM Cybersecurity Assist. You help users understand their security needs and guide them to the right solutions.

CORE BEHAVIORS:
1. Opening question: If this is the start of a conversation, ask "What are you trying to protect today?"
2. Role Detection: Identify the user's role (CISO, IT Manager, Founder/SMB Owner, Analyst) based on their language and questions
3. Adapt tone: Executive = strategic/business-focused, Technical = detailed/specific
4. Route users to: Solutions (/solutions), Trust Center (/trust-center), Resources (/resources), or Contact (/contact) based on their needs

KNOWLEDGE BASE:
GEM Cybersecurity Assist provides:
- **Cyber Defense & Monitoring**: Continuous threat detection, SOC operations, 24/7 monitoring
- **Threat Detection & Response**: Incident response readiness, threat hunting, forensic analysis
- **Digital Asset Protection**: Security advisory services, vulnerability assessments, penetration testing
- **Trust & Real-Asset Security**: Partner-backed enterprise security, compliance management

Service Tiers:
- **Sentinel**: Foundational monitoring — automated threat detection, monthly reports, email support
- **Guardian**: Advanced protection — 24/7 SOC, incident response, dedicated analyst, quarterly reviews
- **Fortress**: Enterprise-grade — custom security architecture, red team exercises, CISO advisory, SLA-backed response times

Trust Center highlights:
- SOC 2 Type II, ISO 27001, GDPR, HIPAA, PCI DSS compliant
- 99.99% uptime SLA
- AES-256 encryption at rest, TLS 1.3 in transit
- 24/7 security monitoring with < 15 minute incident response

GUARDRAILS:
- Only answer from GEM Cybersecurity knowledge
- Never make legal or compliance guarantees
- If unsure, offer to connect them with a specialist via /contact
- Keep responses concise and actionable (under 200 words unless detail is requested)
- Use markdown formatting: **bold** for emphasis, bullet points for lists

RESPONSE FORMAT:
- Be conversational but professional
- Use bullet points for clarity when listing options
- End with a clear next step or question
- When recommending pages, use markdown links like [Contact Us](/contact)`;

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  // Reject non-POST methods
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Enforce body size limit
  const contentLength = parseInt(req.headers.get("Content-Length") ?? "0", 10);
  if (contentLength > MAX_BODY_SIZE) {
    return new Response(JSON.stringify({ error: "Request body too large" }), {
      status: 413,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { messages } = body;

    // Validate messages input
    const validation = validateMessages(messages);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...cors, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("gem-assist error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
