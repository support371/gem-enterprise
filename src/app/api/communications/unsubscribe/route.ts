import { NextRequest, NextResponse } from "next/server";
import {
  CommunicationGovernanceUnavailableError,
  unsubscribeMarketingEmail,
  verifyMarketingUnsubscribeToken,
} from "@/lib/communications/governance";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function isMailboxOneClickRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/x-www-form-urlencoded")) return false;

  try {
    const params = new URLSearchParams(await request.text());
    return params.get("List-Unsubscribe") === "One-Click";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) return json({ error: "Unsubscribe token is required" }, 400);

  let email: string;
  try {
    ({ email } = verifyMarketingUnsubscribeToken(token));
  } catch (error) {
    console.warn("[communications:unsubscribe] rejected unsubscribe token", error);
    return json({ error: "The unsubscribe link is invalid or expired" }, 400);
  }

  const mailboxOneClick = await isMailboxOneClickRequest(request);

  try {
    await unsubscribeMarketingEmail({
      email,
      method: mailboxOneClick ? "one_click_header" : "signed_link",
    });
    return json({ ok: true, status: "UNSUBSCRIBED" });
  } catch (error) {
    if (error instanceof CommunicationGovernanceUnavailableError) {
      return json({ error: error.message, code: "COMMUNICATION_GOVERNANCE_STORAGE_NOT_READY" }, 503);
    }
    console.error("[communications:unsubscribe] persistence failed", error);
    return json(
      {
        error: "The unsubscribe request could not be recorded. Please retry.",
        code: "UNSUBSCRIBE_PERSISTENCE_FAILED",
      },
      503,
    );
  }
}
