import { NextResponse } from "next/server";
import { isMailDeliveryConfigured } from "@/lib/mail/send";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "gem-password-recovery",
      canonicalResetPage: true,
      resetPageOrigin: "https://www.gemcybersecurityassist.com",
      tokenTransport: "url_fragment",
      emailDeliveryConfigured: isMailDeliveryConfigured(),
      gatewayRecoveryDisabled: true,
      sessionRevocation: "database_password_change_trigger",
      legacyGatewaySessionsAccepted: false,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
