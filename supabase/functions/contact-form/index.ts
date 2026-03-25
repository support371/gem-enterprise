import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function computeSubscriberHash(email: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(email.toLowerCase());
  try {
    // @ts-ignore – Deno runtime accepts "MD5"
    const hashBuffer = await crypto.subtle.digest("MD5", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return Array.from(msgBuffer)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  fullName: string;
  email: string;
  company: string;
  role: string;
  topic: string;
  message: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ContactFormData = await req.json();

    // Validate required fields
    if (!data.fullName || !data.email || !data.company || !data.role || !data.topic || !data.message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role for RLS bypass
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save to database
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

    // Subscribe contact to Mailchimp audience (best-effort; doesn't block the response)
    const audienceId = Deno.env.get("MAILCHIMP_AUDIENCE_ID");
    if (audienceId) {
      const { data: tokenRow } = await supabase
        .from("mailchimp_tokens")
        .select("access_token, server_prefix")
        .order("connected_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tokenRow) {
        const [firstName, ...rest] = data.fullName.trim().split(" ");
        const lastName = rest.join(" ");
        const subscriberHash = await computeSubscriberHash(data.email);
        const mcUrl =
          `https://${tokenRow.server_prefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`;

        await fetch(mcUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenRow.access_token}`,
          },
          body: JSON.stringify({
            email_address: data.email.toLowerCase(),
            status_if_new: "subscribed",
            merge_fields: {
              FNAME: firstName,
              ...(lastName ? { LNAME: lastName } : {}),
            },
          }),
        }).catch((err) => console.error("Mailchimp subscribe error:", err));
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Contact form received successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process submission" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
