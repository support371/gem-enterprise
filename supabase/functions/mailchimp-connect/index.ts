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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientId = Deno.env.get("MAILCHIMP_CLIENT_ID")!;
  const clientSecret = Deno.env.get("MAILCHIMP_CLIENT_SECRET")!;
  const appBaseUrl = Deno.env.get("APP_BASE_URL")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const redirectUri = `${appBaseUrl}/dashboard`;

  // GET: return connection status and the OAuth authorization URL
  if (req.method === "GET") {
    const { data } = await supabase
      .from("mailchimp_tokens")
      .select("connected_at, server_prefix")
      .order("connected_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const authUrl =
      `https://login.mailchimp.com/oauth2/authorize?response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return json({ connected: !!data, connectedAt: data?.connected_at, authUrl });
  }

  // POST: exchange OAuth code for access token
  if (req.method === "POST") {
    const { code } = await req.json();
    if (!code) return json({ error: "Missing code" }, 400);

    const tokenRes = await fetch("https://login.mailchimp.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Token exchange error:", err);
      return json({ error: "Failed to exchange OAuth code" }, 502);
    }

    const { access_token } = await tokenRes.json();

    // Fetch the Mailchimp API endpoint metadata (includes data center prefix)
    const metaRes = await fetch("https://login.mailchimp.com/oauth2/metadata", {
      headers: { Authorization: `OAuth ${access_token}` },
    });

    if (!metaRes.ok) {
      return json({ error: "Failed to fetch Mailchimp metadata" }, 502);
    }

    const { dc: serverPrefix } = await metaRes.json();

    // Replace any existing token with the new one
    await supabase.from("mailchimp_tokens").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const { error } = await supabase.from("mailchimp_tokens").insert({ access_token, server_prefix: serverPrefix });

    if (error) {
      console.error("DB insert error:", error);
      return json({ error: "Failed to store token" }, 500);
    }

    return json({ success: true, serverPrefix });
  }

  // DELETE: disconnect Mailchimp
  if (req.method === "DELETE") {
    await supabase.from("mailchimp_tokens").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    return json({ success: true });
  }

  return json({ error: "Method not allowed" }, 405);
});
