import { NextRequest, NextResponse } from "next/server";
import {
  CommunicationGovernanceUnavailableError,
  setCommunicationPreference,
  verifyMarketingUnsubscribeToken,
} from "@/lib/communications/governance";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) return json({ error: "Unsubscribe token is required" }, 400);

  try {
    const { email } = verifyMarketingUnsubscribeToken(token);
    await setCommunicationPreference({
      channel: "EMAIL",
      destination: email,
      purpose: "MARKETING",
      status: "BLOCKED",
      source: "recipient_unsubscribe",
      eventType: "UNSUBSCRIBED",
      eventEvidence: {
        method: request.headers.get("list-unsubscribe-post") ? "one_click_header" : "signed_link",
      },
    });
    return json({ ok: true, status: "UNSUBSCRIBED" });
  } catch (error) {
    if (error instanceof CommunicationGovernanceUnavailableError) {
      return json({ error: error.message, code: "COMMUNICATION_GOVERNANCE_STORAGE_NOT_READY" }, 503);
    }
    console.warn("[communications:unsubscribe] rejected unsubscribe token", error);
    return json({ error: "The unsubscribe link is invalid or expired" }, 400);
  }
}
