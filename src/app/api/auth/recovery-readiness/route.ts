import { NextResponse } from "next/server";
import { getMailDeliveryReadiness } from "@/lib/mail/send";

export async function GET() {
  const emailDelivery = getMailDeliveryReadiness();

  return NextResponse.json(
    {
      ok: true,
      service: "gem-password-recovery",
      canonicalResetPage: true,
      resetPageOrigin: "https://www.gemcybersecurityassist.com",
      tokenTransport: "url_fragment",
      emailDeliveryConfigured: emailDelivery.configured,
      emailDelivery: {
        missingVariables: emailDelivery.missing,
        portValid: emailDelivery.portValid,
        secureSettingValid: emailDelivery.secureSettingValid,
        senderConfigured: emailDelivery.senderConfigured,
        replyToConfigured: emailDelivery.replyToConfigured,
        transportSecurity: emailDelivery.transportSecurity,
        transportVerification: "on_demand",
        verificationRequiresAdmin: true,
      },
      gatewayRecoveryDisabled: true,
      sessionRevocation: "database_password_change_trigger",
      legacyGatewaySessionsAccepted: false,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
