import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing runtime configuration");
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TOKEN_HASH_PATTERN = /^[a-f0-9]{64}$/;
const REQUEST_ID_PATTERN = /^aar_[a-f0-9]{32}$/;
const HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const tokenHash =
    typeof body.tokenHash === "string" ? body.tokenHash.toLowerCase() : "";
  const requestId =
    typeof body.requestId === "string" ? body.requestId.toLowerCase() : "";

  if (
    !TOKEN_HASH_PATTERN.test(tokenHash) ||
    !REQUEST_ID_PATTERN.test(requestId)
  ) {
    return json({ active: false, expiresAt: null });
  }

  const { data, error } = await db
    .from("admin_access_tokens")
    .select("expires_at")
    .eq("token_hash", tokenHash)
    .eq("request_id", requestId)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[gem-admin-access-status]", error.message);
    return json({ error: "Authorization verification unavailable" }, 503);
  }

  return json({
    active: Boolean(data),
    expiresAt: data?.expires_at ?? null,
  });
});
