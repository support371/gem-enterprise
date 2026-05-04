import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Strict CORS allowlist — SEC-02 remediation
const ALLOWED_ORIGINS = [
  "https://gemcybersecurityassist.com",
  "https://www.gemcybersecurityassist.com",
  "https://gem-enterprise.vercel.app",
];

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

// Input validation — SEC-06/SEC-07 remediation
const MAX_FIELD_LENGTH = 500;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_BODY_SIZE = 50_000; // 50KB

interface ContactFormData {
  fullName: string;
  email: string;
  company: string;
  role: string;
  topic: string;
  message: string;
}

function sanitizeString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  // Strip control characters and trim
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, maxLength);
}

function validateContactForm(data: unknown): { valid: boolean; error?: string; sanitized?: ContactFormData } {
  if (typeof data !== "object" || data === null) {
    return { valid: false, error: "Invalid request body" };
  }

  const raw = data as Record<string, unknown>;

  const fullName = sanitizeString(raw.fullName, MAX_FIELD_LENGTH);
  const email = sanitizeString(raw.email, MAX_FIELD_LENGTH);
  const company = sanitizeString(raw.company, MAX_FIELD_LENGTH);
  const role = sanitizeString(raw.role, MAX_FIELD_LENGTH);
  const topic = sanitizeString(raw.topic, MAX_FIELD_LENGTH);
  const message = sanitizeString(raw.message, MAX_MESSAGE_LENGTH);

  if (!fullName || !email || !company || !role || !topic || !message) {
    return { valid: false, error: "All fields are required and must be non-empty strings" };
  }

  // Strict email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Validate field lengths
  if (fullName.length < 2) {
    return { valid: false, error: "Full name must be at least 2 characters" };
  }

  return {
    valid: true,
    sanitized: { fullName, email, company, role, topic, message },
  };
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  // Reject non-POST methods
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  // Enforce body size limit
  const contentLength = parseInt(req.headers.get("Content-Length") ?? "0", 10);
  if (contentLength > MAX_BODY_SIZE) {
    return new Response(
      JSON.stringify({ error: "Request body too large" }),
      { status: 413, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  try {
    const rawData = await req.json();

    // Validate and sanitize input
    const validation = validateContactForm(rawData);
    if (!validation.valid || !validation.sanitized) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const data = validation.sanitized;

    // Initialize Supabase client with service role for RLS bypass
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save to database (using sanitized data only)
    const { error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        full_name: data.fullName,
        email: data.email,
        company: data.company,
        role: data.role,
        topic: data.topic,
        message: data.message,
      });

    if (dbError) {
      console.error("Database insert error:", dbError);
      throw new Error("Failed to save submission");
    }

    console.log("Contact form saved:", {
      fullName: data.fullName,
      email: data.email,
      company: data.company,
      topic: data.topic,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, message: "Contact form received successfully" }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process submission" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
