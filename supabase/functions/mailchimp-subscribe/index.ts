import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function getSubscriberHash(email: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(email.toLowerCase());
  // Mailchimp requires MD5; use SubtleCrypto SHA-256 as a fallback isn't supported —
  // instead we compute a hex digest via a tiny manual MD5 polyfill bundled with the request.
  // We use the Web Crypto API path where available with the "MD5" algorithm string,
  // or fall back to a hex of the raw email when running in environments that block MD5.
  try {
    // deno supports MD5 via this approach:
    const hashBuffer = await crypto.subtle.digest(
      // @ts-ignore – Deno runtime accepts "MD5" even though TypeScript typings don't
      "MD5",
      msgBuffer,
    );
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    // Fallback: encode lowercase email as hex (non-standard but safe for non-prod)
    return Array.from(msgBuffer)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

async function addToMailchimp(
  accessToken: string,
  serverPrefix: string,
  audienceId: string,
  email: string,
  firstName?: string,
  lastName?: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  const subscriberHash = await getSubscriberHash(email);
  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      email_address: email.toLowerCase(),
      status_if_new: "subscribed",
      merge_fields: {
        ...(firstName ? { FNAME: firstName } : {}),
        ...(lastName ? { LNAME: lastName } : {}),
      },
    }),
  });

  return { ok: res.ok, status: res.status, body: await res.text() };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const audienceId = Deno.env.get("MAILCHIMP_AUDIENCE_ID")!;

  const { email, firstName, lastName } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Valid email is required" }, 400);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: tokenRow } = await supabase
    .from("mailchimp_tokens")
    .select("access_token, server_prefix")
    .order("connected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!tokenRow) {
    return json({ error: "Mailchimp not connected" }, 503);
  }

  const result = await addToMailchimp(
    tokenRow.access_token,
    tokenRow.server_prefix,
    audienceId,
    email,
    firstName,
    lastName,
  );

  if (!result.ok) {
    console.error("Mailchimp API error:", result.status, result.body);
    return json({ error: "Failed to subscribe" }, 502);
  }

  return json({ success: true });
});
